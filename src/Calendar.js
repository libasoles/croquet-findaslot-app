import { Model } from "@croquet/croquet";

export default class Calendar extends Model {
  init() {
    this.selectedSlotsByUser = new Map();

    this.subscribe("calendar", "selection", this.storeSelection);
  }

  storeSelection({ viewId, slots }) {
    this.selectedSlotsByUser.set(viewId, slots);

    this.publish("calendar", "selected-slots", {
      selectedSlotsByUser: this.selectedSlotsByUser,
      countedSlots: this.countedSlots(),
    });
  }

  countedSlots() {
    return this.mapToCountedSlots(this.selectedSlotsByUser);
  }

  mapToCountedSlots(slotsByUser) {
    const slotsCounted = new Map();

    slotsByUser.forEach((slots) => {
      if (!slots.length) return;

      slots.forEach((slot) => {
        const count = (slotsCounted.get(slot) || 0) + 1;
        slotsCounted.set(slot, count);
      });
    });
    return slotsCounted;
  }
}
