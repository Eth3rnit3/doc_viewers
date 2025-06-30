# DocViewers

A Rails mountable engine that provides a universal multi-page document preview component for PDF, DOCX, and image collections. Built with Rails 8+, Stimulus, Hotwire, and Tailwind CSS.

## Features

- **Universal Document Viewer**: Single component supporting PDF, DOCX, and image collections
- **Consistent UX**: Same interface and controls regardless of document type
- **Modern Stack**: Rails 8+, Stimulus controllers, Hotwire, Tailwind CSS
- **Responsive Design**: Mobile-first approach with CSS Grid and container queries
- **Accessibility**: Keyboard shortcuts, ARIA roles, focus management
- **No Build Dependencies**: Uses Importmap for PDF.js, Mammoth.js, and Screenfull.js
- **Background Processing**: Async DOCX conversion with ActiveJob integration

## Technology Stack

- **PDF Rendering**: PDF.js 4.x for client-side PDF display
- **DOCX Processing**: Mammoth.js for HTML conversion, with LibreOffice fallback to PNG
- **Image Support**: Native handling of PNG, JPEG, SVG, WebP
- **Frontend**: Stimulus controllers with Hotwire for seamless interactions
- **Styling**: Tailwind CSS with responsive design patterns
- **Fullscreen**: Screenfull.js for immersive viewing experience

## Usage

### Basic Integration

```erb
<%= document_preview_for @report, file_field: :attachment %>
```

### With Options

```erb
<%= document_preview_for @document, 
    file_field: :file, 
    initial_page: 2,
    download_name: "custom-filename.pdf" %>
```

### Toolbar Features

The viewer includes a minimal but extensible toolbar:
- Navigation: Previous/Next page arrows
- Page indicator: Current page / Total pages
- Zoom controls: Zoom in/out buttons
- Fullscreen toggle
- Download button

### Keyboard Shortcuts

- `←/→`: Navigate between pages
- `Ctrl + Mouse Wheel`: Zoom in/out
- `Esc`: Exit fullscreen mode

## Architecture

### Components

- **ViewComponent**: `DocumentPreview::Viewer` renders the main viewer container
- **Stimulus Controller**: `ViewerController` handles all interactions and state management
- **Background Services**: `DocxToHtmlService` for async DOCX processing
- **Helper Methods**: Rails helpers for easy integration

### State Management

The Stimulus controller maintains:
- `currentPage`: Active page number
- `scale`: Current zoom level
- `totalPages`: Total document pages
- `docType`: Document type (pdf|docx|images)

### Document Type Detection

The engine automatically detects document type based on:
1. File extension
2. MIME type
3. Content analysis

## Installation

Add this line to your application's Gemfile:

```ruby
gem "doc_viewers"
```

And then execute:
```bash
$ bundle install
```

Mount the engine in your routes:
```ruby
# config/routes.rb
mount DocViewers::Engine, at: "/doc_viewers"
```

Add the required importmap pins:
```ruby
# config/importmap.rb
pin "pdfjs-dist", to: "pdf.min.js"
pin "mammoth", to: "mammoth.browser.min.js"
pin "screenfull"
```

## Configuration

The engine works out of the box but can be customized:

### CSS Customization

Override styles by creating `app/assets/stylesheets/doc_viewers_custom.css`:

```css
.document-viewer {
  /* Custom viewer styles */
}

.viewer-toolbar {
  /* Custom toolbar styles */
}
```

### Background Job Configuration

For DOCX processing, ensure you have a job queue configured:

```ruby
# config/application.rb
config.active_job.queue_adapter = :sidekiq # or your preferred adapter
```

## Performance

- **Lighthouse Scores**: Optimized for ≥90 on mobile (performance & accessibility)
- **Lazy Loading**: Documents load progressively
- **Efficient Rendering**: CSS-based transformations over JavaScript
- **Minimal JavaScript**: Logic only where necessary, CSS for animations

## Browser Support

- Modern browsers with ES6+ support
- Progressive enhancement for older browsers
- Mobile-responsive design

## Testing

The engine includes comprehensive test coverage:

```bash
# Run all tests
bin/rspec

# Run specific test types
bin/rspec spec/components  # Component tests
bin/rspec spec/system      # Integration tests
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run tests: `bin/rspec`
5. Run linter: `bundle exec rubocop`
6. Commit your changes (`git commit -am 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Philosophy

- **CSS First**: Prefer native CSS over JavaScript for styling and animations
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Accessibility First**: WCAG compliant with keyboard navigation
- **Mobile First**: Responsive design from small screens up
- **Minimal Dependencies**: Only essential external libraries

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
