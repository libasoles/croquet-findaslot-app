import { Model } from "@croquet/croquet";

export default class Calendar extends Model {
  init() {
    this.selectedSlotsByUser = new Map();

    this.subscribe("calendar", "selection", this.storeSelection);
  }

  storeSelection({ userId, slots }) {
    this.selectedSlotsByUser.set(userId, slots);

    this.publish("calendar", "selected-slots-updated", {
      triggeredBy: userId,
      selectedSlotsByUser: this.selectedSlotsByUser,
      countedSlots: this.countedSlots(),
    });
  }

  countedSlots() {
    return this.mapToCountedSlots(this.selectedSlotsByUser);
  }

  takeBest(amount) {
    return Array.from(this.countedSlots())
      .sort(([slotA, countA], [slotB, countB]) => countB - countA)
      .slice(0, amount);
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

  userHasAnySelection(userId) {
    if (!this.selectedSlotsByUser.has(userId)) return false;

    return this.selectedSlotsByUser.get(userId).length > 0;
  }

  userSelection(userId) {
    if (!this.selectedSlotsByUser.has(userId)) return [];

    return Array.from(this.selectedSlotsByUser.get(userId));
  }

  usersWhoSelectedSlot(slot) {
    return Array.from(this.selectedSlotsByUser)
      .filter(([_, slots]) => slots.includes(slot))
      .map(([userId, _]) => userId);
  }

  usersCommonSlots(users) {
    const sampleUser = users.shift();
    return this.userSelection(sampleUser).filter((slot) => {
      return users.every((userId) => {
        return this.userSelection(userId).includes(slot);
      });
    });
  }
}
