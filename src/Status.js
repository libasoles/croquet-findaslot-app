import i18next from "i18next";
import { element, target } from "./utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { scheduleLinks } from "./components/CalendarsLink";

export class StatusView {
  constructor(pills, identity, calendar, eventName) {
    this.pills = pills;
    this.identity = identity;
    this.calendar = calendar;
    this.eventName = eventName;
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

  setTitle( i18nKey, i18nReplacements) {
    this.setText(".participants .title", i18nKey, i18nReplacements)
  }

  setDescription( i18nKey, i18nReplacements) {
    this.setText(".participants .content", i18nKey, i18nReplacements)
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

      if (this.calendar.userHasAnySelection(selfId))
        this.setDescription("");
      else this.setDescription("nothing_selected_yet");

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

      if (this.calendar.userHasAnySelection(otherUserId))
        this.setDescription("");
      else this.setDescription("nothing_selected_yet");

      return;
    }

    const usersCommonSlots = this.calendar.usersCommonSlots(
      this.pills.pillsForUser(selfId)
    );
    if (usersCommonSlots.length === 0) {
      this.dotType("comparing");

      this.setTitle("comparing");
      this.setDescription("no_overlap");
    } else {
      this.dotType("comparing");

      this.setTitle("comparing");

      // TODO: find better slot for selected users only
      const bestSlot = this.calendar.takeBest(1)[0][0];

      const schedule = scheduleLinks(
        this.eventName.eventName, // TODO: fresh event name
        bestSlot,
        bestSlot, // TODO: calculated end date
        "schedule_call_to_action"
      );

      render(
        <div className="schedule">
          {i18next.t("you_have_common_slots")}
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
