import { Model, View } from "@croquet/croquet";
import { InputWidget } from "./components/InputWidget";
import i18next from "i18next";
import { element } from "./utils";

export default class EventName extends Model {
  init() {
    this.eventName = "";

    this.subscribe("event-name", "name-changed", this.setEventName);
  }

  setEventName(name) {
    this.eventName = name;

    this.publish("event-name", "update-event-name", name);
  }
}

export class EventNameView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    const selector = element(".event-name-widget");

    const onChange = (eventName) => {
      this.publish("event-name", "name-changed", eventName);
    };

    const formatValue = (value) => <h2>{value}</h2>;

    const widget = new InputWidget(
      selector,
      {
        name: "eventName",
        placeholder: i18next.t("event_name"),
        value: this.model.eventName,
      },
      {
        onChange,
        formatValue,
      }
    );

    this.subscribe("event-name", "update-event-name", (value) =>
      widget.displayValue(value)
    );
  }
}
