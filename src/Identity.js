import { Model, View } from "@croquet/croquet";
import { InputWidget } from "./InputWidget";

export default class Identity extends Model {
  init() {
    this.username = "";

    this.subscribe("identity", "name-changed", this.setEventName);
  }

  setEventName(name) {
    this.username = name;
  }
}

export class IdentityView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    const selector = document.querySelector(".identity");

    const onChange = (eventName) => {
      this.publish("identity", "name-changed", eventName);
    };

    const formatValue = (value) => <h3>{value}</h3>;

    new InputWidget(
      selector,
      {
        name: "name",
        placeholder: "Tu nombre",
        value: this.model.username,
      },
      {
        onChange,
        formatValue,
      }
    );
  }
}
