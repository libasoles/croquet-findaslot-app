import i18next from "i18next";

export class StatusView {
  constructor(pills, identity, calendar) {
    this.pills = pills;
    this.identity = identity;
    this.calendar = calendar;
  }

  setText(selector, i18nKey, i18nReplacements = {}) {
    const newTextContent = i18next.t(i18nKey, i18nReplacements);
    if (document.querySelector(selector).textContent === newTextContent) return;

    document.querySelector(selector).style.display = "none";

    document.querySelector(selector).textContent = newTextContent;

    setTimeout(() => {
      document.querySelector(selector).style.display = "block";
    }, 0);
  }

  render(selfId) {
    const noPillSelected = !this.pills.userHasAnyPillSelected(selfId);
    if (noPillSelected) {
      this.dotType("selecting");

      this.setText(".participants .title", "select_a_participant");
      this.setText(".participants .content", "check_mark_hint");

      return;
    }

    const onlySelfPillIsSelected = this.pills.onlySelfPillIsSelected(selfId);
    if (onlySelfPillIsSelected) {
      this.dotType("selecting");

      this.setText(".participants .title", "your_available_slots");

      if (this.calendar.userHasAnySelection(selfId))
        this.setText(".participants .content", "");
      else this.setText(".participants .content", "nothing_selected_yet");

      return;
    }

    const onlyOneOtherPillSelected =
      !this.pills.selectionCountIsEqualOrBiggerThan(selfId, 2);
    if (onlyOneOtherPillSelected) {
      this.dotType("selecting");

      const otherUserId = this.pills.pillsForUser(selfId).pop();
      const otherUserName = this.identity.name(otherUserId);

      this.setText(".participants .title", "other_user_selection", {
        otherUser: otherUserName || "Anonymous", // TODO: add #number
      });

      if (this.calendar.userHasAnySelection(otherUserId))
        this.setText(".participants .content", "");
      else this.setText(".participants .content", "nothing_selected_yet");

      return;
    }

    const usersCommonSlots = this.calendar.usersCommonSlots(
      this.pills.pillsForUser(selfId)
    );
    if (usersCommonSlots.length === 0) {
      this.dotType("comparing");

      this.setText(".participants .title", "comparing");
      this.setText(".participants .content", "no_overlap");
    } else {
      this.dotType("comparing");

      this.setText(".participants .title", "comparing");
      this.setText(".participants .content", "you_have_common_slots");
    }
  }

  dotType(type) {
    document
      .querySelector(".participants .dot")
      .classList.remove("selecting", "comparing");

    document.querySelector(".participants .dot").classList.add(type);
  }
}