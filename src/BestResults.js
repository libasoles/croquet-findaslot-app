import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { formatDate, target } from "./utils";
import createDotElements from "./components/Dots";
import i18next from "i18next";
import { scheduleLinks } from "./components/CalendarsLink";
import { addMinutes } from "date-fns";

export default class BestResultsView extends View {
  constructor(calendar, event, identity, settings) {
    super(calendar);
    this.calendar = calendar;
    this.event = event;
    this.identity = identity;
    this.settings = settings;

    this.hydrate();

    this.subscribe(
      "calendar",
      "selected-slots-updated",
      this.renderMoreVotedResults
    );
    this.subscribe(
      "settings",
      "update-days-range",
      this.renderMoreVotedResults
    );
    this.subscribe(
      "settings",
      "update-time-range",
      this.renderMoreVotedResults
    );
    this.subscribe(
      "settings",
      "update-allow-weekends",
      this.renderMoreVotedResults
    );
    this.subscribe(
      "settings",
      "update-half-hours",
      this.renderMoreVotedResults
    );
    this.subscribe("settings", "update-duration", this.renderMoreVotedResults);
    this.subscribe(
      "event-name",
      "update-event-name",
      this.renderMoreVotedResults
    );
  }

  hydrate() {
    this.renderMoreVotedResults();
  }

  renderMoreVotedResults() {
    if (this.calendar.countedSlots().size === 0) {
      render(<p>{i18next.t("no_results")}</p>, target(".best-results"));
      return;
    }

    const bestFiveOrderedByCount = this.calendar.takeBest(5);

    const results = (
      <ul>
        {bestFiveOrderedByCount.map(([timeSlot, votes], i) => {
          const date = formatDate(timeSlot);
          const hours = new Date(timeSlot).getHours();
          const minutes = new Date(timeSlot).getMinutes();
          const time = minutes ? `${hours}:${minutes}` : hours;
          const dots = createDotElements(votes);

          const endTime = addMinutes(
            new Date(timeSlot),
            this.settings.duration * 60
          ).toISOString();
          const schedule = scheduleLinks(
            this.event.eventName, // TODO: fresh event name
            timeSlot,
            endTime
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
