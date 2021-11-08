import { Model, View } from "@croquet/croquet";
import { InputWidget } from "./InputWidget";
import i18next from "i18next";

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
        placeholder: i18next.t("your_name"),
        value: this.model.username,
      },
      {
        onChange,
        formatValue,
      }
    );
  }
}
