require "test_helper"

class PsalmLoaderTest < ActiveSupport::TestCase
  setup { PsalmLoader.reset_cache! }
  teardown { PsalmLoader.reset_cache! }

  test "loads every version listed for a psalm with integer verse keys" do
    data = PsalmLoader.new.fetch("6")

    assert_equal %w[first second], data.keys.sort
    first = data["first"].first
    assert first["lines"].any?
    assert first["verse_numbers"].keys.all? { |k| k.is_a?(Integer) }
  end

  test "caches loaded psalms" do
    loader = PsalmLoader.new

    assert_same loader.fetch(23), loader.fetch(23)
  end

  test "raises PsalmNotFound for a psalm missing from the index" do
    error = assert_raises(PsalmLoader::PsalmNotFound) { PsalmLoader.new.fetch(151) }

    assert_match "Psalm 151", error.message
  end
end
