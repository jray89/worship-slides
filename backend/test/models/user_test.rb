require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "add creates a user with a normalized email" do
    user = User.add(first_name: "Ann", last_name: "Lee", email: "  Ann@Example.COM ", password: "secret123")

    assert user.persisted?
    assert_equal "ann@example.com", user.email
    assert_equal "Ann Lee", user.name
  end

  test "rejects a malformed email" do
    user = User.new(first_name: "A", last_name: "B", email: "nope", password: "secret123")

    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "destroying a user removes their services" do
    users(:jay).services.create!(service_date: "2026-10-04")

    assert_difference -> { Service.count }, -users(:jay).services.count do
      users(:jay).destroy
    end
  end
end
