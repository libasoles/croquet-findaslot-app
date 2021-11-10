import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class PillsView extends View {
  constructor(identity, calendar) {
    super(identity);
    this.identity = identity;
    this.calendar = calendar;

    this.subscribe("identity", "established", this.init);
    this.subscribe("identity", "update-name", this.render);
    this.subscribe("calendar", "selected-slots-updated", this.render);
  }

  init() {
    this.initialState();

    this.render();
  }

  initialState() {
    this.selected = new Set([this.identity.selfId(this.viewId)]);
  }

  render() {
    const toPill = (user, index) => {
      const isSelected = this.selected.has(user.userId);
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

    if (this.selected.has(clickedUserId)) {
      this.selected.delete(clickedUserId);
    } else {
      this.selected.add(clickedUserId);
    }

    this.publish("calendar", "user-pills-selection", {
      selectedUsersIds: Array.from(this.selected),
    });
  }
}
