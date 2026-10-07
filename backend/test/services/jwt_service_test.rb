require "test_helper"

class JwtServiceTest < ActiveSupport::TestCase
  test "round-trips a payload with indifferent access" do
    payload = JwtService.decode(JwtService.encode({ user_id: 42 }))

    assert_equal 42, payload[:user_id]
    assert_equal 42, payload["user_id"]
  end

  test "expired tokens decode to nil" do
    token = JwtService.encode({ user_id: 42 }, exp: 1.minute.ago)

    assert_nil JwtService.decode(token)
  end

  test "garbage decodes to nil" do
    assert_nil JwtService.decode("not-a-jwt")
  end
end
