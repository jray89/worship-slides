class SlideRenderer
  MAX_CHARS_PER_LINE = 72
  MAX_LINES_PER_PAGE = 8

  def render_service(service)
    pages = []

    service.slides.each do |slide|
      pages.concat(render_slide(slide))
    end

    pages
  end

  private

  def render_slide(slide)
    case slide.slide_type
    when "welcome"
      [ { slide_type: "welcome", content: {} } ]
    when "closing"
      [ { slide_type: "closing", content: {} } ]
    when "psalm"
      render_psalm(slide)
    when "scripture"
      render_scripture(slide)
    when "key_verse"
      render_key_verse(slide)
    else
      []
    end
  end

  def render_psalm(slide)
    data = slide.content_data
    return [] unless data

    stanzas = data["stanzas"] || []
    reference = if slide.verse_start && slide.verse_end
      "Psalm #{slide.psalm_number}:#{slide.verse_start}-#{slide.verse_end}"
    else
      "Psalm #{slide.psalm_number}"
    end

    stanzas.map do |stanza|
      {
        slide_type: "psalm",
        content: {
          reference: reference,
          stanza: {
            lines: stanza["lines"],
            # Normalize: old DB data may have array format, new has hash format
            verse_numbers: stanza["verse_numbers"].is_a?(Hash) ? stanza["verse_numbers"] : {}
          }
        }
      }
    end
  end

  def render_scripture(slide)
    data = slide.content_data
    return [] unless data

    reference = data["display_reference"] || slide.scripture_reference
    full_text = data["full_text"] || ""

    paginate_text(full_text).map do |page_text|
      {
        slide_type: "scripture",
        content: {
          reference: reference,
          text: page_text
        }
      }
    end
  end

  def render_key_verse(slide)
    data = slide.content_data
    return [] unless data

    reference = data["display_reference"] || slide.scripture_reference
    text = data["full_text"] || data.dig("verses", 0, "text") || ""

    [ {
      slide_type: "key_verse",
      content: {
        reference: reference,
        text: text
      }
    } ]
  end

  def paginate_text(full_text)
    words = full_text.split
    pages = []
    current_lines = []
    current_line = ""

    words.each do |word|
      test = current_line.empty? ? word : "#{current_line} #{word}"

      if test.length > MAX_CHARS_PER_LINE
        current_lines << current_line unless current_line.empty?
        current_line = word

        if current_lines.length >= MAX_LINES_PER_PAGE
          pages << current_lines.join(" ")
          current_lines = []
        end
      else
        current_line = test
      end
    end

    current_lines << current_line unless current_line.empty?
    pages << current_lines.join(" ") unless current_lines.empty?

    pages
  end
end
