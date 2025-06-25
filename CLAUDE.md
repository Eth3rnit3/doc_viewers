Tu es **un expert Ruby on Rails (v 8+), Stimulus, Hotwire et Tailwind CSS**.
Ta mission : **coder, dans une *nouvelle engine Rails mountable***, un composant **d’aperçu multi-pages universel** pour :

* PDF (via PDF.js 4.x)
* DOCX (rend HTML avec Mammoth.js ; fallback images via libreoffice → PNG si besoin)
* Collection d’images (PNG, JPEG, SVG, WebP)

Le même viewer doit offrir **la même UX** quel que soit le type de document.

---

#### Contraintes & pile technique

1. **Rails Engine mountable** (`lib/document_preview_engine`), exportant un helper `document_preview_for(record, file_field:)`.
2. **Stimulus + Hotwire**

   * `ViewerController` gère pagination, zoom, fullscreen, download.
   * **Aucune jQuery / Webpack** : on utilise **Importmap** pour PDF.js, Mammoth.js et Screenfull.js (fullscreen).
3. **Tailwind CSS** (config déjà incluse par `rails tailwindcss:install`).

   * Responsiveness d’abord (grilles CSS, `aspect-ratio`, `@container` queries).
   * Toute animation/transformation simple → **CSS** (`transition`, `transform-scale`, etc.).
   * JS uniquement pour logique métier (changement de page, calcul du zoom).
4. **Toolbar** minimaliste mais extensible :
   `« ← » « → » | page X/Y | « − » « + » (zoom) | ⛶ fullscreen | ⬇︎ download`
5. **Accessibilité** : raccourcis clavier (`←/→`, `Ctrl+Wheel`), roles ARIA, focus traps en fullscreen.
6. **Test-Driven** :

   * RSpec unités + Turbo/Stimulus system specs (Capybara).
   * RuboCop + StandardRB lint clean.

---

#### Étapes attendues

1. **Boilerplate engine (OK)**

   ```bash
   rails plugin new document_preview_engine \
     --mountable
   ```
2. **Gems** à ajouter au gemspec : `view_component`, `rspec-rails`, `stimulus-rails`, `hotwire-rails`, `tailwindcss-rails`.
3. **Importmap pins**

   ```ruby
   pin "pdfjs-dist", to: "pdf.min.js"
   pin "mammoth", to: "mammoth.browser.min.js"
   pin "screenfull"
   ```
4. **ViewComponent : `<DocumentPreview::Viewer>`**

   * Rend un `<div data-controller="viewer" …>` avec slots pour toolbar & canvas.
   * Accepte options : `file_url`, `doc_type` (`pdf|docx|images`), `initial_page`, `download_name`.
5. **Stimulus controller**

   * Action `load` détecte le type et délègue :`initPDF()`, `initDOCX()`, `initImages()`.
   * Maintient `currentPage`, `scale`, `totalPages` dans `this.state`.
   * Utilise Turbo Streams pour pousser les conversions asynchrones (e.g. DOCX→HTML).
6. **CSS** (`app/assets/stylesheets/document_preview_engine.css`)

   * Grille responsive :`grid grid-rows-[auto,1fr]`
   * Toolbar sticky en haut, ombre subtile, icônes Heroicons via `<svg class="w-5 h-5">`.
7. **Conversion backend**

   * Service `DocxToHtmlService` (Mammoth) exécuté en background (ActiveJob).
   * PDF et images servis directement (pas de conversion serveur).
8. **Exemples d’intégration** dans dummy app :

   ```erb
   <%= document_preview_for @report, file_field: :attachment %>
   ```
9. **README** clair : setup, usage, extension points.

---

#### Critères de réussite

* Un composant simple est utilisable par l'hôte avec une liste de url ou un blob.
* Aucune dépendance JS non listée dans `importmap.rb`.
* Lighthouse mobile ≥ 90 (perf / accessibilité).
* 100 % tests passing (`bin/rspec`).

---

**Rappelle-toi :** favorise le CSS natif, garde le JS minimal, et livre un composant *plug-and-play* ❤️ Rails 8 + Hotwire.
