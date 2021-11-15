import { Model, View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { StatusView } from "./Status";
import { element } from "./utils";

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
    if (!triggeredBy) return;

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
  constructor(model, identity, calendar, eventName) {
    super(model);
    this.model = model;
    this.identity = identity;
    this.calendar = calendar;

    this.status = new StatusView(model, identity, calendar, eventName);

    this.subscribe("pills", "init", this.render);
    this.subscribe("identity", "update-name", this.render);
    this.subscribe("calendar", "user-pills-selection", this.render);
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

    render(<>{pills}</>, element(".participants .pills"));

    this.status.render(selfId);
  }

  toggle(event) {
    event.currentTarget.classList.toggle("selected");

    const clickedUserId = event.currentTarget.dataset.userId;

    this.publish("pills", "toggle", {
      userId: this.identity.selfId(this.viewId),
      clickedUserId,
    });
  }
}
