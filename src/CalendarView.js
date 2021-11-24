import { View } from "@croquet/croquet";
import SelectionArea from "@viselect/vanilla";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { addHours, addMinutes, isBefore } from "date-fns";
import {
  dayFormat,
  element,
  formatDate,
  formatTime,
  isMobile,
  range,
  target,
  today,
} from "./utils";
import createDotElements from "./components/Dots";
import { DatesMatrix } from "./DatesMatrix";

const selectableOptions = {
  selectionContainerClass: "section.calendar",
  selectionAreaClass: ".calendar-columns",
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

export default class CalendarView extends View {
  constructor(calendarService, model, identity, settings, pills) {
    super(model);
    this.model = model;
    this.calendarService = calendarService;
    this.identity = identity;
    this.settings = settings;
    this.pills = pills;

    this.init();

    this.subscribeToEvents();
  }

  init() {
    this.selection = new SelectionArea(selectableOptions)
      .on("beforestart", this.beforeSelectionStarts())
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
    this.subscribe("settings", "update-half-hours", this.render);

    this.subscribe(
      "calendar",
      "user-pills-selection",
      this.highlightSelectionForUsers
    );

    this.initColumnTitleSelection();
  }

  hydrate() {
    if (!this.settings.createdAt) return;

    this.render({
      lower: this.settings.daysRange[0],
      upper: this.settings.daysRange[1],
    });
  }

  initColumnTitleSelection() {
    const targetNode = element(".calendar-columns");

    const config = { attributes: false, childList: true, subtree: false };

    const selectAll = (slot) => {
      slot.classList.add("selected");
    };

    const deselectAll = (slot) => {
      slot.classList.remove("selected");
    };

    const bindToggleOnClick = (title) => {
      title.onclick = () => {
        const slots = Array.from(
          title.nextSibling.getElementsByClassName("time-slot")
        );

        const isAnySlotSelected = slots.some((slot) =>
          slot.classList.contains("selected")
        );

        const previousSelection = this.selection
          .getSelection()
          .map((slot) => slot.dataset.slot);

        const selection = slots.map((slot) => slot.dataset.slot);

        if (isAnySlotSelected) {
          slots.forEach(deselectAll);
          this.publishSelection(
            previousSelection.filter((slot) => !selection.includes(slot))
          );
        } else {
          slots.forEach(selectAll);
          this.publishSelection([...previousSelection, ...selection]);
        }
      };
    };

    const whenColumnsRender = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type !== "childList") {
          continue;
        }

        const columnTitles = document.querySelectorAll(".day .title.cell");
        columnTitles.forEach(bindToggleOnClick);
      }
    };

    const observer = new MutationObserver(whenColumnsRender);

    observer.observe(targetNode, config);
  }

  render() {
    const [startTime, endTime] = this.settings.timeRange;

    const daysRange = DatesMatrix.generate(this.settings);

    const columns = (
      <>
        {daysRange.map((day) => {
          const formattedDate = formatDate(day, dayFormat);

          const timeRange = range(startTime, endTime);
          const halfHourIntervals = this.settings.halfHourIntervals;

          const disabled = isBefore(day, today());

          return (
            <div className={`day ${disabled && "disabled"}`}>
              <div className="title cell">{formattedDate}</div>
              <div className="day-schedule">
                {timeRange.map((hours, i) => {
                  const date = addHours(day, hours).toISOString();

                  let plainHour = this.timeSlot(date, hours);

                  if (!halfHourIntervals) return plainHour;

                  const withMinutes = addMinutes(
                    new Date(date),
                    30
                  ).toISOString();

                  return (
                    <div className="half-hour-intervals">
                      {plainHour}
                      {this.timeSlot(withMinutes, hours + 0.5, "half-hour")}
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

  timeSlot(timestamp, readableTime, className) {
    return (
      <div className={`time-slot cell ${className}`} data-slot={timestamp}>
        <div className="dots"></div>
        {formatTime(readableTime)}
      </div>
    );
  }

  displaySlotsState() {
    const selfId = this.me();

    this.highlightSelectionForUsers({
      userId: selfId,
      selectedUsersIds: this.pills.pillsForUser(selfId),
    });

    this.displayVotes({ countedSlots: this.calendarService.countedSlots() });
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
    if (!isMobile()) return () => {};

    let timeout = null;

    return ({ event }) => {
      const userAlreadyTapedSelectionArea = timeout !== null;
      if (userAlreadyTapedSelectionArea) {
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
    const previousSelection = this.calendarService.userRawSelection(this.me());
    const added = store.changed.added.map((added) => added.dataset.slot);
    const selected = store.selected.map((selected) => selected.dataset.slot);
    const removed = store.changed.removed.map(
      (removed) => removed.dataset.slot
    );

    const selection = previousSelection
      .concat(selected)
      .concat(added)
      .filter((slot) => !removed.includes(slot));

    this.publishSelection(Array.from(new Set(selection)));
  }

  publishSelection(selection) {
    this.publish("calendar", "selection", {
      userId: this.me(),
      slots: selection,
    });
  }

  highlightSelectionForUsers({ userId, selectedUsersIds }) {
    const selfId = this.me();
    if (userId !== selfId) return;

    this.clearHighlights();

    if (selectedUsersIds.length === 1) {
      this.highlightSelectionForUser(selectedUsersIds.pop());

      return;
    }

    const commonSlots = this.calendarService.usersCommonSlots(selectedUsersIds);
    if (commonSlots.length > 0) {
      this.highlightSlots(commonSlots, true);
    }
  }

  clearHighlights() {
    document.querySelectorAll(".calendar .selected").forEach((slot) => {
      slot.classList.remove("selected", "match");
    });

    this.selection.clearSelection();
  }

  highlightSlots(slots, isAMatch = false) {
    slots.forEach((selection) => {
      const slot = element(`[data-slot="${selection}"]`);
      if (!slot) return;

      slot.classList.add("selected");

      if (isAMatch) slot.classList.add("match");
    });
  }

  highlightSelectionForUser(userId) {
    const { selectedSlotsByUser } = this.model;

    const slotSelection = selectedSlotsByUser.has(userId)
      ? selectedSlotsByUser.get(userId)
      : [];

    this.highlightSlots(slotSelection);

    this.selection.select(".calendar .selected");
  }

  addDotsToCalendarSlot(countedSlots, timeSlot) {
    const votes = countedSlots.get(timeSlot.dataset.slot) || 0;

    const dotsElement = timeSlot.querySelector(".dots");

    if (votes === 0) {
      render(<></>, dotsElement);
      return;
    }

    const usersList = this.calendarService
      .usersWhoSelectedSlot(timeSlot.dataset.slot)
      .map((userId) => this.identity.name(userId))
      .join(", ");

    const dots = createDotElements(votes, usersList);

    render(<>{dots}</>, dotsElement);
  }

  me() {
    return this.identity.selfId(this.viewId);
  }
}
