import { formatISO, isBefore, parseISO } from "date-fns";
import { today } from "./utils";
import { DatesMatrix } from "./DatesMatrix";

export class CalendarService {
  constructor(calendar, settings, identity) {
    this.calendar = calendar;
    this.settings = settings;
    this.identity = identity;
  }

  countedSlots() {
    const slotsCounted = new Map();

    this.calendar.selectedSlotsByUser.forEach((slots) => {
      if (!slots.length) return;

      slots.forEach((slot) => {
        const count = (slotsCounted.get(slot) || 0) + 1;
        slotsCounted.set(slot, count);
      });
    });

    return slotsCounted;
  }

  takeBest(amount) {
    const slots = Array.from(this.countedSlots());

    const validDates = this.filterValid(slots.map(([slot]) => slot));

    return slots
      .filter(([slot]) => validDates.includes(slot))
      .sort(this.byVotes) // TODO: closest dates first
      .slice(0, amount);
  }

  userHasAnySelection(userId) {
    if (!this.calendar.selectedSlotsByUser.has(userId)) return false;

    const slots = this.calendar.selectedSlotsByUser.get(userId);

    return this.filterValid(slots).length > 0;
  }

  userRawSelection(userId) {
    if (!this.calendar.selectedSlotsByUser.has(userId)) return [];

    return Array.from(this.calendar.selectedSlotsByUser.get(userId));
  }

  usersWhoSelectedSlot(slot) {
    return Array.from(this.calendar.selectedSlotsByUser)
      .filter(([_, slots]) => slots.includes(slot))
      .map(([userId, _]) => userId);
  }

  everybodyCanAttendTo(slot) {
    const numberOfUsers = this.identity.numberOfUsers();

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
    return this.userRawSelection(sampleUser).filter((slot) => {
      return users.every((userId) => {
        return this.userRawSelection(userId).includes(slot);
      });
    });
  }

  filterValid(dates) {
    const datesMatrix = DatesMatrix.generate(this.settings);
    const validDatesWithoutTime = datesMatrix.map(this.dateWithoutTime);

    const now = today();
    const areHalfHoursAllowed = this.settings.halfHourIntervals;

    const startingToday = (date) => !isBefore(parseISO(date), now);
    const withinMatrix = (date) =>
      validDatesWithoutTime.includes(this.dateWithoutTime(parseISO(date)));

    const halfHoursIfNotAllowed = (date) => {
      return areHalfHoursAllowed ? date : parseISO(date).getMinutes() === 0;
    };

    return dates
      .filter(withinMatrix)
      .filter(startingToday)
      .filter(halfHoursIfNotAllowed);
  }

  dateWithoutTime(date) {
    return formatISO(date, { representation: "date" });
  }
}
