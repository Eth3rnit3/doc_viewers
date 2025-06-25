class PreviewController < ApplicationController
  def index
    # Exemples avec URLs simples
    @pdf_url = "http://127.0.0.1:3000/networkmarketingsecretsdigitaleditionpdf.pdf"
    @image_url = "https://placehold.co/600x400/png"
  end
end