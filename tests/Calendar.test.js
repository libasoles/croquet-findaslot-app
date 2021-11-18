import Calendar from "../src/Calendar";
import { CalendarService } from "../src/CalendarService";
import { toDate } from "date-fns";

const userId = "x632kjda";
const anotherUserId = "dHy6sFxo";

describe("CalendarService", () => {
  let calendar;
  let calendarService;
  let settings;
  let today = new Date("2021-11-15:00:00:00").getTime();
  const identity = {};

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(today);

    mockSettings();

    calendar = Calendar.create();
    calendarService = new CalendarService(calendar, settings, identity);
  });

  function mockSettings(overrides = {}) {
    settings = {
      daysRange: [0, 5],
      halfHourIntervals: false,
      allowWeekends: false,
      createdAt: toDate(today).toISOString(),
      ...overrides,
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
    let oneSlot = "2021-11-16T12:00:00.000Z";
    let anotherSlot = "2021-11-18T13:00:00.000Z";
    let yetAnotherSlot = "2021-11-18T14:00:00.000Z";
    vote(userId, [oneSlot, anotherSlot]);
    vote(anotherUserId, [oneSlot, anotherSlot, yetAnotherSlot]);

    const countedSlots = calendarService.countedSlots();

    expect(countedSlots.get(oneSlot)).toBe(2);
    expect(countedSlots.get(anotherSlot)).toBe(2);
    expect(countedSlots.get(yetAnotherSlot)).toBe(1);
  });

  it("should retrieve selected dates event if they are outside the current dates matrix", () => {
    let slot = "2021-11-09T12:00:00.000Z";
    calendar.storeSelection({ userId, slots: [slot] });

    calendarService = setDaysRange([0, 5]);

    const countedSlots = calendarService.countedSlots();

    expect(countedSlots.get(slot)).toBe(1);
  });

  it("should retrieves the best dates based on votes", () => {
    let moreVotedSlot = "2021-11-17T13:00:00.000Z";
    let lessVotedSlot = "2021-11-17T14:00:00.000Z";

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
    let closestSlot = "2021-11-17T13:00:00.000Z";
    let farthestSlot = "2021-11-17T14:00:00.000Z";

    vote(userId, [farthestSlot, closestSlot]);
    vote(anotherUserId, [farthestSlot, closestSlot]);

    const bestThree = calendarService.takeBest(2);

    const slots = bestThree.map(([slot, votes]) => slot);

    expect(slots[0]).toBe(closestSlot);
  });
});
