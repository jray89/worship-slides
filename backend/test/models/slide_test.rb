require "test_helper"

class SlideTest < ActiveSupport::TestCase
  setup { @service = users(:jay).services.create!(service_date: "2026-10-04") }

  test "requires a known slide type" do
    assert_not @service.slides.build(slide_type: "bogus").valid?
    assert @service.slides.build(slide_type: "welcome").valid?
  end

  test "scripture and key verse slides require a reference" do
    %w[scripture key_verse].each do |type|
      slide = @service.slides.build(slide_type: type)
      assert_not slide.valid?
      assert_includes slide.errors[:scripture_reference], "can't be blank"
    end
  end

  test "new slides are appended to the end of their service" do
    first = @service.slides.create!(slide_type: "welcome")
    second = @service.slides.create!(slide_type: "closing")

    assert_equal [ 1, 2 ], [ first.position, second.position ]
  end
end
