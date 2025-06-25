module DocViewers
  module ApplicationHelper
    def document_preview_for(record, file_field:, **options)
      return unless record && record.respond_to?(file_field)

      attachment = record.public_send(file_field)
      return unless attachment&.attached?

      file_url = if attachment.respond_to?(:url)
        attachment.url
      elsif Rails.application.routes.url_helpers.respond_to?(:rails_blob_path)
        Rails.application.routes.url_helpers.rails_blob_path(attachment)
      else
        attachment.service_url
      end

      render DocumentPreview::ViewerComponent.new(
        file_url: file_url,
        download_name: attachment.filename.to_s,
        **options
      )
    end

    def document_preview_from_url(file_url, **options)
      doc_type = options[:doc_type] || detect_doc_type_from_url(file_url)
      download_name = options[:download_name] || extract_filename_from_url(file_url)
      initial_page = options[:initial_page] || 1

      render partial: "doc_viewers/shared/document_viewer",
             locals: {
               file_url: file_url,
               doc_type: doc_type,
               download_name: download_name,
               initial_page: initial_page,
               image_urls: nil
             }
    end

    def document_preview_from_images(image_urls, **options)
      download_name = options[:download_name] || "images-collection"
      initial_page = options[:initial_page] || 1

      render partial: "doc_viewers/shared/document_viewer",
             locals: {
               file_url: image_urls.is_a?(Array) ? image_urls.first : image_urls,
               doc_type: "images",
               download_name: download_name,
               initial_page: initial_page,
               image_urls: image_urls.is_a?(Array) ? image_urls : [image_urls]
             }
    end

    private

    def detect_doc_type_from_url(url)
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

    def extract_filename_from_url(url)
      return "document" unless url

      File.basename(url.to_s, ".*")
    end
  end
end
