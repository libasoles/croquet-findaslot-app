import { addDays, isWeekend, parseISO } from "date-fns";

export class DatesMatrix {
  constructor(settings) {
    this.settings = settings;
  }

  static generate(settings) {
    const [startDay, endDay] = settings.daysRange;
    const { halfHourIntervals, allowWeekends, createdAt } = settings;

    const firstDay = addDays(parseISO(createdAt), startDay);

    const range = DatesMatrix.datesRange(firstDay, {
      length: endDay - startDay,
      allowWeekends,
    });

    if (!halfHourIntervals) {
      return range.filter((date) => date.getMinutes() === 0);
    }

    return range;
  }

  static datesRange(date, { length, allowWeekends }) {
    const nextDay = addDays(date, 1);

    if (!allowWeekends && isWeekend(date))
      return [...DatesMatrix.datesRange(nextDay, { length, allowWeekends })];

    if (length === 0) {
      return [date];
    }

    return [
      date,
      ...DatesMatrix.datesRange(nextDay, { length: length - 1, allowWeekends }),
    ];
  }
}
