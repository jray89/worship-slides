require "open-uri"
require "nokogiri"
require "cgi"

class ScriptureScraper
  def fetch(reference)
    encoded = CGI.escape(reference)
    url = "https://www.biblegateway.com/passage/?search=#{encoded}&version=AKJV"
    doc = Nokogiri::HTML(URI.open(url, "User-Agent" => "WorshipSlides/1.0"))

    passage = doc.css(".passage-text").first
    raise "Could not find passage text for '#{reference}'" unless passage

    # Remove footnotes, cross-references, and headings
    passage.css(".footnote, .footnotes, .crossreference, .crossrefs, .full-chap-link, .passage-other-trans, .publisher-info-bottom").each(&:remove)
    passage.css("h3, h4").each(&:remove)  # Section headings
    passage.css("sup.crossreference, sup.footnote").each(&:remove)

    verses = []
    paragraphs = []

    passage.css("p").each do |para|
      para_verses = []

      para.css(".text").each do |text_el|
        verse_number = nil

        chapternum_el = text_el.css(".chapternum").first
        if chapternum_el
          verse_number = 1
          chapternum_el.remove
        end

        versenum_el = text_el.css(".versenum").first
        if versenum_el
          num_text = versenum_el.text.strip.gsub(/\D/, "")
          verse_number = num_text.to_i if num_text.present?
          versenum_el.remove
        end

        text = text_el.text.strip
        next if text.empty?

        para_verses << { "number" => verse_number, "text" => text }
      end

      next if para_verses.empty?

      verses.concat(para_verses)
      paragraphs << para_verses.map { |v| v["text"] }.join(" ")
    end

    # Parse book and chapter from the reference
    parsed = parse_reference(reference)

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

  private

  def parse_reference(reference)
    # Handle references like "Titus 2", "Titus 2:1", "1 John 3:16-17", "Numbers 14:1-10"
    if reference.match(/\A(.+?)\s+(\d+)(?::(.+))?\z/)
      { book: $1, chapter: $2.to_i, verse_spec: $3 }
    else
      { book: reference, chapter: nil, verse_spec: nil }
    end
  end

  def build_display_reference(parsed)
    ref = "#{parsed[:book]} #{parsed[:chapter]}"
    ref += ":#{parsed[:verse_spec]}" if parsed[:verse_spec]
    ref
  end
end
