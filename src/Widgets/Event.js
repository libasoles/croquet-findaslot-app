import { Model, View } from "@croquet/croquet";
import { InputWidget } from "../components/InputWidget";
import i18next from "i18next";
import { element } from "../utils";

export default class Event extends Model {
  init(_, persistedState = {}) {
    this.hydrate(persistedState);

    this.subscribe("event-name", "name-changed", this.setEventName);
  }

  hydrate(persistedState) {
    this.eventName = persistedState.eventName ? persistedState.eventName : "";
  }

  save() {
    this.wellKnownModel("modelRoot").save();
  }

  serialize() {
    return { eventName: this.eventName };
  }

  setEventName(name) {
    this.eventName = name;

    this.save();

    this.publish("event-name", "update-event-name", name);
  }

  isEventNameSet() {
    return this.eventName.trim() !== ""
  }
}

export class EventView extends View {
  constructor(model, identity, settings) {
    super(model);
    this.model = model;
    this.identity = identity;

    this.init();

    this.subscribe("identity", "established", this.focus);

    this.subscribe("event-name", "update-event-name", (value) =>
      this.widget.displayValue(value)
    );

    this.subscribe("settings", "update-duration", this.renderDuration);

    this.renderDuration(settings.duration);
  }

  init() {
    const selector = element(".event-name-widget");

    this.widget = new InputWidget(
      selector,
      {
        name: "eventName",
        placeholder: i18next.t("event_name"),
        value: this.model.eventName,
      },
      {
        onChange: this.onChange,
        formatValue: (value) => <h3>{value}</h3>,
      }
    );
  }

  onChange = (eventName) => {
    this.publish("event-name", "name-changed", eventName);
  };

  focus() {
    const shouldFocusEventName = this.identity.numberOfUsers() === 1;
    if (shouldFocusEventName) this.widget.focus();
  }

  renderDuration(value) {
    element(".calendar .duration").textContent = `${i18next.t(
      "duration"
    )}: ${i18next.t("hours", { count: value })}`;
  }
}
