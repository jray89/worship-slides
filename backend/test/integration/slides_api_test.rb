require "test_helper"

class SlidesApiTest < ActionDispatch::IntegrationTest
  HELLOAO = "https://bible.helloao.org/api/eng_kjv".freeze
  FIXTURES = Rails.root.join("test", "fixtures", "files", "helloao")

  setup do
    @service = users(:jay).services.create!(service_date: "2026-10-04")
    ScriptureApiClient.reset_cache!
  end

  teardown { ScriptureApiClient.reset_cache! }

  test "lists slides in position order" do
    a = @service.slides.create!(slide_type: "welcome")
    b = @service.slides.create!(slide_type: "closing")
    b.move_to_top

    get "/api/services/#{@service.id}/slides", headers: auth_headers

    assert_response :success
    assert_equal [ b.id, a.id ], response.parsed_body.map { |s| s["id"] }
  end

  test "psalm slide stores only the stanzas within the verse range" do
    create_slide(slide_type: "psalm", psalm_number: 23, verse_start: 3, verse_end: 4)

    assert_response :created
    stanzas = response.parsed_body.dig("content_data", "stanzas")
    assert_equal "first", response.parsed_body.dig("content_data", "version")
    assert_equal [ [ 3 ], [ 4 ] ], stanzas.map { |s| s["verse_numbers"].values }
  end

  test "psalm slide without a verse range stores the whole psalm" do
    create_slide(slide_type: "psalm", psalm_number: 23)

    assert_response :created
    assert_operator response.parsed_body.dig("content_data", "stanzas").size, :>, 2
  end

  test "an unknown psalm is reported as an error" do
    create_slide(slide_type: "psalm", psalm_number: 999)

    assert_response :unprocessable_entity
    assert_match "Psalm 999", response.parsed_body["error"]
  end

  test "scripture slide fetches text and pre-paginates it" do
    stub_scripture("JHN", 3)

    create_slide(slide_type: "scripture", scripture_reference: "John 3:16-18")

    assert_response :created
    data = response.parsed_body["content_data"]
    assert_equal "John 3:16-18", data["display_reference"]
    assert data["pages"].flatten.join(" ").start_with?("For God so loved the world")
  end

  test "key verse slide fetches text without paginating" do
    stub_scripture("JHN", 3)

    create_slide(slide_type: "key_verse", scripture_reference: "John 3:16")

    assert_response :created
    assert_nil response.parsed_body.dig("content_data", "pages")
  end

  test "updates a slide and rejects invalid changes" do
    slide = @service.slides.create!(slide_type: "welcome")

    patch slide_path(slide), headers: auth_headers, as: :json, params: { slide: { slide_type: "closing" } }
    assert_response :success
    assert_equal "closing", slide.reload.slide_type

    patch slide_path(slide), headers: auth_headers, as: :json, params: { slide: { slide_type: "bogus" } }
    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"], "Slide type is not included in the list"
  end

  test "deletes a slide" do
    slide = @service.slides.create!(slide_type: "welcome")

    assert_difference -> { @service.slides.count }, -1 do
      delete slide_path(slide), headers: auth_headers
    end
    assert_response :no_content
  end

  test "moves a slide down or to an explicit position" do
    a, b, c = %w[welcome blank closing].map { |t| @service.slides.create!(slide_type: t) }

    patch "#{slide_path(a)}/move", headers: auth_headers, as: :json, params: { direction: "down" }
    assert_equal [ b, a, c ].map(&:id), @service.slides.reload.map(&:id)

    patch "#{slide_path(c)}/move", headers: auth_headers, as: :json, params: { position: 1 }
    assert_response :success
    assert_equal [ c, b, a ].map(&:id), @service.slides.reload.map(&:id)
  end

  test "cannot touch a slide belonging to another service" do
    theirs = users(:other).services.create!(service_date: "2026-10-04").slides.create!(slide_type: "welcome")

    delete "/api/services/#{@service.id}/slides/#{theirs.id}", headers: auth_headers

    assert_response :not_found
    assert Slide.exists?(theirs.id)
  end

  private

  def create_slide(**attrs)
    post "/api/services/#{@service.id}/slides", headers: auth_headers, as: :json, params: { slide: attrs }
  end

  def slide_path(slide)
    "/api/services/#{@service.id}/slides/#{slide.id}"
  end

  def stub_scripture(book, chapter)
    stub_request(:get, "#{HELLOAO}/books.json")
      .to_return(status: 200, body: FIXTURES.join("books.json").read, headers: { "Content-Type" => "application/json" })
    stub_request(:get, "#{HELLOAO}/#{book}/#{chapter}.json")
      .to_return(status: 200, body: FIXTURES.join("#{book}_#{chapter}.json").read, headers: { "Content-Type" => "application/json" })
  end
end
