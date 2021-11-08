import { Model } from "@croquet/croquet";

export default class Calendar extends Model {
  init() {
    this.selectedSlotsByUser = new Map();

    this.subscribe("calendar", "selection", this.storeSelection);
  }

  storeSelection({ viewId, slots }) {
    this.selectedSlotsByUser.set(viewId, slots);

    this.publish(
      "calendar",
      "selected-slots-by-user",
      this.selectedSlotsByUser
    );
  }
}
