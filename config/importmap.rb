# Document preview application
pin "doc_viewers_application", to: "doc_viewers_application.js"

# Document preview dependencies
pin "pdfjs-dist", to: "https://ga.jspm.io/npm:pdfjs-dist@4.8.69/build/pdf.min.mjs"
pin "mammoth", to: "https://ga.jspm.io/npm:mammoth@1.8.0/mammoth.browser.min.js"
pin "screenfull", to: "https://ga.jspm.io/npm:screenfull@6.0.2/dist/screenfull.js"

# Engine controllers
pin_all_from DocViewers::Engine.root.join("app/javascript/controllers"), under: "controllers", to: "doc_viewers"