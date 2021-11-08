import { display, hide } from "./utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class InputWidget {
  constructor(
    selector,
    { name, placeholder, value },
    { onChange, formatValue }
  ) {
    this.selector = selector;
    this.attributes = { name, placeholder };
    this.handleOnChange = onChange;
    this.formatValue = formatValue ? formatValue : (value) => value;

    this.render();

    this.form = this.selector.querySelector(".input-widget-form");
    this.input = this.selector.querySelector("input");
    this.displayedValue = this.selector.querySelector(".displayed-value");

    if (value) {
      this.displayEventName(value);
    }

    this.subscribeToUserEvents(onChange);
  }

  render() {
    const { name, placeholder } = this.attributes;

    const content = (
      <>
        <div className="input-widget-form">
          <input name={name} placeholder={placeholder} />
          <button className="button">ok</button>
        </div>

        <div className="hidden displayed-value">
          <div className="value"></div>
          <button className="button icon close">x</button>
        </div>
      </>
    );

    render(content, this.selector);
  }

  subscribeToUserEvents() {
    const submitButton = this.form.querySelector("button");
    const closeButton = this.displayedValue.querySelector("button");

    this.input.onkeyup = (e) => this.onUserTyping(e);

    submitButton.onclick = () => this.onChange();
    closeButton.onclick = () => this.onEditEventName();
  }

  onUserTyping(event) {
    if (event.keyCode === 13) {
      this.onChange();
    }
  }

  onChange() {
    const { value } = this.input;

    if (!value) return;

    this.displayEventName(value);

    this.handleOnChange(value);
  }

  onEditEventName() {
    hide(this.displayedValue);

    this.input.value = this.displayedValue
      .querySelector(".value")
      .textContent.trim();

    display(this.form);
  }

  displayEventName(name) {
    hide(this.form);

    render(this.formatValue(name), this.displayedValue.querySelector(".value"));

    display(this.displayedValue);
  }
}
