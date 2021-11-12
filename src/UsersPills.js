import { Model, View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import i18next from "i18next";

export default class Pills extends Model {
  init() {
    this.subscribe("identity", "established", this.preselectSelf);
    this.subscribe("pills", "toggle", this.toggle);
    this.subscribe("calendar", "selected-slots-updated", this.enableSelfOnly);

    this.selectedPillsByUser = new Map();
  }

  preselectSelf(self) {
    const selection = new Set([self.userId]);
    this.selectedPillsByUser.set(self.userId, selection);

    this.publish("pills", "init");
  }

  enableSelfOnly({ triggeredBy }) {
    const selection = new Set([triggeredBy]);
    this.selectedPillsByUser.set(triggeredBy, selection);

    this.publish("calendar", "user-pills-selection", {
      userId: triggeredBy,
      selectedUsersIds: Array.from(selection),
    });
  }

  toggle({ userId, clickedUserId }) {
    const selection = this.selectedPillsByUser.get(userId);

    if (selection.has(clickedUserId)) {
      selection.delete(clickedUserId);
    } else {
      selection.add(clickedUserId);
    }

    this.selectedPillsByUser.set(userId, selection);

    this.publish("calendar", "user-pills-selection", {
      userId,
      selectedUsersIds: Array.from(selection),
    });
  }

  onlySelfPillIsSelected(userId) {
    return (
      this.selectedPillsByUser.get(userId).size === 1 &&
      this.userHasOtherUserPillSelected(userId, userId)
    );
  }

  pillsForUser(userId) {
    return Array.from(this.selectedPillsByUser.get(userId));
  }

  userHasAnyPillSelected(userId) {
    return this.selectedPillsByUser.get(userId).size;
  }

  userHasOtherUserPillSelected(userId, anotherUserId) {
    return this.selectedPillsByUser.get(userId).has(anotherUserId);
  }

  selectionCountIsEqualOrBiggerThan(userId, number) {
    return this.selectedPillsByUser.get(userId).size >= number;
  }
}

export class PillsView extends View {
  constructor(model, identity, calendar) {
    super(model);
    this.model = model;
    this.identity = identity;
    this.calendar = calendar;

    this.subscribe("pills", "init", this.render);
    this.subscribe("identity", "update-name", this.render);
    this.subscribe("calendar", "user-pills-selection", this.render);
    this.subscribe("calendar", "selecting", this.renderMessage);
    this.subscribe("calendar", "comparison", this.renderMessage);
  }

  render() {
    const selfId = this.identity.selfId(this.viewId);

    const allUsers = this.identity.allUsers();

    const toPill = (user, index) => {
      const isSelected = this.model.userHasOtherUserPillSelected(
        selfId,
        user.userId
      );
      const isChecked = this.calendar.userHasAnySelection(user.userId);
      const isBeingCompared = this.model.selectionCountIsEqualOrBiggerThan(
        selfId,
        2
      );

      return (
        <button
          className={`pill ${isSelected && "selected"} ${
            isChecked && "checked"
          } ${isBeingCompared && "compared"}`}
          data-user-id={user.userId}
          onClick={(event) => this.toggle(event)}
        >
          {user.userName || "Anonymous #" + (index + 1)}
        </button>
      );
    };
    const pills = allUsers.map(toPill);

    render(<>{pills}</>, document.querySelector(".participants .pills"));

    this.renderMessage();
  }

  toggle(event) {
    event.currentTarget.classList.toggle("selected");

    const clickedUserId = event.currentTarget.dataset.userId;

    this.publish("pills", "toggle", {
      userId: this.identity.selfId(this.viewId),
      clickedUserId,
    });
  }

  renderMessage() {
    const selfId = this.identity.selfId(this.viewId);

    const noPillSelected = !this.model.userHasAnyPillSelected(selfId);
    if (noPillSelected) {
      this.dotType("selecting");

      document.querySelector(".participants .title").textContent =
        "Select a participant";
      document.querySelector(".participants .content").textContent =
        "They have a check mark if they already selected time slots";

      return;
    }

    const onlySelfPillIsSelected = this.model.onlySelfPillIsSelected(selfId);
    if (onlySelfPillIsSelected) {
      this.dotType("selecting");

      document.querySelector(".participants .title").textContent = i18next.t(
        "your_available_spots"
      );

      if (this.calendar.userHasAnySelection(selfId))
        document.querySelector(".participants .content").textContent = "";
      else
        document.querySelector(".participants .content").textContent =
          i18next.t("nothing_selected_yet");

      return;
    }

    const onlyOneOtherPillSelected =
      !this.model.selectionCountIsEqualOrBiggerThan(selfId, 2);
    if (onlyOneOtherPillSelected) {
      this.dotType("selecting");

      const otherUserId = this.model.pillsForUser(selfId).pop();
      const otherUserName = this.identity.name(otherUserId);

      document.querySelector(".participants .title").textContent = i18next.t(
        "other_user_selection",
        { otherUser: otherUserName }
      );

      if (this.calendar.userHasAnySelection(otherUserId))
        document.querySelector(".participants .content").textContent = "";
      else
        document.querySelector(".participants .content").textContent =
          i18next.t("nothing_selected_yet");

      return;
    }

    const usersCommonSlots = this.calendar.usersCommonSlots(
      this.model.pillsForUser(selfId)
    );
    if (usersCommonSlots.length === 0) {
      this.dotType("comparing");

      document.querySelector(".participants .title").textContent =
        i18next.t("comparing");
      document.querySelector(".participants .content").textContent =
        i18next.t("no_overlap");
    } else {
      this.dotType("comparing");

      document.querySelector(".participants .title").textContent =
        i18next.t("comparing");
      document.querySelector(".participants .content").textContent = i18next.t(
        "you_have_common_slots"
      );
    }
  }

  dotType(type) {
    document
      .querySelector(".participants .dot")
      .classList.remove("selecting", "comparing");
    document.querySelector(".participants .dot").classList.add(type);
  }
}
