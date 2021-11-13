import { View } from "@croquet/croquet";
import { element } from "./utils";

export class FeedbackView extends View {
  constructor() {
    super();

    element(".feedback").onclick = () => {
      element(".feedback-modal").classList.remove("hidden");
    };

    element(".feedback-modal .close").onclick = () => {
      element(".feedback-modal").classList.add("hidden");
    };
  }
}
