import { addDays, isWeekend, parseISO } from "date-fns";

export class DatesMatrix {
  static generate(settings) {
    const [startDay, endDay] = settings.daysRange;
    const { allowWeekends, createdAt } = settings;

    const firstDay = addDays(parseISO(createdAt), startDay);

    const range = DatesMatrix.datesRange(firstDay, {
      length: endDay - startDay,
      allowWeekends,
    });

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
