require "net/http"
require "json"

# Fetches KJV text from the Free Use Bible API (https://bible.helloao.org).
# Returns the same hash shape as ScriptureScraper#fetch.
class ScriptureApiClient
  include ScriptureReference

  BASE_URL = "https://bible.helloao.org/api/eng_kjv".freeze
  USER_AGENT = "WorshipSlides/1.0".freeze
  TIMEOUT = 10
  PILCROW = "¶".freeze

  BOOK_ALIASES = {
    "song of songs" => "SNG",
    "canticles" => "SNG",
    "revelations" => "REV"
  }.freeze

  @@book_index = nil
  @@mutex = Mutex.new

  def fetch(reference)
    parsed = parse_reference(reference)
    raise not_found(reference) unless parsed[:chapter]

    book_id = resolve_book_id(parsed[:book], reference)
    raise not_found(reference) unless book_id

    segments = parse_verse_spec(parsed[:chapter], parsed[:verse_spec])
    raise not_found(reference) unless segments

    verses = []
    paragraphs = []
    current = nil
    previous_chapter = nil

    segments.each do |segment|
      chapter_verses(book_id, segment[:chapter], reference).each do |item|
        number = item["number"]
        next if segment[:from] && number < segment[:from]
        next if segment[:to] && number > segment[:to]

        raw = verse_text(item)
        text = raw.delete(PILCROW).squish
        next if text.empty?

        if current.nil? || raw.start_with?(PILCROW) || segment[:chapter] != previous_chapter
          paragraphs << current.join(" ") if current
          current = []
        end
        previous_chapter = segment[:chapter]

        verses << { "number" => number, "text" => text }
        current << text
      end
    end
    paragraphs << current.join(" ") if current

    raise not_found(reference) if verses.empty?

    {
      "book" => parsed[:book],
      "chapter" => parsed[:chapter],
      "verse_spec" => parsed[:verse_spec],
      "verses" => verses,
      "paragraphs" => paragraphs,
      "full_text" => verses.map { |v| v["text"] }.join(" "),
      "display_reference" => build_display_reference(parsed)
    }
  end

  def self.reset_cache!
    @@mutex.synchronize { @@book_index = nil }
  end

  private

  def not_found(reference)
    "Could not find passage text for '#{reference}'"
  end

  # Returns [{ chapter:, from:, to: }] (nil from/to = open-ended), or nil if unparseable.
  #   nil        -> whole chapter
  #   "16"       -> single verse
  #   "16-18"    -> range
  #   "36-4:2"   -> cross-chapter range
  #   "16, 18-20" -> union of segments within the chapter
  def parse_verse_spec(chapter, verse_spec)
    return [ { chapter: chapter, from: nil, to: nil } ] if verse_spec.nil?

    parts = verse_spec.tr("–—", "--").gsub(/\s+/, "").split(",")
    return nil if parts.empty?

    parts.each_with_object([]) do |part, segments|
      case part
      when /\A(\d+)\z/
        segments << { chapter: chapter, from: $1.to_i, to: $1.to_i }
      when /\A(\d+)-(\d+)\z/
        from, to = $1.to_i, $2.to_i
        return nil if from > to
        segments << { chapter: chapter, from: from, to: to }
      when /\A(\d+)-(\d+):(\d+)\z/
        from, end_chapter, to = $1.to_i, $2.to_i, $3.to_i
        if end_chapter == chapter
          return nil if from > to
          segments << { chapter: chapter, from: from, to: to }
        else
          return nil if end_chapter < chapter
          segments << { chapter: chapter, from: from, to: nil }
          (chapter + 1...end_chapter).each { |c| segments << { chapter: c, from: nil, to: nil } }
          segments << { chapter: end_chapter, from: nil, to: to }
        end
      else
        return nil
      end
    end
  end

  def chapter_verses(book_id, chapter, reference)
    @chapters ||= {}
    @chapters[[ book_id, chapter ]] ||= begin
      content = Rails.cache.fetch([ "helloao", "eng_kjv", book_id, chapter ], expires_in: 30.days) do
        get_json("#{book_id}/#{chapter}.json", reference).dig("chapter", "content")
      end
      Array(content).select { |item| item["type"] == "verse" }
    end
  end

  # Verse content parts: plain strings, { "text" => ... } (poetry / words of Jesus),
  # { "lineBreak" => true }, or footnote refs ({ "noteId" => n }) which are dropped.
  def verse_text(item)
    Array(item["content"]).filter_map do |part|
      case part
      when String then part
      when Hash
        if part["text"].is_a?(String)
          part["text"]
        elsif part["lineBreak"]
          " "
        end
      end
    end.join(" ").squish
  end

  def resolve_book_id(name, reference)
    key = normalize_book_name(name)
    book_index(reference)[key] || BOOK_ALIASES[key]
  end

  def book_index(reference)
    @@mutex.synchronize do
      @@book_index ||= begin
        books = get_json("books.json", reference).fetch("books")
        books.each_with_object({}) do |book, index|
          index[book["id"].downcase] = book["id"]
          [ book["name"], book["commonName"] ].compact.each do |book_name|
            index[normalize_book_name(book_name)] = book["id"]
          end
        end
      end
    end
  end

  def normalize_book_name(name)
    normalized = name.to_s.downcase.squish.delete_suffix(".").strip
    normalized = normalized.sub(/\A(iii|ii|i)\s+/) { "#{{ "i" => 1, "ii" => 2, "iii" => 3 }[$1]} " }
    normalized = "psalms" if normalized == "psalm"
    normalized
  end

  def get_json(path, reference)
    uri = URI("#{BASE_URL}/#{path}")
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true,
                               open_timeout: TIMEOUT, read_timeout: TIMEOUT) do |http|
      http.get(uri.request_uri, "User-Agent" => USER_AGENT)
    end

    case response
    when Net::HTTPSuccess then JSON.parse(response.body)
    when Net::HTTPNotFound then raise not_found(reference)
    else raise "Scripture API error (#{response.code}) for '#{reference}'"
    end
  end
end
