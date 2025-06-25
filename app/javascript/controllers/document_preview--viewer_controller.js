import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "loadingIndicator", "errorMessage", "pdfCanvas", "docxContent", 
    "imageContainer", "imageContent", "prevBtn", "nextBtn", 
    "pageInput", "totalPages", "zoomLevel"
  ]

  static values = {
    fileUrl: String,
    docType: String,
    initialPage: Number,
    downloadName: String,
    imageUrls: Array
  }

  connect() {
    this.currentPage = this.initialPageValue || 1
    this.totalPages = 1
    this.scale = 1.0
    this.pdfDocument = null
    
    this.loadDocument()
  }

  async loadDocument() {
    try {
      this.showLoading()
      await this.initializeDocumentType()
      this.hideLoading()
      this.updateUI()
    } catch (error) {
      this.showError()
    }
  }

  async initializeDocumentType() {
    switch(this.docTypeValue) {
      case 'image':
      case 'images':
        await this.initializeImages()
        break
      case 'pdf':
        await this.initializePDF()
        break
      case 'docx':
        await this.initializeDOCX()
        break
    }
  }

  async initializeImages() {
    if (this.hasImageUrlsValue && this.imageUrlsValue.length > 0) {
      this.totalPages = this.imageUrlsValue.length
      const currentImageUrl = this.imageUrlsValue[this.currentPage - 1]
      await this.loadSingleImage(currentImageUrl)
    } else {
      this.totalPages = 1
      await this.loadSingleImage(this.fileUrlValue)
    }
  }

  async loadSingleImage(imageUrl) {
    return new Promise((resolve, reject) => {
      if (!this.hasImageContentTarget) {
        reject(new Error('Image container not found'))
        return
      }

      this.imageContentTarget.onload = () => {
        this.showImageContainer()
        resolve()
      }

      this.imageContentTarget.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`))
      }

      this.imageContentTarget.src = imageUrl
    })
  }

  async initializePDF() {
    try {
      const pdfLib = await this.waitForPDFLib()
      if (!pdfLib) {
        throw new Error('PDF.js library not loaded')
      }

      const loadingTask = pdfLib.getDocument(this.fileUrlValue)
      this.pdfDocument = await loadingTask.promise
      this.totalPages = this.pdfDocument.numPages

      await this.renderPDFPage()
      this.showPDFCanvas()
    } catch (error) {
      this.showContent(`Error loading PDF: ${error.message}`)
    }
  }

  async waitForPDFLib() {
    let pdfLib = window.pdfjsLib || window.pdfjs
    
    if (!pdfLib) {
      await new Promise(resolve => setTimeout(resolve, 500))
      pdfLib = window.pdfjsLib || window.pdfjs
    }
    
    return pdfLib
  }

  async renderPDFPage() {
    if (!this.pdfDocument || !this.hasPdfCanvasTarget) return

    const page = await this.pdfDocument.getPage(this.currentPage)
    const viewport = page.getViewport({ scale: this.scale })

    const context = this.pdfCanvasTarget.getContext('2d')
    this.pdfCanvasTarget.height = viewport.height
    this.pdfCanvasTarget.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    await page.render(renderContext).promise
  }

  async initializeDOCX() {
    this.showContent('DOCX viewer will be implemented with Mammoth.js')
  }

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
    const pageNumber = parseInt(this.pageInputTarget.value)
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber
      await this.renderCurrentPage()
      this.updateUI()
    }
  }

  async renderCurrentPage() {
    if (this.docTypeValue === 'pdf' && this.pdfDocument) {
      await this.renderPDFPage()
    } else if (this.isImageType() && this.hasImageUrlsValue && this.imageUrlsValue.length > 0) {
      const currentImageUrl = this.imageUrlsValue[this.currentPage - 1]
      if (currentImageUrl) {
        await this.loadSingleImage(currentImageUrl)
      }
    }
  }

  isImageType() {
    return this.docTypeValue === 'images' || this.docTypeValue === 'image'
  }

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
    if (this.docTypeValue === 'pdf' && this.pdfDocument) {
      await this.renderPDFPage()
    } else if (this.hasImageContentTarget) {
      this.imageContentTarget.style.transform = `scale(${this.scale})`
    }
  }

  toggleFullscreen() {
    if (typeof screenfull !== 'undefined' && screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.exit()
      } else {
        screenfull.request(this.element)
      }
    }
  }

  downloadDocument() {
    const link = document.createElement('a')
    link.href = this.fileUrlValue
    link.download = this.downloadNameValue || 'document'
    link.click()
  }

  showLoading() {
    if (this.hasLoadingIndicatorTarget) this.loadingIndicatorTarget.classList.remove('hidden')
    this.hideAllContent()
  }

  hideLoading() {
    if (this.hasLoadingIndicatorTarget) this.loadingIndicatorTarget.classList.add('hidden')
  }

  showError() {
    this.hideLoading()
    this.hideAllContent()
    if (this.hasErrorMessageTarget) this.errorMessageTarget.classList.remove('hidden')
  }

  showContent(text) {
    this.hideAllContent()
    if (this.hasDocxContentTarget) {
      this.docxContentTarget.innerHTML = `<p class="text-center text-gray-600 p-8">${text}</p>`
      this.docxContentTarget.classList.remove('hidden')
    }
  }

  showImageContainer() {
    this.hideAllContent()
    if (this.hasImageContainerTarget) this.imageContainerTarget.classList.remove('hidden')
  }

  showPDFCanvas() {
    this.hideAllContent()
    if (this.hasPdfCanvasTarget) this.pdfCanvasTarget.classList.remove('hidden')
  }

  hideAllContent() {
    const targets = ['pdfCanvas', 'docxContent', 'imageContainer', 'errorMessage']
    targets.forEach(targetName => {
      const hasMethod = `has${targetName.charAt(0).toUpperCase() + targetName.slice(1)}Target`
      const targetProperty = `${targetName}Target`
      if (this[hasMethod] && this[targetProperty]) {
        this[targetProperty].classList.add('hidden')
      }
    })
  }

  updateUI() {
    if (this.hasPageInputTarget) this.pageInputTarget.value = this.currentPage
    if (this.hasTotalPagesTarget) this.totalPagesTarget.textContent = this.totalPages
    if (this.hasZoomLevelTarget) this.zoomLevelTarget.textContent = Math.round(this.scale * 100) + '%'

    if (this.hasPrevBtnTarget) this.prevBtnTarget.disabled = this.currentPage <= 1
    if (this.hasNextBtnTarget) this.nextBtnTarget.disabled = this.currentPage >= this.totalPages
  }
}