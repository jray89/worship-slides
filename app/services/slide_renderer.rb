class SlideRenderer
  MAX_CHARS_PER_LINE = 68
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
    paragraphs = data["paragraphs"]

    pages = if paragraphs.present?
      paginate_paragraphs(paragraphs)
    else
      paginate_text(data["full_text"] || "")
    end

    pages.map do |lines|
      {
        slide_type: "scripture",
        content: { reference: reference, text: lines }
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

  def paginate_paragraphs(paragraphs)
    pages = []
    current_lines = []

    paragraphs.each_with_index do |para_text, para_idx|
      # Add blank line between paragraphs (not before the first)
      if para_idx > 0 && current_lines.any?
        if current_lines.length >= MAX_LINES_PER_PAGE
          pages << current_lines.dup
          current_lines = []
        else
          current_lines << ""
        end
      end

      # Wrap the paragraph text into lines
      para_lines = wrap_text(para_text)

      para_lines.each do |line|
        current_lines << line
        if current_lines.length >= MAX_LINES_PER_PAGE
          pages << current_lines.dup
          current_lines = []
        end
      end
    end

    pages << current_lines unless current_lines.empty?
    pages
  end

  def wrap_text(text)
    words = text.split
    lines = []
    current = ""
    words.each do |word|
      test = current.empty? ? word : "#{current} #{word}"
      if test.length > MAX_CHARS_PER_LINE
        lines << current unless current.empty?
        current = word
      else
        current = test
      end
    end
    lines << current unless current.empty?
    lines
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
          pages << current_lines.dup
          current_lines = []
        end
      else
        current_line = test
      end
    end

    current_lines << current_line unless current_line.empty?
    pages << current_lines.dup unless current_lines.empty?

    pages
  end
end
