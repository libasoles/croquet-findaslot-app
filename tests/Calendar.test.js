import Calendar from "../src/Calendar";
import { CalendarService } from "../src/CalendarService";
import { addDays, parseISO, toDate } from "date-fns";
import { DatesMatrix } from "../src/DatesMatrix";

const userId = "x632kjda";
const anotherUserId = "dHy6sFxo";
const todayMonday15ofNovember = new Date("2021-11-15:00:00:00").getTime();
const aValidDate = "2021-11-17T13:00:00.000Z";
const outOfRangeDate = "2021-11-01T13:00:00.000Z";

describe("CalendarService", () => {
  let calendar;
  let calendarService;
  let settings;
  let identity = {
    numberOfUsers: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(todayMonday15ofNovember);

    mockSettings();

    calendar = Calendar.create();

    createCalendarService();
  });

  function createCalendarService() {
    calendarService = new CalendarService(calendar, settings, identity);
  }

  function mockSettings(overrides = {}) {
    settings = {
      daysRange: [0, 5],
      halfHourIntervals: false,
      allowWeekends: false,
      createdAt: toDate(todayMonday15ofNovember).toISOString(),
      ...overrides,
    };
  }

  function mockIdentity(behaviour) {
    identity = {
      ...behaviour,
    };
  }

  function vote(userId, slots) {
    calendar.storeSelection({
      userId,
      slots,
    });
  }

  function setDaysRange(daysRange) {
    return new CalendarService(
      calendar,
      {
        ...settings,
        daysRange,
      },
      identity
    );
  }

  it("should retrieve the correct count of selected slots, indexed by datetime", () => {
    const aDate = "2021-11-16T12:00:00.000Z";
    const anotherDate = "2021-11-18T13:00:00.000Z";
    const yetanotherDate = "2021-11-18T14:00:00.000Z";
    vote(userId, [aDate, anotherDate]);
    vote(anotherUserId, [aDate, anotherDate, yetanotherDate]);

    const countedSlots = calendarService.countedSlots();

    expect(countedSlots.get(aDate)).toBe(2);
    expect(countedSlots.get(anotherDate)).toBe(2);
    expect(countedSlots.get(yetanotherDate)).toBe(1);
  });

  it("should retrieve selected dates event if they are outside the current dates matrix", () => {
    const slot = "2021-11-09T12:00:00.000Z";
    calendar.storeSelection({ userId, slots: [slot] });

    calendarService = setDaysRange([0, 5]);

    const countedSlots = calendarService.countedSlots();

    expect(countedSlots.get(slot)).toBe(1);
  });

  it("should retrieves the best dates based on votes", () => {
    const moreVotedSlot = "2021-11-17T13:00:00.000Z";
    const lessVotedSlot = "2021-11-17T14:00:00.000Z";

    vote(userId, [moreVotedSlot, lessVotedSlot]);
    vote(anotherUserId, [moreVotedSlot]);
    vote("dsfk78sdf", [
      moreVotedSlot,
      "2021-11-15T15:00:00.000Z",
      "2021-11-17T12:00:00.000Z",
    ]);
    vote("ljklj4sdf", [
      moreVotedSlot,
      "2021-11-15T15:00:00.000Z",
      "2021-11-17T12:00:00.000Z",
    ]);

    const bestThree = calendarService.takeBest(3);

    const slots = bestThree.map(([slot, votes]) => slot);

    expect(bestThree.length).toBe(3);
    expect(slots[0]).toBe(moreVotedSlot);
    expect(slots).not.toContain(lessVotedSlot);
  });

  it("should retrieves the best dates ordered by proximity", () => {
    const closestSlot = "2021-11-17T13:00:00.000Z";
    const farthestSlot = "2021-11-17T14:00:00.000Z";

    vote(userId, [farthestSlot, closestSlot]);
    vote(anotherUserId, [farthestSlot, closestSlot]);

    const bestThree = calendarService.takeBest(2);

    const slots = bestThree.map(([slot, votes]) => slot);

    expect(slots[0]).toBe(closestSlot);
  });

  it("assures if user has any valid selection", () => {
    const userWithOutOfRangeSelection = "sdf63jksdf";

    vote(userId, [aValidDate]);
    vote(anotherUserId, []);
    vote(userWithOutOfRangeSelection, [outOfRangeDate]);

    expect(calendarService.userHasAnySelection(userId)).toBeTruthy();
    expect(calendarService.userHasAnySelection(anotherUserId)).toBeFalsy();
    expect(
      calendarService.userHasAnySelection(userWithOutOfRangeSelection)
    ).toBeFalsy();
  });

  it("is possible to return entire user selection, no matter if valid or not", () => {
    vote(userId, [aValidDate, outOfRangeDate]);

    const userSelection = calendarService.userRawSelection(userId);

    expect(userSelection).toContain(aValidDate);
    expect(userSelection).toContain(outOfRangeDate);
  });

  it("retrieves all users who selected a given slot", () => {
    const aDate = "2021-11-16T12:00:00.000Z";
    const anotherDate = "2021-11-18T13:00:00.000Z";
    const userWithDifferentSelection = "sdf63jksdf";

    vote(userId, [aDate]);
    vote(anotherUserId, [aDate]);
    vote(userWithDifferentSelection, [anotherDate]);

    const users = calendarService.usersWhoSelectedSlot(aDate);

    expect(users).toContain(userId);
    expect(users).toContain(anotherUserId);
    expect(users).not.toContain(userWithDifferentSelection);
  });

  it("doesn't matter if slot is invalid", () => {
    vote(userId, [outOfRangeDate]);

    const users = calendarService.usersWhoSelectedSlot(outOfRangeDate);

    expect(users).toContain(userId);
  });

  it("assert that everybody can attend a given date", () => {
    const aDate = "2021-11-16T12:00:00.000Z";
    const anotherDate = "2021-11-18T13:00:00.000Z";
    mockIdentity({
      numberOfUsers: () => 2,
    });
    createCalendarService();

    vote(userId, [aDate]);
    vote(anotherUserId, [aDate, anotherDate]);

    expect(calendarService.everybodyCanAttendTo(aDate)).toBeTruthy();
    expect(calendarService.everybodyCanAttendTo(anotherDate)).toBeFalsy();
  });

  it("retrieve to closest possible slot for selected users", () => {
    const closestDate = "2021-11-16T12:00:00.000Z";
    const farthestDate = "2021-11-18T13:00:00.000Z";

    vote(userId, [farthestDate, closestDate]);
    vote(anotherUserId, [farthestDate, closestDate]);

    const bestSlot = calendarService.bestSlotForUsers([userId, anotherUserId]);

    expect(bestSlot).toBe(closestDate);
  });

  it("discards invalid dates", () => {
    const startDate = parseISO("2021-11-13T13:00:00.000Z");
    jest.useFakeTimers().setSystemTime(startDate);

    const validDate = "2021-11-18T13:00:00.000Z";
    const invalidBecauseOutOfRange = "2020-11-18T13:00:00.000Z";
    const invalidBecauseIsPast = startDate.toISOString();
    const invalidBecauseHasMinutes = "2021-11-18T13:30:00.000Z";

    const nextDate = addDays(startDate, 1);
    jest.useFakeTimers().setSystemTime(nextDate);

    const validDates = calendarService.filterValid([
      validDate,
      invalidBecauseOutOfRange,
      invalidBecauseIsPast,
      invalidBecauseHasMinutes,
    ]);

    expect(validDates).toContain(validDate);
    expect(validDates).not.toContain(invalidBecauseOutOfRange);
    expect(validDates).not.toContain(invalidBecauseIsPast);
    expect(validDates).not.toContain(invalidBecauseHasMinutes);
  });
});

describe("CalendarService", () => {
  let settings = {
    daysRange: [0, 6],
    halfHourIntervals: false,
    allowWeekends: false,
    createdAt: toDate(todayMonday15ofNovember).toISOString(),
  };

  it("generates a matrix without weekends", () => {
    jest.useFakeTimers().setSystemTime(todayMonday15ofNovember);
    const matrix = DatesMatrix.generate({
      ...settings,
      allowWeekends: false,
    });

    const isoDatesMatrix = matrix.map((date) => date.toISOString());

    expect(isoDatesMatrix).toEqual([
      "2021-11-15T03:00:00.000Z",
      "2021-11-16T03:00:00.000Z",
      "2021-11-17T03:00:00.000Z",
      "2021-11-18T03:00:00.000Z",
      "2021-11-19T03:00:00.000Z",
      "2021-11-22T03:00:00.000Z",
      "2021-11-23T03:00:00.000Z",
    ]);
  });

  it("generates a matrix including weekends", () => {
    const matrix = DatesMatrix.generate({
      ...settings,
      allowWeekends: true,
    });

    const isoDatesMatrix = matrix.map((date) => date.toISOString());

    expect(isoDatesMatrix).toEqual([
      "2021-11-15T03:00:00.000Z",
      "2021-11-16T03:00:00.000Z",
      "2021-11-17T03:00:00.000Z",
      "2021-11-18T03:00:00.000Z",
      "2021-11-19T03:00:00.000Z",
      "2021-11-20T03:00:00.000Z",
      "2021-11-21T03:00:00.000Z",
    ]);
  });
});
