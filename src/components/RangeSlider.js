import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class RangeSlider {
  constructor(selector, { min, max, lower, upper }, { onChange, formatValue }) {
    this.selector = selector;
    this.formatValue = formatValue ? formatValue : (value) => value;

    this.render(parseInt(min), parseInt(max), parseInt(lower), parseInt(upper));

    this.lowerSlider = selector.querySelector(".lower");
    this.upperSlider = selector.querySelector(".upper");

    this.lowerSlider.oninput = () => {
      this.handleLowerSlider(onChange);
    };

    this.upperSlider.oninput = () => {
      this.handleUpperSlider(onChange);
    };
  }

  render(min, max, lowerValue, upperValue) {
    const content = (
      <>
        <div className="controls">
          <input
            type="range"
            min={min}
            max={max}
            value={lowerValue}
            className="lower"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={upperValue}
            className="upper"
          />
        </div>
        <div className="values">
          <output className="range-value min">
            {this.formatValue(lowerValue)}
          </output>
          <output className="range-value max">
            {this.formatValue(upperValue)}
          </output>
        </div>
      </>
    );

    render(content, this.selector);
  }

  handleLowerSlider(onChange) {
    const lowerValue = this.lowerValue();
    const upperValue = this.upperValue();

    if (lowerValue >= upperValue) {
      this.upperSlider.value = lowerValue;

      if (upperValue === this.maxValue()) {
        this.lowerSlider.value = this.maxValue();
      }
    }

    onChange({
      lower: this.lowerValue(),
      upper: this.upperValue(),
    });

    this.renderValues();
  }

  handleUpperSlider(onChange) {
    const lowerValue = this.lowerValue();
    const upperValue = this.upperValue();

    if (upperValue <= lowerValue) {
      this.lowerSlider.value = upperValue;

      if (lowerValue === this.minValue()) {
        this.upperSlider.value = this.minValue();
      }
    }

    onChange({
      lower: this.lowerValue(),
      upper: this.upperValue(),
    });

    this.renderValues();
  }

  update(lower, upper) {
    this.lowerSlider.value = lower;
    this.upperSlider.value = upper;

    this.renderValues();
  }

  renderValues() {
    const lowerOutput = this.selector.getElementsByClassName("range-value")[0];
    const upperOutput = this.selector.getElementsByClassName("range-value")[1];

    render(<>{this.formatValue(this.lowerValue())}</>, lowerOutput);
    render(<>{this.formatValue(this.upperValue())}</>, upperOutput);
  }

  minValue() {
    return parseInt(this.lowerSlider.min);
  }

  maxValue() {
    return parseInt(this.upperSlider.max);
  }

  lowerValue() {
    return parseInt(this.lowerSlider.value);
  }

  upperValue() {
    return parseInt(this.upperSlider.value);
  }
}
