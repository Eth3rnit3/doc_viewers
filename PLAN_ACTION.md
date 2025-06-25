# Plan d'Action - Document Preview Engine

## Analyse du Projet Actuel

**État :** Rails Engine mountable de base généré avec `rails plugin new --mountable`

**Structure existante :**
- Engine Rails basique avec namespace `DocViewers`
- Configuration minimale dans `lib/doc_viewers/engine.rb`
- Structure MVC standard mais vide
- App de test (dummy) configurée
- Gemspec avec dépendance Rails 8.0.2+

## Objectif Principal

Créer un **composant d'aperçu multi-pages universel** pour :
- PDF (via PDF.js 4.x)
- DOCX (conversion HTML avec Mammoth.js + fallback images)
- Collections d'images (PNG, JPEG, SVG, WebP)

## Roadmap de Développement

### Phase 1: Configuration & Architecture ⏳
- [x] Analyser structure existante
- [ ] **ACTUEL :** Configurer gemspec avec dépendances requises
  - view_component, rspec-rails, stimulus-rails, hotwire-rails, tailwindcss-rails
- [ ] Configurer importmap.rb pour les librairies JS
  - PDF.js, Mammoth.js, Screenfull.js
- [ ] Mettre en place RSpec et StandardRB

### Phase 2: Composants Core 🔧
- [ ] Créer ViewComponent `DocumentPreview::Viewer`
  - Slots pour toolbar & canvas
  - Options : file_url, doc_type, initial_page, download_name
- [ ] Développer Stimulus controller `viewer_controller.js`
  - Gestion état : currentPage, scale, totalPages
  - Méthodes : initPDF(), initDOCX(), initImages()
- [ ] Helper `document_preview_for(record, file_field:)`

### Phase 3: Styles & UX 🎨
- [ ] CSS avec Tailwind (document_preview_engine.css)
  - Grille responsive : `grid grid-rows-[auto,1fr]`
  - Toolbar sticky avec icônes Heroicons
  - Animations CSS natives
- [ ] Accessibilité
  - Raccourcis clavier (←/→, Ctrl+Wheel)
  - Roles ARIA, focus traps fullscreen

### Phase 4: Backend Services 🔧
- [ ] Service `DocxToHtmlService` (Mammoth + ActiveJob)
- [ ] Gestion conversion asynchrone avec Turbo Streams
- [ ] Endpoints pour servir PDF et images

### Phase 5: Tests & Validation ✅
- [ ] Tests unitaires RSpec
- [ ] Tests system avec Capybara/Turbo
- [ ] Validation Lighthouse mobile ≥ 90
- [ ] Lint RuboCop + StandardRB

### Phase 6: Intégration & Documentation 📚
- [ ] Exemples dans dummy app
- [ ] Documentation d'usage
- [ ] Guide d'extension

## Architecture Technique

### Stack
- **Backend :** Rails 8+ Engine mountable
- **Frontend :** Stimulus + Hotwire + Importmap (NO Webpack/jQuery)
- **Styles :** Tailwind CSS + CSS natif
- **Tests :** RSpec + Capybara + StandardRB

### Composants Clés
```ruby
# Usage cible
<%= document_preview_for @report, file_field: :attachment %>
```

### Structure Fichiers
```
lib/doc_viewers/
├── engine.rb
├── version.rb
└── services/
    └── docx_to_html_service.rb

app/
├── components/document_preview/
│   └── viewer_component.rb
├── controllers/doc_viewers/
│   └── previews_controller.rb
├── javascript/controllers/
│   └── viewer_controller.js
└── assets/stylesheets/
    └── document_preview_engine.css
```

## Prochaines Actions Immédiates

1. **Configuration gemspec** - Ajouter toutes les dépendances
2. **Setup importmap** - Configurer les librairies JS
3. **ViewComponent de base** - Structure du viewer
4. **Stimulus controller** - Logique frontend

---

**Critères de Réussite :**
- ✅ Composant plug-and-play utilisable avec une ligne de code
- ✅ Aucune dépendance JS non listée dans importmap.rb
- ✅ Lighthouse mobile ≥ 90 (perf/accessibilité)
- ✅ 100% tests passing

**Statut :** Phase 2 complétée - Core components implémentés

## Progrès Réalisés ✅

### Phase 1: Configuration & Architecture ✅
- [x] Analyser structure existante
- [x] **TERMINÉ :** Configurer gemspec avec dépendances requises
  - view_component, rspec-rails, stimulus-rails, hotwire-rails, tailwindcss-rails
- [x] Configurer importmap.rb pour les librairies JS
  - PDF.js, Mammoth.js, Screenfull.js (via CDN)
- [x] Mettre en place RSpec

### Phase 2: Composants Core ✅
- [x] Créer partial DocumentViewer avec interface complète
  - Toolbar avec navigation, zoom, fullscreen, download
  - Canvas pour PDF, DOCX, et images
- [x] Développer Stimulus controller `viewer_controller.js`
  - Gestion état : currentPage, scale, totalPages
  - Méthodes : initPDF(), initDOCX(), initImages()
- [x] Helper `document_preview_from_url` fonctionnel

### Application Demo ✅
- [x] App dummy configurée avec exemples PDF et image
- [x] Interface complète avec Tailwind CSS
- [x] Server fonctionnel sur http://localhost:3000/preview

## Prochaines Étapes

### Phase 3: Fonctionnalités Avancées ✅ 🔧
- [x] **TERMINÉ :** Corriger erreurs 404 assets CSS/JS
- [x] **TERMINÉ :** Tester visualisation d'images
- [x] **TERMINÉ :** Interface complète fonctionnelle avec zoom, navigation, download
- [x] **TERMINÉ :** Implémenter support PDF complet avec PDF.js
  - Chargement PDF avec PDF.js 4.x
  - Navigation multi-pages avec rendu canvas
  - Zoom dynamique avec re-rendu
  - Gestion d'erreurs et debug logs
- [ ] Implémenter support DOCX avec Mammoth.js
- [ ] Tests RSpec complets

## État Actuel 🎉

### ✅ Fonctionnel
- **Interface complète** avec toolbar responsive Tailwind CSS
- **Visualisation d'images** avec zoom, navigation, téléchargement
- **Helper plug-and-play** : `document_preview_from_url(url, options)`
- **Architecture propre** : Engine Rails mountable + Stimulus + CSS
- **Demo live** : http://localhost:3000/preview

### 🚀 Composants Créés
- `DocumentPreviewViewerController` JavaScript avec gestion complète
- Partial `_document_viewer.html.erb` avec interface responsive
- Styles CSS avec animations et responsive design
- Helper Rails avec détection automatique de type