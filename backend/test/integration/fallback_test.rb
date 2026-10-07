require "test_helper"

class FallbackTest < ActionDispatch::IntegrationTest
  test "client-side routes are served the SPA shell" do
    skip "frontend not built into public/" unless Rails.root.join("public", "index.html").exist?

    get "/services/123/edit"

    assert_response :success
    assert_equal "text/html", response.media_type
  end

  test "unknown API paths are not swallowed by the SPA fallback" do
    get "/api/nope", headers: auth_headers

    assert_response :not_found
  end
end
