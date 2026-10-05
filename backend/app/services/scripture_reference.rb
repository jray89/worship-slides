module ScriptureReference
  private

  def parse_reference(reference)
    # Handle references like "Titus 2", "Titus 2:1", "1 John 3:16-17", "Numbers 14:1-10"
    if reference.match(/\A(.+?)\s+(\d+)(?::(.+))?\z/)
      { book: $1, chapter: $2.to_i, verse_spec: $3 }
    else
      { book: reference, chapter: nil, verse_spec: nil }
    end
  end

  def build_display_reference(parsed)
    ref = "#{parsed[:book]} #{parsed[:chapter]}"
    ref += ":#{parsed[:verse_spec]}" if parsed[:verse_spec]
    ref
  end
end
