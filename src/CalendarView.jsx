import { View } from "@croquet/croquet";
import SelectionArea from "@viselect/vanilla";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { addHours, addDays, startOfToday, intlFormat } from "date-fns";
import { range } from "./utils";

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

const dateTimeFormat = {
  weekday: "long",
  month: "short",
  day: "numeric",
  hour: "numeric",
};

const locale = "es-ES";

function target(name) {
  return document.getElementsByClassName(name)[0];
}

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
    this.displayVotes(this.model.selectedSlotsByUser);
  }

  subscribeToEvents() {
    this.subscribe("calendar", "selected-slots-by-user", this.displayVotes);

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
            locale: "es-ES",
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

    render(columns, target("calendar-columns"));

    this.displayVotes(this.model.selectedSlotsByUser);
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

  displayVotes(slotsByUser) {
    const countedSlots = this.mapToCountedSlots(slotsByUser);

    const slotElement = Array.from(
      document.getElementsByClassName("time-slot")
    );

    slotElement.forEach((cell) => {
      this.addDotsToCalendarSlot(countedSlots, cell);
    });

    this.highlightSelfSelection(slotsByUser);

    this.renderMoreVotedResults(countedSlots);
  }

  highlightSelfSelection(slotsByUser) {
    const ownSelection = slotsByUser.has(this.viewId)
      ? slotsByUser.get(this.viewId)
      : [];

    ownSelection.forEach((selection) => {
      document
        .querySelectorAll(`[data-slot="${selection}"]`)
        .forEach((element) => element.classList.add("selected"));
    });
  }

  renderMoreVotedResults(countedSlots) {
    const bestFiveOrderedByCount = this.takeMoreVoted(countedSlots, 5);

    if (bestFiveOrderedByCount.length === 0) {
      render(<p>Aun nadie marco sus horarios</p>, target("best-results"));

      return;
    }

    const results = (
      <ul>
        {bestFiveOrderedByCount.map(([slot, votes]) => {
          const dateTime = intlFormat(new Date(slot), dateTimeFormat, {
            locale,
          });

          const dots = this.createDotElements(votes);

          return (
            <li>
              {dateTime}hs
              <div className="dots">{dots}</div>
              <p>{votes} votos</p>
            </li>
          );
        })}
      </ul>
    );

    render(results, target("best-results"));
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

    const dots = this.createDotElements(votes);

    render(<>{dots}</>, dotsElement);
  }

  createDotElements(count) {
    return count > 0
      ? range(count).map((i) => <div className="dot"></div>)
      : null;
  }

  takeMoreVoted(countedSlots, amount = 5) {
    return Array.from(countedSlots)
      .sort(([slotA, countA], [slotB, countB]) => countB - countA)
      .slice(0, amount);
  }

  mapToCountedSlots(slotsByUser) {
    const slotsCounted = new Map();

    slotsByUser.forEach((slots) => {
      if (!slots.length) return;

      slots.forEach((slot) => {
        const count = (slotsCounted.get(slot) || 0) + 1;
        slotsCounted.set(slot, count);
      });
    });
    return slotsCounted;
  }
}
