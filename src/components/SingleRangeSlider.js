import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class SingleRangeSlider {
  constructor(selector, { min, max, initialValue }, { onChange, formatValue }) {
    this.selector = selector;
    this.formatValue = formatValue ? formatValue : (value) => value;

    this.render(parseInt(min), parseInt(max), parseInt(initialValue));

    this.slider = selector.querySelector(".slider");

    this.slider.oninput = () => {
      this.handleSlider(onChange);
    };
  }

  render(min, max, value) {
    const content = (
      <>
        <div className="controls">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            className="slider"
            // TODO: support steps
          />
        </div>
        <div className="values">
          <output className="range-value">{this.formatValue(value)}</output>
        </div>
      </>
    );

    render(content, this.selector);
  }

  handleSlider(onChange) {
    onChange({
      value: this.value(),
    });

    this.renderValue();
  }

  renderValue() {
    const output = this.selector.getElementsByClassName("range-value")[0];

    render(<>{this.formatValue(this.value())}</>, output);
  }

  update(value) {
    this.slider.value = value;

    this.renderValue();
  }

  value() {
    return parseInt(this.slider.value);
  }
}
