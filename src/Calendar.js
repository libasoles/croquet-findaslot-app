import { Model } from "@croquet/croquet";

export default class Calendar extends Model {
  init(_, persistedState = {}) {
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
      selectedSlotsByUser: this.selectedSlotsByUser,
      countedSlots: this.countedSlots(),
    });
  }

  countedSlots() {
    return this.mapToCountedSlots(this.selectedSlotsByUser);
  }

  takeBest(amount) {
    const slots = Array.from(this.countedSlots());

    return slots.sort(this.byVotes).slice(0, amount);
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

  everybodyCanAttendTo(slot) {
    const identity = this.wellKnownModel("identity");
    const numberOfUsers = identity.numberOfUsers();

    return this.usersWhoSelectedSlot(slot).length === numberOfUsers;
  }

  bestSlotForUsers(users) {
    const slots = this.usersCommonSlots(users);

    return slots.sort(this.byVotes).pop();
  }

  byVotes([_, votesA], [__, votesB]) {
    return votesB - votesA;
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
