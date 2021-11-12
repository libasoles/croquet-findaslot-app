import { View } from "@croquet/croquet";

export class FeedbackView extends View {
  constructor() {
    super();

    document.querySelector(".feedback").onclick = () => {
      document.querySelector(".feedback-modal").classList.remove("hidden");
    };

    document.querySelector(".feedback-modal .close").onclick = () => {
      document.querySelector(".feedback-modal").classList.add("hidden");
    };
  }
}
