// Simple Document Preview Controller
class DocumentPreviewViewerController {
  constructor(element) {
    this.element = element
    this.fileUrl = element.dataset.documentPreviewViewerFileUrlValue || element.getAttribute('data-document-preview--viewer-file-url-value')
    this.docType = element.dataset.documentPreviewViewerDocTypeValue || element.getAttribute('data-document-preview--viewer-doc-type-value')
    this.initialPage = parseInt(element.dataset.documentPreviewViewerInitialPageValue || element.getAttribute('data-document-preview--viewer-initial-page-value')) || 1
    this.downloadName = element.dataset.documentPreviewViewerDownloadNameValue || element.getAttribute('data-document-preview--viewer-download-name-value')
    
    // Support pour les collections d'images
    const imageUrlsAttr = element.dataset.documentPreviewViewerImageUrlsValue || element.getAttribute('data-document-preview--viewer-image-urls-value')
    this.imageUrls = null
    
    if (imageUrlsAttr) {
      try {
        // Décoder les entités HTML d'abord
        const decodedJson = imageUrlsAttr.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        this.imageUrls = JSON.parse(decodedJson)
        console.log('Image URLs parsed successfully:', this.imageUrls)
      } catch (error) {
        console.error('Error parsing image URLs:', error, 'Raw value:', imageUrlsAttr)
        this.imageUrls = null
      }
    }
    
    console.log('DocumentPreviewViewer initialized:', {
      fileUrl: this.fileUrl,
      docType: this.docType,
      initialPage: this.initialPage,
      downloadName: this.downloadName,
      imageUrls: this.imageUrls
    })
    
    // Debug: log all data attributes
    console.log('All data attributes:', element.dataset)
    console.log('Element attributes:', {
      'data-document-preview--viewer-file-url-value': element.getAttribute('data-document-preview--viewer-file-url-value'),
      'data-document-preview--viewer-doc-type-value': element.getAttribute('data-document-preview--viewer-doc-type-value')
    })
    
    this.currentPage = this.initialPage
    this.totalPages = 1
    this.scale = 1.0

    this.setupElements()
    this.setupEventListeners()
    this.loadDocument()
  }

  setupElements() {
    this.loadingIndicator = this.element.querySelector('[data-document-preview--viewer-target="loadingIndicator"]')
    this.errorMessage = this.element.querySelector('[data-document-preview--viewer-target="errorMessage"]')
    this.imageContainer = this.element.querySelector('[data-document-preview--viewer-target="imageContainer"]')
    this.imageContent = this.element.querySelector('[data-document-preview--viewer-target="imageContent"]')
    this.docxContent = this.element.querySelector('[data-document-preview--viewer-target="docxContent"]')
    this.totalPagesEl = this.element.querySelector('[data-document-preview--viewer-target="totalPages"]')
    this.zoomLevel = this.element.querySelector('[data-document-preview--viewer-target="zoomLevel"]')
    this.prevBtn = this.element.querySelector('[data-document-preview--viewer-target="prevBtn"]')
    this.nextBtn = this.element.querySelector('[data-document-preview--viewer-target="nextBtn"]')
    this.pageInput = this.element.querySelector('[data-document-preview--viewer-target="pageInput"]')
  }

  setupEventListeners() {
    // Navigation
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previousPage())
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextPage())
    if (this.pageInput) this.pageInput.addEventListener('change', () => this.goToPage())
    
    // Zoom and actions
    const zoomInBtn = this.element.querySelector('[data-action*="zoomIn"]')
    const zoomOutBtn = this.element.querySelector('[data-action*="zoomOut"]')
    const downloadBtn = this.element.querySelector('[data-action*="downloadDocument"]')
    const fullscreenBtn = this.element.querySelector('[data-action*="toggleFullscreen"]')
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn())
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut())
    if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDocument())
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen())
  }

  async loadDocument() {
    try {
      this.showLoading()
      console.log('Loading document:', this.docType, this.fileUrl)
      
      switch(this.docType) {
        case 'image':
        case 'images':
          await this.initImage()
          break
        case 'pdf':
          await this.initPDF()
          break
        case 'docx':
          await this.initDOCX()
          break
        default:
          this.showContent('Document type: ' + this.docType)
      }
      
      this.hideLoading()
      this.updateUI()
    } catch (error) {
      console.error('Error loading document:', error)
      this.showError()
    }
  }

  async initImage() {
    console.log('Initializing Image(s)...')
    
    // Si c'est une collection d'images
    if (this.imageUrls && this.imageUrls.length > 0) {
      console.log(`Initializing image collection with ${this.imageUrls.length} images`)
      this.totalPages = this.imageUrls.length
      
      // Charger la première image (ou l'image de la page initiale)
      const currentImageUrl = this.imageUrls[this.currentPage - 1]
      return this.loadSingleImage(currentImageUrl)
    } else {
      // Image unique
      this.totalPages = 1
      return this.loadSingleImage(this.fileUrl)
    }
  }

  async loadSingleImage(imageUrl) {
    return new Promise((resolve, reject) => {
      if (this.imageContent) {
        this.imageContent.onload = () => {
          this.showImageContainer()
          console.log('Image loaded successfully:', imageUrl)
          resolve()
        }
        
        this.imageContent.onerror = () => {
          console.error('Failed to load image:', imageUrl)
          reject(new Error(`Failed to load image: ${imageUrl}`))
        }
        
        this.imageContent.src = imageUrl
      } else {
        reject(new Error('Image container not found'))
      }
    })
  }

  async initPDF() {
    console.log('Initializing PDF with PDF.js...')
    console.log('Available globals:', {
      pdfjsLib: typeof pdfjsLib,
      'window.pdfjsLib': typeof window.pdfjsLib,
      'window.pdfjs': typeof window.pdfjs
    })
    
    try {
      // Attendre que PDF.js soit chargé
      let pdfLib = window.pdfjsLib || window.pdfjs || (typeof pdfjsLib !== 'undefined' ? pdfjsLib : null)
      
      // Si pas encore chargé, attendre un peu
      if (!pdfLib) {
        console.log('PDF.js not ready, waiting...')
        await new Promise(resolve => setTimeout(resolve, 500))
        pdfLib = window.pdfjsLib || window.pdfjs || (typeof pdfjsLib !== 'undefined' ? pdfjsLib : null)
      }
      
      if (!pdfLib) {
        throw new Error('PDF.js library not loaded after waiting - check browser console for script errors')
      }
      
      console.log('PDF.js library found:', pdfLib)

      // PDF.js est déjà configuré dans le HTML
      
      // Charger le document PDF
      const loadingTask = pdfLib.getDocument(this.fileUrl)
      this.pdfDocument = await loadingTask.promise
      this.totalPages = this.pdfDocument.numPages
      
      console.log(`PDF loaded: ${this.totalPages} pages`)
      
      // Rendre la première page
      await this.renderPDFPage()
      this.showPDFCanvas()
      
    } catch (error) {
      console.error('Error loading PDF:', error)
      this.showContent(`Error loading PDF: ${error.message}`)
    }
  }

  async renderPDFPage() {
    if (!this.pdfDocument) return
    
    try {
      const page = await this.pdfDocument.getPage(this.currentPage)
      const viewport = page.getViewport({ scale: this.scale })
      
      const canvas = this.element.querySelector('[data-document-preview--viewer-target="pdfCanvas"]')
      if (!canvas) {
        throw new Error('PDF canvas not found')
      }
      
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      console.log(`PDF page ${this.currentPage} rendered`)
      
    } catch (error) {
      console.error('Error rendering PDF page:', error)
      throw error
    }
  }

  showPDFCanvas() {
    this.hideAllContent()
    const canvas = this.element.querySelector('[data-document-preview--viewer-target="pdfCanvas"]')
    if (canvas) canvas.classList.remove('hidden')
  }

  async initDOCX() {
    console.log('DOCX support coming soon...')
    this.showContent('DOCX viewer will be implemented with Mammoth.js')
  }

  // Navigation
  async previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      await this.renderCurrentPage()
      this.updateUI()
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      await this.renderCurrentPage()
      this.updateUI()
    }
  }

  async goToPage() {
    const pageNumber = parseInt(this.pageInput.value)
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber
      await this.renderCurrentPage()
      this.updateUI()
    }
  }

  async renderCurrentPage() {
    if (this.docType === 'pdf' && this.pdfDocument) {
      await this.renderPDFPage()
    } else if ((this.docType === 'images' || this.docType === 'image') && this.imageUrls && this.imageUrls.length > 0) {
      const currentImageUrl = this.imageUrls[this.currentPage - 1]
      if (currentImageUrl) {
        await this.loadSingleImage(currentImageUrl)
      }
    }
  }

  // Zoom
  async zoomIn() {
    this.scale = Math.min(this.scale + 0.25, 3.0)
    await this.applyZoom()
    this.updateUI()
  }

  async zoomOut() {
    this.scale = Math.max(this.scale - 0.25, 0.25)
    await this.applyZoom()
    this.updateUI()
  }

  async applyZoom() {
    if (this.docType === 'pdf' && this.pdfDocument) {
      await this.renderPDFPage()
    } else if (this.imageContent) {
      this.imageContent.style.transform = `scale(${this.scale})`
    }
  }

  toggleFullscreen() {
    if (typeof screenfull !== 'undefined' && screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.exit()
      } else {
        screenfull.request(this.element)
      }
    } else {
      console.log('Fullscreen not supported')
    }
  }

  downloadDocument() {
    const link = document.createElement('a')
    link.href = this.fileUrl
    link.download = this.downloadName || 'document'
    link.click()
  }

  // UI State
  showLoading() {
    if (this.loadingIndicator) this.loadingIndicator.classList.remove('hidden')
    this.hideAllContent()
  }

  hideLoading() {
    if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden')
  }

  showError() {
    this.hideLoading()
    this.hideAllContent()
    if (this.errorMessage) this.errorMessage.classList.remove('hidden')
  }

  showContent(text) {
    this.hideAllContent()
    if (this.docxContent) {
      this.docxContent.innerHTML = `<p class="text-center text-gray-600 p-8">${text}</p>`
      this.docxContent.classList.remove('hidden')
    }
  }

  showImageContainer() {
    this.hideAllContent()
    if (this.imageContainer) this.imageContainer.classList.remove('hidden')
  }

  hideAllContent() {
    const pdfCanvas = this.element.querySelector('[data-document-preview--viewer-target="pdfCanvas"]')
    if (pdfCanvas) pdfCanvas.classList.add('hidden')
    if (this.docxContent) this.docxContent.classList.add('hidden')
    if (this.imageContainer) this.imageContainer.classList.add('hidden')
    if (this.errorMessage) this.errorMessage.classList.add('hidden')
  }

  updateUI() {
    if (this.pageInput) this.pageInput.value = this.currentPage
    if (this.totalPagesEl) this.totalPagesEl.textContent = this.totalPages
    if (this.zoomLevel) this.zoomLevel.textContent = Math.round(this.scale * 100) + '%'
    
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage <= 1
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= this.totalPages
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing document preview controllers...')
  
  const elements = document.querySelectorAll('[data-controller="document-preview--viewer"]')
  console.log('Found', elements.length, 'document preview elements')
  
  elements.forEach(element => {
    new DocumentPreviewViewerController(element)
  })
})