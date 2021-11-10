import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class PillsView extends View {
  constructor(identity) {
    super(identity);
    this.identity = identity;

    this.subscribe("identity", "established", this.init);

    // this.subscribe("calendar", "selected-slots", this.render);
  }

  init() {
    this.initialState();

    this.render();
  }

  initialState() {
    this.selected = [this.identity.selfId(this.viewId)];
  }

  render() {
    // TODO: display only the ones who actually selected something
    const toPill = (user, index) => {
      const isSelected = this.selected.includes(user.userId);
      const isChecked = false;

      return (
        <button
          className={`pill ${isSelected && "selected"} ${
            isChecked && "checked"
          }`}
          onClick={this.toggle.bind(this)}
        >
          {user.userName || "Anonymous #" + (index + 1)}
        </button>
      );
    };

    const pills = this.identity.allUsers().map(toPill);

    render(<>{pills}</>, document.querySelector(".users-pills"));
  }

  toggle(event) {
    event.currentTarget.classList.toggle("selected");

    this.subscribe("calendar", "display-users-selection", {});
  }
}
