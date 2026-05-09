require "net/http"
require "nokogiri"

class PsalmScraper
  CENTERED_P = "p.text-center, p[style*='center']"

  HEADERS = {
    "User-Agent" => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language" => "en-US,en;q=0.9"
  }.freeze

  def fetch(psalm_number)
    doc = fetch_page("https://thewestminsterstandard.org/psalm-#{psalm_number}/")

    result = {}

    # Check for tabbed versions (First/Second)
    first_tab = doc.css("#tab-first-version")
    second_tab = doc.css("#tab-second-version")

    if first_tab.any?
      result["first"] = parse_stanzas_from(first_tab.first)
      result["second"] = parse_stanzas_from(second_tab.first) if second_tab.any?
    else
      # Single version — find the first .wpb_wrapper with enough psalm paragraphs
      doc.css(".wpb_wrapper").each do |wrapper|
        paragraphs = wrapper.css(CENTERED_P)
        if paragraphs.length >= 2
          result["first"] = parse_stanzas_from(wrapper)
          break
        end
      end
    end

    raise "Could not find psalm content for Psalm #{psalm_number} — the source site may be blocking this request" if result.empty?

    result
  end

  private

  def fetch_page(url, redirect_limit = 3)
    raise "Too many redirects fetching psalm" if redirect_limit == 0

    uri = URI(url)
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 10, read_timeout: 15) do |http|
      request = Net::HTTP::Get.new(uri)
      HEADERS.each { |k, v| request[k] = v }
      http.request(request)
    end

    case response
    when Net::HTTPSuccess
      Nokogiri::HTML(response.body)
    when Net::HTTPRedirection
      fetch_page(response["location"], redirect_limit - 1)
    else
      raise "Failed to fetch psalm: HTTP #{response.code}"
    end
  end

  def parse_stanzas_from(container)
    container.css(CENTERED_P).filter_map { |p| parse_stanza(p) }
  end

  def parse_stanza(p)
    # Split the paragraph HTML by <br> to get one segment per line.
    # Each segment may start with a verse number marker.
    raw_segments = p.inner_html.split(/<br\s*\/?>/)

    lines = []
    # verse_numbers is a hash: line_index => verse_number
    verse_numbers = {}

    raw_segments.each_with_index do |segment, i|
      frag = Nokogiri::HTML.fragment(segment)

      # Extract verse number from the start of this segment.
      # Two patterns exist on the site:
      #   Pattern A (e.g. Psalm 71): <sup><b>15</b></sup>  — whole stanza marker
      #   Pattern B (e.g. Psalm 23): <strong><sup>2 </sup></strong> — per-line marker
      verse_num = extract_verse_number!(frag)
      verse_numbers[i] = verse_num if verse_num

      text = frag.text.strip
      lines << text unless text.empty?
    end

    return nil if lines.empty?

    { "lines" => lines, "verse_numbers" => verse_numbers }
  end

  # Removes the verse-number element from the fragment and returns the number,
  # or nil if no verse number is present.
  def extract_verse_number!(frag)
    # Pattern A: <sup><b>N</b></sup> or <sup><strong>N</strong></sup>
    el = frag.at_css("sup b, sup strong")
    if el
      num = el.text.strip.to_i
      el.parent.remove   # remove <sup>
      return num > 0 ? num : nil
    end

    # Pattern B: <strong><sup>N</sup></strong> or <b><sup>N</sup></b>
    el = frag.at_css("strong sup, b sup")
    if el
      num = el.text.strip.to_i
      el.parent.remove   # remove <strong>/<b>
      return num > 0 ? num : nil
    end

    nil
  end
end
