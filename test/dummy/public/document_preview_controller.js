// Simple Document Preview Controller
class DocumentPreviewViewerController {
  constructor(element) {
    this.element = element
    this.fileUrl = element.dataset.documentPreviewViewerFileUrlValue || element.getAttribute('data-document-preview--viewer-file-url-value')
    this.docType = element.dataset.documentPreviewViewerDocTypeValue || element.getAttribute('data-document-preview--viewer-doc-type-value')
    this.initialPage = parseInt(element.dataset.documentPreviewViewerInitialPageValue || element.getAttribute('data-document-preview--viewer-initial-page-value')) || 1
    this.downloadName = element.dataset.documentPreviewViewerDownloadNameValue || element.getAttribute('data-document-preview--viewer-download-name-value')
    
    console.log('DocumentPreviewViewer initialized:', {
      fileUrl: this.fileUrl,
      docType: this.docType,
      initialPage: this.initialPage,
      downloadName: this.downloadName
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
    console.log('Initializing Image...')
    return new Promise((resolve, reject) => {
      if (this.imageContent) {
        this.imageContent.onload = () => {
          this.showImageContainer()
          console.log('Image loaded successfully')
          resolve()
        }
        
        this.imageContent.onerror = () => {
          console.error('Failed to load image')
          reject(new Error('Failed to load image'))
        }
        
        this.imageContent.src = this.fileUrl
      } else {
        reject(new Error('Image container not found'))
      }
    })
  }

  async initPDF() {
    console.log('PDF support coming soon...')
    this.showContent('PDF viewer will be implemented with PDF.js')
  }

  async initDOCX() {
    console.log('DOCX support coming soon...')
    this.showContent('DOCX viewer will be implemented with Mammoth.js')
  }

  // Navigation
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.updateUI()
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.updateUI()
    }
  }

  goToPage() {
    const pageNumber = parseInt(this.pageInput.value)
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber
      this.updateUI()
    }
  }

  // Zoom
  zoomIn() {
    this.scale = Math.min(this.scale + 0.25, 3.0)
    this.applyZoom()
    this.updateUI()
  }

  zoomOut() {
    this.scale = Math.max(this.scale - 0.25, 0.25)
    this.applyZoom()
    this.updateUI()
  }

  applyZoom() {
    if (this.imageContent) {
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