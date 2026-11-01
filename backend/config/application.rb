require_relative "boot"
require "rails"
Bundler.require(*Rails.groups)
%w[active_model/railtie active_job/railtie active_record/railtie action_controller/railtie].each { |r| require r }
module Meetmind
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.autoload_lib(ignore: %w[assets tasks])
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "*"
        resource "*", headers: :any, methods: %i[get post options]
      end
    end
  end
end
