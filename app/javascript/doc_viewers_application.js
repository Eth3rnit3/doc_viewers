import { Application } from "@hotwired/stimulus"
import { registerControllers } from "@hotwired/stimulus-loading"

const application = Application.start()

registerControllers(application, {
  "document-preview--viewer": () => import("./controllers/document_preview--viewer_controller")
})

export { application }