# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# Mount doc_viewers importmap
if File.exist?(Rails.root.join("../../config/importmap.rb"))
  instance_eval(File.read(Rails.root.join("../../config/importmap.rb")))
end