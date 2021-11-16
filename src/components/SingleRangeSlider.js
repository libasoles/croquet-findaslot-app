import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class SingleRangeSlider {
  constructor(
    selector,
    { min, max, initialValue, step },
    { onChange, formatValue }
  ) {
    this.selector = selector;
    this.formatValue = formatValue ? formatValue : (value) => value;

    this.render(
      parseInt(min),
      parseInt(max),
      Number(initialValue),
      Number(step)
    );

    this.slider = selector.querySelector(".slider");

    this.slider.oninput = () => {
      onChange({
        value: this.value(),
      });

      this.renderValue();
    };
  }

  render(min, max, value, step) {
    const content = (
      <>
        <div className="controls">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            className="slider"
            step={step}
          />
        </div>
        <div className="values">
          <output className="range-value">{this.formatValue(value)}</output>
        </div>
      </>
    );

    render(content, this.selector);
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
    return Number(this.slider.value);
  }
}
