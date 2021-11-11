import { View } from "@croquet/croquet";
import SelectionArea from "@viselect/vanilla";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import {
  addHours,
  addDays,
  startOfToday,
  intlFormat,
  isWeekend,
} from "date-fns";
import { range, target } from "./utils";
import { config } from "./config";
import createDotElements from "./Dots";

const selectableOptions = {
  selectables: ["section.calendar .time-slot"],
  boundaries: ["section.calendar"],
  features: {
    touch: true,
    range: true,
    singleTap: {
      allow: true,
      intersect: "native",
    },
  },
};

// TODO: constants should be in Q
const dateFormat = {
  weekday: "long",
  // month: "short",
  day: "numeric",
};

export default class CalendarView extends View {
  constructor(model, identity, configuration, pills) {
    super(model);
    this.model = model;
    this.identity = identity;
    this.configuration = configuration;
    this.pills = pills;

    this.init();

    this.subscribeToEvents();
  }

  init() {
    this.selection = new SelectionArea(selectableOptions)
      //.on("beforestart", this.beforeSelectionStarts.bind(this)())
      .on("move", this.whileSelecting.bind(this))
      .on("stop", this.onSelectionEnd.bind(this));
  }

  subscribeToEvents() {
    this.subscribe("identity", "established", this.hydrate);

    this.subscribe(
      "calendar",
      "selected-slots-updated",
      this.displaySlotsState
    );

    this.subscribe("settings", "update-days-range", this.render);
    this.subscribe("settings", "update-time-range", this.render);
    this.subscribe("settings", "update-allow-weekends", this.render);

    this.subscribe(
      "calendar",
      "user-pills-selection",
      this.highlightSelectionForUsers
    );
  }

  hydrate() {
    this.render({
      lower: this.configuration.daysRange[0],
      upper: this.configuration.daysRange[1],
    });
  }

  generateListOfDates(date, length) {
    if (length === 0) return [date];

    const nextDay = addDays(date, 1);

    const allowWeekends = this.configuration.allowWeekends;

    if (!allowWeekends && isWeekend(date))
      return [...this.generateListOfDates(nextDay, length)];

    return [date, ...this.generateListOfDates(nextDay, --length)];
  }

  render() {
    const [startDay, endDay] = this.configuration.daysRange;
    const [startTime, endTime] = this.configuration.timeRange;

    const today = new Date(startOfToday());
    const firstDay = addDays(today, startDay);

    const daysRange = this.generateListOfDates(firstDay, endDay - startDay);

    const columns = (
      <>
        {daysRange.map((day) => {
          const formattedDate = intlFormat(day, dateFormat, {
            locale: config.locale,
          });

          return (
            <div className="day">
              <div className="title cell">{formattedDate}</div>
              <div className="day-schedule">
                {range(startTime, endTime).map((hours) => {
                  const timestamp = addHours(day, hours).toISOString();

                  return (
                    <div className="time-slot cell" data-slot={timestamp}>
                      <div className="dots"></div>
                      {hours + "hs"}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );

    render(columns, target(".calendar-columns"));

    this.displaySlotsState();
  }

  displaySlotsState() {
    const selfId = this.me();

    this.highlightSelectionForUsers({
      userId: selfId,
      selectedUsersIds: this.pills.pillsForUser(selfId),
    });

    this.displayVotes({ countedSlots: this.model.countedSlots() });
  }

  displayVotes({ countedSlots }) {
    const slotElement = Array.from(
      document.getElementsByClassName("time-slot")
    );

    slotElement.forEach((cell) => {
      this.addDotsToCalendarSlot(countedSlots, cell);
    });
  }

  beforeSelectionStarts() {
    let timeout = null;

    return ({ event }) => {
      // Check if user already tapped inside of a selection-area.
      if (timeout !== null) {
        // A second pointer-event occurred, ignore that one.
        clearTimeout(timeout);
        timeout = null;
      } else {
        // Wait 50ms in case the user uses two fingers to scroll.
        timeout = setTimeout(() => {
          // OK User used only one finger, we can safely initiate a selection and reset the timer.
          this.selection.trigger(event);
          timeout = null;
        }, 50);
      }

      // Never start automatically.
      return false;
    };
  }

  whileSelecting({
    store: {
      changed: { added, removed },
    },
  }) {
    for (const el of added) {
      el.classList.add("selected");
    }

    for (const el of removed) {
      el.classList.remove("selected");
    }
  }

  onSelectionEnd({ store }) {
    const selfId = this.me();

    const previousSelection = this.model.userSelection(selfId);
    const added = store.changed.added.map((added) => added.dataset.slot);
    const selected = store.selected.map((selected) => selected.dataset.slot);
    const removed = store.changed.removed.map(
      (removed) => removed.dataset.slot
    );

    const selection = previousSelection
      .filter((slot) => !removed.includes(slot))
      .concat(added)
      .concat(selected);

    this.publish("calendar", "selection", {
      userId: selfId,
      slots: Array.from(new Set(selection)),
    });
  }

  highlightSelectionForUsers({ userId, selectedUsersIds }) {
    const selfId = this.me();
    if (userId !== selfId) return;

    this.clearHighlights();

    selectedUsersIds.forEach((userId) => {
      this.highlightSelectionForUser(userId);
    });
  }

  clearHighlights() {
    document.querySelectorAll(".calendar .selected").forEach((slot) => {
      slot.classList.remove("selected");
    });

    this.selection.clearSelection();
  }

  highlightSelectionForUser(userId) {
    const { selectedSlotsByUser } = this.model;

    const slotSelection = selectedSlotsByUser.has(userId)
      ? selectedSlotsByUser.get(userId)
      : [];

    slotSelection.forEach((selection) => {
      const slot = document.querySelector(`[data-slot="${selection}"]`);
      slot.classList.add("selected");
    });

    this.selection.select(".calendar .selected");
  }

  addDotsToCalendarSlot(countedSlots, cell) {
    const votes = countedSlots.get(cell.dataset.slot) || 0;

    const dotsElement = cell.querySelector(".dots");

    if (votes === 0) {
      while (dotsElement.firstChild) {
        dotsElement.removeChild(dotsElement.firstChild);
      }
      return;
    }

    const dots = createDotElements(votes);

    render(<>{dots}</>, dotsElement);
  }

  me() {
    return this.identity.selfId(this.viewId);
  }
}
