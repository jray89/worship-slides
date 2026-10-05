require "test_helper"

class ScriptureReferenceTest < ActiveSupport::TestCase
  class Subject
    include ScriptureReference
    public :parse_reference, :build_display_reference
  end

  setup { @subject = Subject.new }

  test "parses book, chapter and verse spec" do
    assert_equal({ book: "1 John", chapter: 3, verse_spec: "16-17" }, @subject.parse_reference("1 John 3:16-17"))
    assert_equal({ book: "Titus", chapter: 2, verse_spec: nil }, @subject.parse_reference("Titus 2"))
    assert_equal({ book: "II Corinthians", chapter: 13, verse_spec: nil }, @subject.parse_reference("II Corinthians 13"))
  end

  test "returns nil chapter for a bare book name" do
    assert_equal({ book: "Jude", chapter: nil, verse_spec: nil }, @subject.parse_reference("Jude"))
  end

  test "builds display reference" do
    assert_equal "John 3:16-18", @subject.build_display_reference(@subject.parse_reference("John 3:16-18"))
    assert_equal "Titus 2", @subject.build_display_reference(@subject.parse_reference("Titus 2"))
  end
end
