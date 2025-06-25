// Simple Document Preview Controller
class DocumentPreviewViewerController {
  constructor(element) {
    this.element = element
    this.fileUrl = element.dataset.documentPreviewViewerFileUrlValue
    this.docType = element.dataset.documentPreviewViewerDocTypeValue
    this.initialPage = parseInt(element.dataset.documentPreviewViewerInitialPageValue) || 1
    this.downloadName = element.dataset.documentPreviewViewerDownloadNameValue
    
    console.log('DocumentPreviewViewer initialized:', {
      fileUrl: this.fileUrl,
      docType: this.docType,
      initialPage: this.initialPage,
      downloadName: this.downloadName
    })
    
    this.currentPage = this.initialPage
    this.totalPages = 1
    this.scale = 1.0
    this.minScale = 0.25
    this.maxScale = 5.0
    this.scaleStep = 0.25

    this.setupElements()
    this.setupEventListeners()
    this.loadDocument()
  }

  setupElements() {
    this.loadingIndicator = this.element.querySelector('[data-document-preview--viewer-target="loadingIndicator"]')
    this.errorMessage = this.element.querySelector('[data-document-preview--viewer-target="errorMessage"]')
    this.pdfCanvas = this.element.querySelector('[data-document-preview--viewer-target="pdfCanvas"]')
    this.docxContent = this.element.querySelector('[data-document-preview--viewer-target="docxContent"]')
    this.imageContainer = this.element.querySelector('[data-document-preview--viewer-target="imageContainer"]')
    this.imageContent = this.element.querySelector('[data-document-preview--viewer-target="imageContent"]')
    this.prevBtn = this.element.querySelector('[data-document-preview--viewer-target="prevBtn"]')
    this.nextBtn = this.element.querySelector('[data-document-preview--viewer-target="nextBtn"]')
    this.pageInput = this.element.querySelector('[data-document-preview--viewer-target="pageInput"]')
    this.totalPagesEl = this.element.querySelector('[data-document-preview--viewer-target="totalPages"]')
    this.zoomLevel = this.element.querySelector('[data-document-preview--viewer-target="zoomLevel"]')
  }

  setupEventListeners() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousPage())
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextPage())
    }
    
    // Page input
    if (this.pageInput) {
      this.pageInput.addEventListener('change', () => this.goToPage())
    }
    
    // Zoom buttons
    const zoomInBtn = this.element.querySelector('[data-action*="zoomIn"]')
    const zoomOutBtn = this.element.querySelector('[data-action*="zoomOut"]')
    const fullscreenBtn = this.element.querySelector('[data-action*="toggleFullscreen"]')
    const downloadBtn = this.element.querySelector('[data-action*="downloadDocument"]')
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn())
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut())
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen())
    if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDocument())
  }

  async loadDocument() {
    try {
      this.showLoading()
      console.log('Loading document:', this.docType, this.fileUrl)
      
      switch(this.docType) {
        case 'pdf':
          await this.initPDF()
          break
        case 'image':
          await this.initImage()
          break
        case 'docx':
          await this.initDOCX()
          break
        default:
          throw new Error(`Type de document non supporté: ${this.docType}`)
      }
      
      this.hideLoading()
      this.updateUI()
    } catch (error) {
      console.error('Erreur lors du chargement du document:', error)
      this.showError()
    }
  }

  async initPDF() {
    console.log('Initializing PDF...')
    // Simple PDF implementation for now
    this.totalPages = 1
    this.showContent('PDF content will load here: ' + this.fileUrl)
  }

  async initImage() {
    console.log('Initializing Image...')
    return new Promise((resolve, reject) => {
      if (this.imageContent) {
        this.imageContent.onload = () => {
          this.showImageContainer()
          this.totalPages = 1
          resolve()
        }
        
        this.imageContent.onerror = () => {
          reject(new Error('Impossible de charger l\'image'))
        }
        
        this.imageContent.src = this.fileUrl
      } else {
        reject(new Error('Image container not found'))
      }
    })
  }

  async initDOCX() {
    console.log('Initializing DOCX...')
    this.totalPages = 1
    this.showContent('DOCX content will load here: ' + this.fileUrl)
  }

  // Navigation methods
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

  // Zoom methods
  zoomIn() {
    if (this.scale < this.maxScale) {
      this.scale = Math.min(this.scale + this.scaleStep, this.maxScale)
      this.updateUI()
    }
  }

  zoomOut() {
    if (this.scale > this.minScale) {
      this.scale = Math.max(this.scale - this.scaleStep, this.minScale)
      this.updateUI()
    }
  }

  toggleFullscreen() {
    console.log('Toggle fullscreen')
    // Fullscreen implementation will be added later
  }

  downloadDocument() {
    const link = document.createElement('a')
    link.href = this.fileUrl
    link.download = this.downloadName
    link.click()
  }

  // UI State management
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
    if (this.pdfCanvas) this.pdfCanvas.classList.add('hidden')
    if (this.docxContent) this.docxContent.classList.add('hidden')
    if (this.imageContainer) this.imageContainer.classList.add('hidden')
    if (this.errorMessage) this.errorMessage.classList.add('hidden')
  }

  updateUI() {
    // Update page info
    if (this.pageInput) this.pageInput.value = this.currentPage
    if (this.totalPagesEl) this.totalPagesEl.textContent = this.totalPages

    // Update navigation buttons
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage <= 1
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= this.totalPages

    // Update zoom level
    if (this.zoomLevel) this.zoomLevel.textContent = Math.round(this.scale * 100) + '%'
  }
}

// Initialize controllers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing document preview controllers...')
  
  const elements = document.querySelectorAll('[data-controller="document-preview--viewer"]')
  console.log('Found', elements.length, 'document preview elements')
  
  elements.forEach(element => {
    new DocumentPreviewViewerController(element)
  })
})