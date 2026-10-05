require "test_helper"

class ScriptureApiClientTest < ActiveSupport::TestCase
  BASE = "https://bible.helloao.org/api/eng_kjv".freeze
  FIXTURES = Rails.root.join("test", "fixtures", "files", "helloao")

  setup do
    ScriptureApiClient.reset_cache!
    stub_fixture("books.json", "books.json")
    %w[JER_42 JHN_3 JHN_4 ROM_16 PSA_3 ACT_20 TIT_2 1CO_13 2CO_13].each do |name|
      book, chapter = name.split("_")
      stub_fixture("#{book}/#{chapter}.json", "#{name}.json")
    end
    @client = ScriptureApiClient.new
  end

  teardown { ScriptureApiClient.reset_cache! }

  test "returns the expected keys and echoes the reference" do
    data = @client.fetch("John 3:16-18")

    assert_equal %w[book chapter verse_spec verses paragraphs full_text display_reference].sort, data.keys.sort
    assert_equal "John", data["book"]
    assert_equal 3, data["chapter"]
    assert_equal "16-18", data["verse_spec"]
    assert_equal "John 3:16-18", data["display_reference"]
    assert_equal [ 16, 17, 18 ], data["verses"].map { |v| v["number"] }
    assert data["verses"].all? { |v| v["number"].is_a?(Integer) }
    assert_equal data["verses"].map { |v| v["text"] }.join(" "), data["full_text"]
    assert data["full_text"].start_with?("For God so loved the world")
  end

  test "splits paragraphs at pilcrow verses and strips the pilcrow" do
    data = @client.fetch("Jeremiah 42:5-9")

    assert_equal [ 5, 6, 7, 8, 9 ], data["verses"].map { |v| v["number"] }
    assert_equal 2, data["paragraphs"].size
    assert data["paragraphs"][1].start_with?("And it came to pass after ten days")
    verse7 = data["verses"].find { |v| v["number"] == 7 }
    assert verse7["text"].start_with?("And it came to pass")
    assert_not_includes verse7["text"], "¶"
    assert_equal data["paragraphs"].join(" "), data["full_text"]
  end

  test "whole chapter without pilcrows is a single paragraph" do
    data = @client.fetch("Titus 2")

    assert_equal (1..15).to_a, data["verses"].map { |v| v["number"] }
    assert_equal 1, data["paragraphs"].size
    assert_nil data["verse_spec"]
    assert_equal "Titus 2", data["display_reference"]
  end

  test "Acts 20 paragraphs start at verses 1, 13, 17, 28 and 36" do
    data = @client.fetch("Acts 20")
    starts = [ 1, 13, 17, 28, 36 ].map { |n| data["verses"].find { |v| v["number"] == n }["text"] }

    assert_equal 38, data["verses"].size
    assert_equal 5, data["paragraphs"].size
    data["paragraphs"].zip(starts).each do |paragraph, first_verse|
      assert paragraph.start_with?(first_verse)
    end
  end

  test "excludes epistle subscription headings" do
    data = @client.fetch("Romans 16")

    assert_equal 27, data["verses"].size
    assert_not_includes data["full_text"], "Written to the Romans from Corinthus"
  end

  test "resolves singular Psalm, drops the title and flattens poetry" do
    data = @client.fetch("Psalm 3")

    assert_equal "Psalm", data["book"]
    assert_equal (1..8).to_a, data["verses"].map { |v| v["number"] }
    assert data["verses"].first["text"].start_with?("LORD, how are they increased")
    assert_not_includes data["full_text"], "A Psalm of David, when he fled"
    assert_not_includes data["full_text"], "  "
    assert_not_includes data["full_text"], "\n"
  end

  test "resolves roman numeral book prefixes" do
    first = @client.fetch("I Corinthians 13:4-7")
    assert_equal [ 4, 5, 6, 7 ], first["verses"].map { |v| v["number"] }
    assert first["full_text"].start_with?("Charity suffereth long")
    assert_equal "I Corinthians 13:4-7", first["display_reference"]

    second = @client.fetch("II Corinthians 13")
    assert_equal 14, second["verses"].size
    assert_requested :get, "#{BASE}/2CO/13.json"
  end

  test "cross-chapter range starts a new paragraph at the new chapter" do
    data = @client.fetch("John 3:36-4:2")

    assert_equal [ 36, 1, 2 ], data["verses"].map { |v| v["number"] }
    assert_equal 2, data["paragraphs"].size
    assert data["paragraphs"][1].start_with?("When therefore the Lord knew")
  end

  test "comma-separated verse lists" do
    assert_equal [ 16, 18 ], @client.fetch("John 3:16, 18")["verses"].map { |v| v["number"] }
    assert_equal [ 1, 2, 3, 5, 6, 7 ], @client.fetch("John 3:1-3, 5–7")["verses"].map { |v| v["number"] }
  end

  test "unknown book raises" do
    error = assert_raises(RuntimeError) { @client.fetch("Hezekiah 1") }
    assert_match(/Could not find passage text/, error.message)
  end

  test "unknown chapter raises" do
    stub_request(:get, "#{BASE}/JHN/99.json").to_return(status: 404, body: "")
    error = assert_raises(RuntimeError) { @client.fetch("John 99") }
    assert_match(/Could not find passage text/, error.message)
  end

  test "out-of-range verses raise" do
    error = assert_raises(RuntimeError) { @client.fetch("John 3:40-45") }
    assert_match(/Could not find passage text/, error.message)
  end

  test "unparseable verse spec raises" do
    error = assert_raises(RuntimeError) { @client.fetch("John 3:abc") }
    assert_match(/Could not find passage text/, error.message)
  end

  test "server errors raise a scripture API error" do
    stub_request(:get, "#{BASE}/JHN/5.json").to_return(status: 500, body: "")
    error = assert_raises(RuntimeError) { @client.fetch("John 5") }
    assert_match(/Scripture API error \(500\)/, error.message)
  end

  test "no text contains pilcrows, newlines or surrounding whitespace" do
    [ "Jeremiah 42", "Acts 20", "Psalm 3", "Romans 16", "John 3:36-4:2" ].each do |reference|
      data = @client.fetch(reference)
      texts = data["verses"].map { |v| v["text"] } + data["paragraphs"] + [ data["full_text"] ]
      texts.each do |text|
        assert_not_includes text, "¶", reference
        assert_not_includes text, "\n", reference
        assert_equal text.strip, text, reference
      end
    end
  end

  private

  def stub_fixture(path, file)
    stub_request(:get, "#{BASE}/#{path}").to_return(
      status: 200, body: FIXTURES.join(file).read, headers: { "Content-Type" => "application/json" }
    )
  end
end
