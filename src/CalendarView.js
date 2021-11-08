import { View } from "@croquet/croquet";
import SelectionArea from "@viselect/vanilla";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { addHours, addDays, startOfToday, intlFormat } from "date-fns";
import { locale, range, target } from "./utils";
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
  constructor(model, configuration) {
    super(model);
    this.model = model;

    this.configuration = configuration;

    this.init();

    this.hydrate();

    this.subscribeToEvents();
  }

  init() {
    this.daysRange = this.configuration.daysRange;
    this.timeRange = this.configuration.timeRange;

    this.selection = new SelectionArea(selectableOptions)
      .on("beforestart", this.beforeSelectionStarts.bind(this)())
      .on("start", this.onSelectionStart.bind(this))
      .on("move", this.whileSelecting.bind(this))
      .on("stop", this.onSelectionEnd.bind(this));

    this.render({ lower: this.daysRange[0], upper: this.daysRange[1] });
  }

  hydrate() {
    this.displayVotes({
      selectedSlotsByUser: this.model.selectedSlotsByUser,
      countedSlots: this.model.countedSlots(),
    });
  }

  subscribeToEvents() {
    this.subscribe("calendar", "selected-slots", this.displayVotes);

    this.subscribe("configuration", "update-days-range", this.updateDaysRange);
    this.subscribe("configuration", "update-time-range", this.updateTimeRange);
  }

  updateDaysRange({ lower, upper }) {
    this.daysRange = [lower, upper];
    this.render();
  }

  updateTimeRange({ lower, upper }) {
    this.timeRange = [lower, upper];
    this.render();
  }

  render() {
    const [startDay, endDay] = this.daysRange;
    const [startTime, endTime] = this.timeRange;

    const today = new Date(startOfToday());

    const daysRange = range(startDay, endDay).map((numberOfDays) => {
      return addDays(today, numberOfDays);
    });

    const columns = (
      <>
        {daysRange.map((day) => {
          const formattedDate = intlFormat(day, dateFormat, {
            locale,
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

    this.displayVotes({
      selectedSlotsByUser: this.model.selectedSlotsByUser,
      countedSlots: this.model.countedSlots(),
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

  onSelectionStart({ store, event }) {
    const addingToSelection = event.ctrlKey || event.metaKey;
    if (!addingToSelection) {
      this.clearSelection(store);
    }
  }

  clearSelection(store) {
    for (const el of store.stored) {
      el.classList.remove("selected");
    }

    this.selection.clearSelection();
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
    // TODO: all this datasets shouldn't be needed if stored would actually retrieve the data right
    const stored = store.stored.map((slot) => slot.dataset.slot);
    const selected = store.selected.map((slot) => slot.dataset.slot);
    const removed = store.changed.removed.map((slot) => slot.dataset.slot);
    const storedWithoutRemoved = stored.filter(
      (slot) => !removed.includes(slot)
    );
    const slots = [...new Set([...storedWithoutRemoved, ...selected])];

    this.publish("calendar", "selection", {
      viewId: this.viewId,
      slots,
    });
  }

  displayVotes({ selectedSlotsByUser, countedSlots }) {
    const slotElement = Array.from(
      document.getElementsByClassName("time-slot")
    );

    slotElement.forEach((cell) => {
      this.addDotsToCalendarSlot(countedSlots, cell);
    });

    this.highlightSelfSelection(selectedSlotsByUser);
  }

  highlightSelfSelection(selectedSlotsByUser) {
    const ownSelection = selectedSlotsByUser.has(this.viewId)
      ? selectedSlotsByUser.get(this.viewId)
      : [];

    ownSelection.forEach((selection) => {
      document
        .querySelectorAll(`[data-slot="${selection}"]`)
        .forEach((element) => element.classList.add("selected"));
    });
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
}
