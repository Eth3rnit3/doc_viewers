# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# Document preview dependencies
pin "pdfjs-dist", to: "https://ga.jspm.io/npm:pdfjs-dist@4.8.69/build/pdf.min.mjs"
pin "mammoth", to: "https://ga.jspm.io/npm:mammoth@1.8.0/mammoth.browser.min.js"
pin "screenfull", to: "https://ga.jspm.io/npm:screenfull@6.0.2/dist/screenfull.js"