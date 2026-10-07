require "test_helper"

class ServiceTest < ActiveSupport::TestCase
  test "requires a service date" do
    service = users(:jay).services.build

    assert_not service.valid?
    assert_includes service.errors[:service_date], "can't be blank"
  end

  test "destroying a service removes its slides" do
    service = users(:jay).services.create!(service_date: "2026-10-04")
    service.slides.create!(slide_type: "welcome")

    assert_difference -> { Slide.count }, -1 do
      service.destroy
    end
  end
end
