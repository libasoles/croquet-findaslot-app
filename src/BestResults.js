import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { formatDate, target } from "./utils";
import createDotElements from "./components/Dots";
import i18next from "i18next";
import { scheduleLinks } from "./components/CalendarsLink";

export default class BestResultsView extends View {
  constructor(calendar, eventName, identity) {
    super(calendar);
    this.calendar = calendar;
    this.eventName = eventName;
    this.identity = identity;

    this.hydrate();

    this.subscribe(
      "calendar",
      "selected-slots-updated",
      this.renderMoreVotedResults
    );
  }

  hydrate() {
    this.renderMoreVotedResults({
      countedSlots: this.calendar.countedSlots(),
    });
  }

  renderMoreVotedResults({ countedSlots }) {
    if (countedSlots.size === 0) {
      render(<p>{i18next.t("no_results")}</p>, target(".best-results"));
      return;
    }

    const bestFiveOrderedByCount = this.calendar.takeBest(5);

    const results = (
      <ul>
        {bestFiveOrderedByCount.map(([timeSlot, votes], i) => {
          const date = formatDate(timeSlot);
          const time = new Date(timeSlot).getHours();
          const dots = createDotElements(votes);

          const schedule = scheduleLinks(
            this.eventName.eventName, // TODO: fresh event name
            timeSlot,
            timeSlot // TODO: calculated end time
          );

          const bestTwo = i < 2;
          const shouldOfferScheduleLinks =
            this.identity.numberOfUsers() > 1 &&
            this.calendar.everybodyCanAttendTo(timeSlot) &&
            bestTwo;

          return (
            <li>
              <div className="event">
                <span>
                  {date} - {time}hs
                </span>
                <div className="dots">{dots}</div>
                <p className="votes-count">
                  {votes} {i18next.t("votes")}
                </p>
              </div>
              {shouldOfferScheduleLinks ? schedule : ""}
            </li>
          );
        })}
      </ul>
    );

    render(results, target(".best-results"));
  }
}
