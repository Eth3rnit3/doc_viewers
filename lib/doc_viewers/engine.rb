module DocViewers
  class Engine < ::Rails::Engine
    isolate_namespace DocViewers

    config.generators do |g|
      g.test_framework :rspec
      g.assets false
      g.helper false
    end

    config.autoload_paths += Dir["#{root}/app/*"]

    initializer "doc_viewers.assets" do |app|
      app.config.assets.precompile += %w[doc_viewers_manifest.js]
    end

    initializer "doc_viewers.view_component" do
      ActiveSupport.on_load(:action_view) do
        include DocViewers::ApplicationHelper
      end
    end
  end
end
