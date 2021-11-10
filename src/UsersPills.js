import { Model, View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export default class Pills extends Model {
  init() {
    this.subscribe("identity", "established", this.preselectUser);
    this.subscribe("pills", "toggle", this.toggle);

    this.selectedPillsByUser = new Map();
  }

  preselectUser(self) {
    const selection = new Set([self.userId]);
    this.selectedPillsByUser.set(self.userId, selection);

    this.publish("pills", "init");
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

  pillsForUser(userId) {
    return Array.from(this.selectedPillsByUser.get(userId));
  }

  userHasSelected(userId, anotherUserId) {
    return this.selectedPillsByUser.get(userId).has(anotherUserId);
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
    this.subscribe("calendar", "selected-slots-updated", this.render);
  }

  render() {
    const selfId = this.identity.selfId(this.viewId);

    const toPill = (user, index) => {
      const isSelected = this.model.userHasSelected(selfId, user.userId);
      const isChecked = this.calendar.userHasAnySelection(user.userId);

      return (
        <button
          className={`pill ${isSelected && "selected"} ${
            isChecked && "checked"
          }`}
          data-user-id={user.userId}
          onClick={(event) => this.toggle(event)}
        >
          {user.userName || "Anonymous #" + (index + 1)}
        </button>
      );
    };

    const pills = this.identity.allUsers().map(toPill);

    render(<>{pills}</>, document.querySelector(".users-pills .pills"));
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
