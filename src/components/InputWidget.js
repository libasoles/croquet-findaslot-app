import { display, hide } from "../utils";
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
      this.displayValue(value);
    }

    this.subscribeToUserEvents(onChange);
  }

  render() {
    const { name, placeholder } = this.attributes;

    const content = (
      <>
        <div className="input-widget-form">
          <input name={name} placeholder={placeholder} />
        </div>

        <div className="hidden displayed-value">
          <div className="value"></div>
        </div>
      </>
    );

    render(content, this.selector);
  }

  subscribeToUserEvents() {
    const input = this.form.querySelector("input");

    this.input.onkeyup = (e) => this.onUserTyping(e);

    input.onblur = () => this.onChange();
    this.displayedValue.onclick = () => this.onEdit();
  }

  onUserTyping(event) {
    if (event.keyCode === 13) {
      this.onChange();
    }
  }

  onChange() {
    const { value } = this.input;

    if (!value) return;

    this.displayValue(value);

    this.handleOnChange(value);
  }

  onEdit() {
    hide(this.displayedValue);

    this.input.value = this.displayedValue
      .querySelector(".value")
      .textContent.trim();

    display(this.form);

    this.input.focus();
  }

  displayValue(name) {
    hide(this.form);

    render(this.formatValue(name), this.displayedValue.querySelector(".value"));

    display(this.displayedValue);
  }

  focus() {
    this.input.focus();
  }
}
