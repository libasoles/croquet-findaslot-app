import i18next from "i18next";
import { element, formatDate, formatTime, target } from "./utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { scheduleLinks } from "./components/CalendarsLink";
import { addMinutes } from "date-fns";

export class StatusView {
  constructor(pills, identity, calendarService, event, settings) {
    this.pills = pills;
    this.identity = identity;
    this.calendarService = calendarService;
    this.event = event;
    this.settings = settings;
  }

  setText(selector, i18nKey, i18nReplacements = {}) {
    const newTextContent = i18next.t(i18nKey, i18nReplacements);
    if (element(selector).textContent === newTextContent) return;

    element(selector).style.display = "none";

    element(selector).textContent = newTextContent;

    setTimeout(() => {
      element(selector).style.display = "block";
    }, 0);
  }

  setTitle(i18nKey, i18nReplacements) {
    this.setText(".participants .title", i18nKey, i18nReplacements);
  }

  setDescription(i18nKey, i18nReplacements) {
    this.setText(".participants .content", i18nKey, i18nReplacements);
  }

  render(selfId) {
    const noPillSelected = !this.pills.userHasAnyPillSelected(selfId);
    if (noPillSelected) {
      this.dotType("selecting");

      this.setTitle("select_a_participant");
      this.setDescription("check_mark_hint");

      return;
    }

    const onlySelfPillIsSelected = this.pills.onlySelfPillIsSelected(selfId);
    if (onlySelfPillIsSelected) {
      this.dotType("selecting");

      this.setTitle("your_available_slots");

      if (this.calendarService.userHasAnySelection(selfId)) {
        this.setDescription("");
      } else {
        this.setDescription("nothing_selected_yet");
      }

      return;
    }

    const onlyOneOtherPillSelected =
      !this.pills.selectionCountIsEqualOrBiggerThan(selfId, 2);
    if (onlyOneOtherPillSelected) {
      this.dotType("selecting");

      const otherUserId = this.pills.pillsForUser(selfId).pop();
      const otherUserName = this.identity.name(otherUserId);

      this.setTitle("other_user_selection", {
        otherUser: otherUserName || "Anonymous", // TODO: add #number
      });

      if (this.calendarService.userHasAnySelection(otherUserId)) {
        this.setDescription("");
      } else {
        this.setDescription("other_user_nothing_selected_yet");
      }

      return;
    }

    const selectedUsers = this.pills.pillsForUser(selfId);
    const usersCommonSlots =
      this.calendarService.usersCommonSlots(selectedUsers);
    if (usersCommonSlots.length === 0) {
      this.dotType("comparing");

      this.setTitle("comparing");
      this.setDescription("no_overlap");
    } else {
      this.dotType("comparing");

      this.setTitle("comparing");

      const bestSlot = this.calendarService.bestSlotForUsers(selectedUsers);

      const endTime = addMinutes(
        new Date(bestSlot),
        this.settings.duration * 60
      ).toISOString();

      const schedule = scheduleLinks(
        this.event.eventName, // TODO: fresh event name
        bestSlot,
        endTime,
        "schedule_call_to_action"
      );

      const date = formatDate(bestSlot);
      const time = new Date(bestSlot).getHours();

      render(
        <div className="schedule">
          {i18next.t("you_have_common_slots")}
          <div className="best-slot">
            {date} - {formatTime(time)}
          </div>
          {schedule}
        </div>,
        target(".participants .content")
      );
    }
  }

  dotType(type) {
    document
      .querySelector(".participants .dot")
      .classList.remove("selecting", "comparing");

    element(".participants .dot").classList.add(type);
  }
}
