class PreviewController < ApplicationController
  def index
    # Exemples avec URLs simples
    @pdf_url = "http://127.0.0.1:3000/networkmarketingsecretsdigitaleditionpdf.pdf"
    @image_url = "https://placehold.co/600x400/png"
    
    # Collection d'images pour tester la navigation multi-pages
    @image_collection = [
      "https://placehold.co/600x400/ff6b6b/ffffff?text=Page+1",
      "https://placehold.co/600x400/4ecdc4/ffffff?text=Page+2", 
      "https://placehold.co/600x400/45b7d1/ffffff?text=Page+3",
      "https://placehold.co/600x400/f9ca24/ffffff?text=Page+4",
      "https://placehold.co/600x400/6c5ce7/ffffff?text=Page+5"
    ]
  end
end