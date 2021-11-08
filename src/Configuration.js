import { Model, View } from "@croquet/croquet";
import { RangeSlider } from "./RangeSlider";

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
    this.daysRange = [values.lower, values.upper];
    this.publish("configuration", "update-days-range", values);
  }

  timeRangeChange(values) {
    this.timeRange = [values.lower, values.upper];
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
