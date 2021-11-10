import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class PillsView extends View {
  constructor(identity) {
    super(identity);

    this.identity = identity;

    // this.subscribe("calendar", "selected-slots", this.render);

    this.render();
  }

  render() {
    const toggle = (e) => {
      const element = e.currentTarget;
      element.classList.toggle("selected");
    };

    // TODO: display only the ones who actually selected something
    const pills = this.identity.allUsers().map((user, index) => {
      return (
        <button className="pill" onClick={toggle}>
          {user.userName || "Anonymous #" + (index + 1)}
        </button>
      );
    });

    render(<>{pills}</>, document.querySelector(".users-pills"));
  }
}
