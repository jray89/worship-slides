require "test_helper"

class AuthTest < ActionDispatch::IntegrationTest
  test "login with valid credentials returns a token and the user" do
    post "/api/login", params: { email: " JAY@example.com ", password: "correct-horse" }, as: :json

    assert_response :success
    body = response.parsed_body
    assert_equal users(:jay).id, JwtService.decode(body["token"])[:user_id]
    assert_equal "jay@example.com", body.dig("user", "email")
    assert_nil body["user"]["password_digest"]
  end

  test "login with a wrong password is rejected" do
    post "/api/login", params: { email: "jay@example.com", password: "nope" }, as: :json

    assert_response :unauthorized
    assert_equal "Invalid email or password", response.parsed_body["error"]
  end

  test "login with an unknown email is rejected" do
    post "/api/login", params: { email: "nobody@example.com", password: "correct-horse" }, as: :json

    assert_response :unauthorized
  end

  test "me returns the current user" do
    get "/api/me", headers: auth_headers

    assert_response :success
    assert_equal "Jay Example", response.parsed_body.dig("user", "name")
  end

  test "me without a token is unauthorized" do
    get "/api/me"

    assert_response :unauthorized
  end

  test "me with a tampered token is unauthorized" do
    get "/api/me", headers: { "Authorization" => "Bearer #{JwtService.encode({ user_id: users(:jay).id })}x" }

    assert_response :unauthorized
  end
end
