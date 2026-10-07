require "test_helper"

class SlideRendererTest < ActiveSupport::TestCase
  setup do
    @service = users(:jay).services.create!(service_date: "2026-10-04")
    @renderer = SlideRenderer.new
  end

  test "renders simple slides with empty content in position order" do
    %w[welcome private_prayer blank closing].each { |type| add_slide(slide_type: type) }

    pages = @renderer.render_service(@service.reload)

    assert_equal %w[welcome private_prayer blank closing], pages.map { |p| p[:slide_type] }
    assert pages.all? { |p| p[:content] == {} }
  end

  test "skips slides of an unknown type" do
    slide = add_slide(slide_type: "welcome")
    slide.update_column(:slide_type, "mystery")

    assert_empty @renderer.render_service(@service.reload)
  end

  test "psalm slide without content renders nothing" do
    add_slide(slide_type: "psalm", psalm_number: 23)

    assert_empty @renderer.render_service(@service.reload)
  end

  test "psalm slides carry a verse-range reference and one page per stanza" do
    add_slide(slide_type: "psalm", psalm_number: 23, verse_start: 1, verse_end: 3, content_data: {
      "stanzas" => [
        { "lines" => %w[a b c d], "verse_numbers" => { "0" => 1 } },
        { "lines" => %w[e f], "verse_numbers" => nil }
      ]
    })

    pages = @renderer.render_service(@service.reload)

    assert_equal 2, pages.size
    assert_equal "Psalm 23:1-3", pages.first.dig(:content, :reference)
    assert_equal %w[a b c d], pages.first.dig(:content, :stanza, :lines)
    assert_equal({ "0" => 1 }, pages.first.dig(:content, :stanza, :verse_numbers))
    assert_equal({}, pages.last.dig(:content, :stanza, :verse_numbers))
  end

  test "psalm reference without a verse range is just the psalm number" do
    add_slide(slide_type: "psalm", psalm_number: 100, content_data: { "stanzas" => [ { "lines" => [ "x" ] } ] })

    assert_equal "Psalm 100", @renderer.render_service(@service.reload).first.dig(:content, :reference)
  end

  test "long psalm stanzas are split into four-line chunks with re-indexed verse numbers" do
    lines = (1..9).map { |i| "line #{i}" }
    add_slide(slide_type: "psalm", psalm_number: 119, content_data: {
      "stanzas" => [ { "lines" => lines, "verse_numbers" => { "0" => 1, "5" => 2, "8" => 3 } } ]
    })

    pages = @renderer.render_service(@service.reload)
    stanzas = pages.map { |p| p.dig(:content, :stanza) }

    assert_equal [ 4, 4, 1 ], stanzas.map { |s| s[:lines].size }
    assert_equal({ "0" => 1 }, stanzas[0][:verse_numbers])
    assert_equal({ "1" => 2 }, stanzas[1][:verse_numbers])
    assert_equal({ "0" => 3 }, stanzas[2][:verse_numbers])
  end

  test "scripture slides paginate paragraphs with a blank line between them" do
    add_slide(slide_type: "scripture", scripture_reference: "john 3:16", content_data: {
      "display_reference" => "John 3:16",
      "paragraphs" => [ "First paragraph.", "Second paragraph." ]
    })

    pages = @renderer.render_service(@service.reload)

    assert_equal 1, pages.size
    assert_equal "John 3:16", pages.first.dig(:content, :reference)
    assert_equal [ "First paragraph.", "", "Second paragraph." ], pages.first.dig(:content, :text)
  end

  test "scripture paragraphs overflow onto new pages at eight lines" do
    long = ([ "word" ] * 100).join(" ") # wraps to 8 lines of 68 chars
    add_slide(slide_type: "scripture", scripture_reference: "Ps 1", content_data: {
      "paragraphs" => [ long, "Short tail.", "Another." ]
    })

    pages = @renderer.render_service(@service.reload).map { |p| p.dig(:content, :text) }

    assert pages.all? { |lines| lines.size <= SlideRenderer::MAX_LINES_PER_PAGE }
    assert pages.flatten.all? { |line| line.length <= SlideRenderer::MAX_CHARS_PER_LINE }
    assert_equal "Short tail.", pages.last.reject(&:empty?).first
    assert_equal "Another.", pages.last.last
    assert_equal "Ps 1", @renderer.render_service(@service).first.dig(:content, :reference)
  end

  test "a blank separator line that fills a page starts a new page" do
    seven_lines = ([ "word" ] * 85).join(" ")
    add_slide(slide_type: "scripture", scripture_reference: "Ps 1", content_data: {
      "paragraphs" => [ seven_lines, "Next." ]
    })

    pages = @renderer.render_service(@service.reload).map { |p| p.dig(:content, :text) }

    assert_equal 2, pages.size
    assert_equal "", pages.first.last
    assert_equal [ "Next." ], pages.last
  end

  test "scripture without paragraphs falls back to paginating the full text" do
    add_slide(slide_type: "scripture", scripture_reference: "Ps 1", content_data: {
      "full_text" => ([ "lorem" ] * 120).join(" ")
    })

    pages = @renderer.render_service(@service.reload).map { |p| p.dig(:content, :text) }

    assert_equal 2, pages.size
    assert_equal SlideRenderer::MAX_LINES_PER_PAGE, pages.first.size
    assert_equal 120, pages.flatten.join(" ").split.size
  end

  test "scripture with no text renders nothing" do
    add_slide(slide_type: "scripture", scripture_reference: "Ps 1", content_data: {})

    assert_empty @renderer.render_service(@service.reload)
  end

  test "key verse uses full text, falling back to the first verse" do
    add_slide(slide_type: "key_verse", scripture_reference: "John 3:16",
      content_data: { "full_text" => "For God so loved", "display_reference" => "John 3:16 (KJV)" })
    add_slide(slide_type: "key_verse", scripture_reference: "John 1:1",
      content_data: { "verses" => [ { "text" => "In the beginning" } ] })
    add_slide(slide_type: "key_verse", scripture_reference: "Gen 1:1", content_data: {})
    add_slide(slide_type: "key_verse", scripture_reference: "Gen 1:2")

    pages = @renderer.render_service(@service.reload)

    assert_equal [ "For God so loved", "In the beginning", "" ], pages.map { |p| p.dig(:content, :text) }
    assert_equal [ "John 3:16 (KJV)", "John 1:1", "Gen 1:1" ], pages.map { |p| p.dig(:content, :reference) }
  end

  private

  def add_slide(**attrs)
    @service.slides.create!(**attrs)
  end
end
