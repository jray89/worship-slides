ENV["RAILS_ENV"] ||= "test"

require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  # Only enforce on full CI runs so running a single test file locally doesn't fail.
  minimum_coverage 80 if ENV["CI"]
end

require_relative "../config/environment"
require "rails/test_help"
require "webmock/minitest"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Each worker writes its own result; SimpleCov merges them when the run ends.
    parallelize_setup { |worker| SimpleCov.command_name "#{SimpleCov.command_name}-#{worker}" }
    parallelize_teardown { SimpleCov.result }

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end

module ActionDispatch
  class IntegrationTest
    def auth_headers(user = users(:jay))
      { "Authorization" => "Bearer #{JwtService.encode({ user_id: user.id })}" }
    end
  end
end
