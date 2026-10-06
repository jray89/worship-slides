require "test_helper"

class ServicesApiTest < ActionDispatch::IntegrationTest
  setup do
    @service = users(:jay).services.create!(service_date: "2026-10-04", label: "AM",
                               sermon_title: "The Good Shepherd", sermon_reference: "John 10:1-18")
  end

  test "every services endpoint requires authentication" do
    [
      [ :get, "/api/services" ],
      [ :post, "/api/services" ],
      [ :get, "/api/services/#{@service.id}" ],
      [ :patch, "/api/services/#{@service.id}" ],
      [ :delete, "/api/services/#{@service.id}" ],
      [ :get, "/api/services/#{@service.id}/preview_data" ],
      [ :get, "/api/services/#{@service.id}/export_pdf" ],
      [ :get, "/api/services/#{@service.id}/slides" ]
    ].each do |verb, path|
      send(verb, path)
      assert_response :unauthorized, "#{verb.upcase} #{path} should require auth"
    end
  end

  test "creates, updates and deletes a service" do
    post "/api/services", headers: auth_headers, as: :json,
      params: { service: { service_date: "2026-10-11", label: "PM" } }
    assert_response :created
    id = response.parsed_body["id"]

    patch "/api/services/#{id}", headers: auth_headers, as: :json,
      params: { service: { sermon_title: "Psalm 23" } }
    assert_response :success
    assert_equal "Psalm 23", response.parsed_body["sermon_title"]

    assert_difference -> { Service.count }, -1 do
      delete "/api/services/#{id}", headers: auth_headers
    end
    assert_response :no_content
  end

  test "rejects a service without a date" do
    post "/api/services", headers: auth_headers, as: :json, params: { service: { label: "AM" } }

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"], "Service date can't be blank"
  end

  test "lists services newest first" do
    older = users(:jay).services.create!(service_date: "2020-01-05")

    get "/api/services", headers: auth_headers

    ids = response.parsed_body.map { |s| s["id"] }
    assert ids.index(@service.id) < ids.index(older.id)
  end

  test "adds slides, reorders them and renders preview pages" do
    post "/api/services/#{@service.id}/slides", headers: auth_headers, as: :json,
      params: { slide: { slide_type: "welcome" } }
    assert_response :created

    post "/api/services/#{@service.id}/slides", headers: auth_headers, as: :json,
      params: { slide: { slide_type: "psalm", psalm_number: 23, verse_start: 1, verse_end: 3 } }
    assert_response :created
    psalm_id = response.parsed_body["id"]

    patch "/api/services/#{@service.id}/slides/#{psalm_id}/move", headers: auth_headers, as: :json,
      params: { direction: "up" }
    assert_response :success

    get "/api/services/#{@service.id}/preview_data", headers: auth_headers
    pages = response.parsed_body["pages"]

    assert_equal "psalm", pages.first["slide_type"]
    assert_equal "welcome", pages.last["slide_type"]
    assert pages.first.dig("content", "stanza", "lines").any?
  end

  test "lists only the current user's services" do
    theirs = users(:other).services.create!(service_date: "2026-10-04")

    get "/api/services", headers: auth_headers

    ids = response.parsed_body.map { |s| s["id"] }
    assert_includes ids, @service.id
    assert_not_includes ids, theirs.id
  end

  test "new services belong to the current user" do
    post "/api/services", headers: auth_headers(users(:other)), as: :json,
      params: { service: { service_date: "2026-10-11" } }

    assert_equal users(:other).id, Service.find(response.parsed_body["id"]).user_id
  end

  test "cannot read or change another user's service or its slides" do
    other = auth_headers(users(:other))

    get "/api/services/#{@service.id}", headers: other
    assert_response :not_found

    patch "/api/services/#{@service.id}", headers: other, as: :json,
      params: { service: { sermon_title: "Hijacked" } }
    assert_response :not_found

    delete "/api/services/#{@service.id}", headers: other
    assert_response :not_found

    get "/api/services/#{@service.id}/slides", headers: other
    assert_response :not_found

    post "/api/services/#{@service.id}/slides", headers: other, as: :json,
      params: { slide: { slide_type: "welcome" } }
    assert_response :not_found

    assert_equal "The Good Shepherd", @service.reload.sermon_title
    assert_empty @service.slides
  end

  test "rejects a psalm slide without a psalm number" do
    post "/api/services/#{@service.id}/slides", headers: auth_headers, as: :json,
      params: { slide: { slide_type: "psalm" } }

    assert_response :unprocessable_entity
  end

  test "title card export embeds the sermon data for the print view" do
    captured_html = nil
    fake = Object.new
    fake.define_singleton_method(:to_png) { "PNGDATA" }

    with_grover_stub(->(html, **) { captured_html = html; fake }) do
      get "/api/services/#{@service.id}/export_title_card", headers: auth_headers
    end

    assert_response :success
    assert_equal "image/png", response.media_type
    assert_equal "PNGDATA", response.body
    assert_match "2026-10-04-title-am.png", response.headers["Content-Disposition"]
    assert_includes captured_html, %(window.__PRINT_DATA__ = {"sermon_title":"The Good Shepherd")
  end

  test "print data cannot break out of its script tag" do
    @service.update!(sermon_title: "</script><script>alert(1)</script>")
    captured_html = nil
    fake = Object.new
    fake.define_singleton_method(:to_png) { "" }

    with_grover_stub(->(html, **) { captured_html = html; fake }) do
      get "/api/services/#{@service.id}/export_title_card", headers: auth_headers
    end

    assert_not_includes captured_html, "</script><script>alert"
  end

  private

  # Grover drives headless Chrome; swap in a fake so exports can be tested without it.
  def with_grover_stub(factory)
    original = Grover.method(:new)
    Grover.define_singleton_method(:new) { |*args, **kwargs| factory.call(*args, **kwargs) }
    yield
  ensure
    Grover.define_singleton_method(:new, original)
  end
end
