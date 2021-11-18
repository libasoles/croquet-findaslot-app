import { Model } from "@croquet/croquet";

export default class Calendar extends Model {
  init(_, persistedState = {}) {
    this.settings = this.wellKnownModel("settings");

    this.hydrate(persistedState);

    this.subscribe("calendar", "selection", this.storeSelection);
  }

  hydrate(persistedState) {
    this.selectedSlotsByUser = persistedState.selectedSlotsByUser
      ? new Map(persistedState.selectedSlotsByUser)
      : new Map();

    this.publishSelectedSlots();
  }

  save() {
    this.wellKnownModel("modelRoot").save();
  }

  serialize() {
    return { selectedSlotsByUser: Array.from(this.selectedSlotsByUser) };
  }

  storeSelection({ userId, slots }) {
    this.selectedSlotsByUser.set(userId, slots);

    this.save();

    this.publishSelectedSlots(userId);
  }

  publishSelectedSlots(userId = null) {
    this.publish("calendar", "selected-slots-updated", {
      triggeredBy: userId, // TODO: avoid passing this, that can be null. Why is needed?
    });
  }
}
