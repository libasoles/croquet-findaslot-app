import { Model } from "@croquet/croquet";
import { addDays, formatISO, isWeekend, parseISO, toDate } from "date-fns";

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
      selectedSlotsByUser: this.selectedSlotsByUser,
      countedSlots: this.countedSlots(),
    });
  }

  countedSlots() {
    return this.mapToCountedSlots(this.selectedSlotsByUser);
  }

  takeBest(amount) {
    const slots = Array.from(this.countedSlots());

    const validDates = this.filterValid(slots.map(([slot]) => slot));

    return slots
      .filter(([slot]) => validDates.includes(slot))
      .sort(this.byVotes) // TODO: closest dates first
      .slice(0, amount);
  }

  mapToCountedSlots(slotsByUser) {
    const slotsCounted = new Map();

    slotsByUser.forEach((slots) => {
      if (!slots.length) return;

      this.filterValid(slots).forEach((slot) => {
        const count = (slotsCounted.get(slot) || 0) + 1;
        slotsCounted.set(slot, count);
      });
    });

    return slotsCounted;
  }

  userHasAnySelection(userId) {
    if (!this.selectedSlotsByUser.has(userId)) return false;

    const slots = this.selectedSlotsByUser.get(userId);

    return this.filterValid(slots).length > 0;
  }

  userSelection(userId) {
    if (!this.selectedSlotsByUser.has(userId)) return [];

    const slots = Array.from(this.selectedSlotsByUser.get(userId));

    return this.filterValid(slots);
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

    return this.filterValid(slots).sort(this.byVotes).shift();
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

  filterValid(dates) {
    const validDatesWithoutTime = this.validDates().map(this.dateWithoutTime);

    return dates.filter((date) =>
      validDatesWithoutTime.includes(this.dateWithoutTime(parseISO(date)))
    );
  }

  dateWithoutTime(date) {
    return formatISO(date, { representation: "date" });
  }

  validDates() {
    const [startDay, endDay] = this.settings.daysRange;
    const createdAt = this.settings.createdAt;

    // it's ok to create a date here, dismiss croquet warning
    const firstDay = addDays(parseISO(createdAt), startDay);

    return this.validDatesRange(firstDay, endDay - startDay);
  }

  validDatesRange(date, length) {
    const allowWeekends = this.settings.allowWeekends;
    const nextDay = addDays(date, 1);

    if (!allowWeekends && isWeekend(date))
      return [...this.validDatesRange(nextDay, length)];

    if (length === 0) {
      return [date];
    }

    return [date, ...this.validDatesRange(nextDay, --length)];
  }
}
