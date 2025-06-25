module DocumentPreview
  class ViewerComponent < ViewComponent::Base
    attr_reader :file_url, :doc_type, :initial_page, :download_name, :options

    def initialize(file_url:, doc_type: nil, initial_page: 1, download_name: nil, **options)
      @file_url = file_url
      @doc_type = doc_type || detect_doc_type(file_url)
      @initial_page = initial_page
      @download_name = download_name || extract_filename(file_url)
      @options = options
    end

    private

    def detect_doc_type(url)
      return "unknown" unless url

      case File.extname(url.to_s).downcase
      when ".pdf"
        "pdf"
      when ".docx"
        "docx"
      when ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"
        "image"
      else
        "unknown"
      end
    end

    def extract_filename(url)
      return "document" unless url

      File.basename(url.to_s, ".*")
    end

    def viewer_data
      {
        controller: "document-preview--viewer",
        "document-preview--viewer-file-url-value": file_url,
        "document-preview--viewer-doc-type-value": doc_type,
        "document-preview--viewer-initial-page-value": initial_page,
        "document-preview--viewer-download-name-value": download_name
      }
    end

    def container_classes
      "document-preview-viewer grid grid-rows-[auto,1fr] h-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
    end

    def toolbar_classes
      "document-preview-toolbar flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm"
    end

    def canvas_classes
      "document-preview-canvas flex-1 overflow-hidden bg-gray-100 flex items-center justify-center"
    end
  end
end