import { Model, View } from "@croquet/croquet";
import { display, hide } from "./utils";

export default class EventName extends Model {
  init() {
    this.eventName = "";

    this.subscribe("event", "name-changed", this.setEventName);
  }

  setEventName(name) {
    this.eventName = name;

    this.publish("event", "update-event-name", name);
  }
}

export class EventNameView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.subscribe("event", "update-event-name", this.displayEventName);

    this.eventNameForm = document.querySelector(".event-name-form");
    this.eventNameInput = document.getElementById("event-name-input");
    this.eventName = document.querySelector(".displayed-event-name");

    this.hydrate();

    this.subscribeToUserEvents();
  }

  hydrate() {
    if (this.model.eventName) {
      this.displayEventName(this.model.eventName);
    }
  }

  subscribeToUserEvents() {
    const submitButton = document.querySelector(".event-name-form button");
    const closeButton = document.querySelector(".displayed-event-name button");

    this.eventNameInput.onkeyup = (e) => this.onUserTyping(e);

    submitButton.onclick = () => this.onEventNameChange();
    closeButton.onclick = () => this.onEditEventName();
  }

  onUserTyping(event) {
    if (event.keyCode === 13) {
      this.onEventNameChange();
    }
  }

  onEventNameChange() {
    if (!this.eventNameInput.value) return;

    this.displayEventName(this.eventNameInput.value);

    this.publishName();
  }

  onEditEventName() {
    hide(this.eventName);

    this.eventNameInput.value = this.eventName
      .querySelector(".name")
      .textContent.trim();

    display(this.eventNameForm);
  }

  displayEventName(name) {
    hide(this.eventNameForm);

    this.eventName.querySelector(".name").textContent = name;
    display(this.eventName);
  }

  publishName() {
    this.publish("event", "name-changed", this.eventNameInput.value);
  }
}
