require "yaml"

class PsalmLoader
  class PsalmNotFound < StandardError; end

  DATA_DIR = Rails.root.join("data", "psalms")

  @@psalm_cache = {}
  @@manifest = nil
  @@mutex = Mutex.new

  def fetch(psalm_number)
    n = psalm_number.to_i
    @@mutex.synchronize do
      @@psalm_cache[n] ||= load_psalm(n)
    end
  end

  def self.reset_cache!
    @@mutex.synchronize do
      @@psalm_cache = {}
      @@manifest = nil
    end
  end

  private

  def load_psalm(n)
    versions = manifest[n] or raise PsalmNotFound,
      "Psalm #{n} not present in #{DATA_DIR.join('index.yml')} — run bin/scrape_psalms #{n}"

    versions.each_with_object({}) do |version, result|
      result[version] = load_version_file(n, version)
    end
  end

  def load_version_file(n, version)
    suffix = version == "first" ? "" : "-#{version}"
    path = DATA_DIR.join("#{format('%03d', n)}#{suffix}.yml")
    raise PsalmNotFound, "Missing #{path}" unless path.exist?

    data = YAML.safe_load_file(path, permitted_classes: [Integer], aliases: false)
    Array(data["stanzas"]).map do |stanza|
      {
        "lines" => stanza["lines"],
        "verse_numbers" => (stanza["verse_numbers"] || {}).transform_keys(&:to_i)
      }
    end
  end

  def manifest
    @@manifest ||= begin
      path = DATA_DIR.join("index.yml")
      raise PsalmNotFound, "Missing #{path}; run bin/scrape_psalms" unless path.exist?
      YAML.safe_load_file(path).fetch("psalms").transform_keys(&:to_i)
    end
  end
end
