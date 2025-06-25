Rails.application.routes.draw do
  mount DocViewers::Engine => "/doc_viewers"
  
  root "preview#index"
  get "preview", to: "preview#index"
end
