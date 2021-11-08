import { Model, View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export default class Configuration extends Model {
  init() {
    this.daysRange = [0, 4];
    this.daysRangeMinMax = [0, 14];
    this.timeRange = [9, 18];
    this.timeRangeMinMax = [0, 24]; // TODO: constants should be in Q

    this.subscribe("configuration", "days-range-change", this.daysRangeChange);
    this.subscribe("configuration", "time-range-change", this.timeRangeChange);
  }

  daysRangeChange(values) {
    this.daysRange[(values.lower, values.upper)];
    this.publish("configuration", "update-days-range", values);
  }

  timeRangeChange(values) {
    this.timeRange[(values.lower, values.upper)];
    this.publish("configuration", "update-time-range", values);
  }
}

export class ConfigurationView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.initRangeSliders();

    this.subscribe("configuration", "update-days-range", this.updateDaysRange);
    this.subscribe("configuration", "update-time-range", this.updateTimeRange);
  }

  initRangeSliders() {
    this.initDaysRangeSlider();
    this.initTimeRangeSlider();
  }

  initDaysRangeSlider() {
    let selector = document.querySelector(".days-range");

    const [min, max] = this.model.daysRangeMinMax;
    const [lower, upper] = this.model.daysRange;

    const onChange = (values) => {
      this.publish("configuration", "days-range-change", values);
    };

    const formatValue = (value) => {
      return value === 0 ? "hoy" : value + 1;
    };

    this.daysRangeSlider = new RangeSlider(
      selector,
      { min, max, lower, upper },
      { onChange, formatValue }
    );
  }

  initTimeRangeSlider() {
    let selector = document.querySelector(".time-range");

    const [min, max] = this.model.timeRangeMinMax;
    const [lower, upper] = this.model.timeRange;

    const onChange = (values) => {
      this.publish("configuration", "time-range-change", values);
    };

    const formatValue = (value) => {
      return value + "hs";
    };

    this.hoursRangeSlider = new RangeSlider(
      selector,
      { min, max, lower, upper },
      { onChange, formatValue }
    );
  }

  updateDaysRange({ lower, upper }) {
    this.daysRangeSlider.update(lower, upper);
  }

  updateTimeRange({ lower, upper }) {
    this.hoursRangeSlider.update(lower, upper);
  }
}

class RangeSlider {
  constructor(selector, { min, max, lower, upper }, { onChange, formatValue }) {
    this.selector = selector;
    this.formatValue = formatValue ? formatValue : (value) => value;

    this.init(parseInt(min), parseInt(max), parseInt(lower), parseInt(upper));

    this.lowerSlider = selector.querySelector(".lower");
    this.upperSlider = selector.querySelector(".upper");

    this.lowerSlider.oninput = () => {
      this.handleLowerSlider(onChange);
    };

    this.upperSlider.oninput = () => {
      this.handleUpperSlider(onChange);
    };
  }

  init(min, max, lowerValue, upperValue) {
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
