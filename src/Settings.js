import { Model, View, Constants } from "@croquet/croquet";
import { RangeSlider } from "./components/RangeSlider";
import i18next from "i18next";
import { element } from "./utils";

const Q = Constants;
// Q.daysRangeMinMax = [0, 14];
// Q.timeRangeMinMax = [0, 24];

export default class Settings extends Model {
  init(_, persistedState = {}) {
    this.hydrate(persistedState);

    // TODO: constants should be in Q
    this.daysRangeMinMax = [0, 14];
    this.timeRangeMinMax = [0, 24];

    this.subscribe("settings", "days-range-change", this.daysRangeChange);
    this.subscribe("settings", "time-range-change", this.timeRangeChange);
    this.subscribe(
      "settings",
      "allow-weekends-change",
      this.allowWeekendsChange
    );
    this.subscribe("settings", "half-hours-change", this.halfHoursChange);
  }

  hydrate(persistedState) {
    const { daysRange, timeRange, allowWeekends } = persistedState;

    this.daysRange = daysRange ? daysRange : [0, 4];
    this.timeRange = timeRange ? timeRange : [9, 18];
    this.allowWeekends = allowWeekends ? allowWeekends : false;
  }

  save() {
    this.wellKnownModel("modelRoot").save();
  }

  serialize() {
    return {
      daysRange: this.daysRange,
      timeRange: this.timeRange,
      allowWeekends: this.allowWeekends,
    };
  }

  daysRangeChange(values) {
    this.daysRange = [values.lower, values.upper];
    this.publish("settings", "update-days-range", values);

    this.save();
  }

  timeRangeChange(values) {
    this.timeRange = [values.lower, values.upper];
    this.publish("settings", "update-time-range", values);

    this.save();
  }

  allowWeekendsChange(value) {
    this.allowWeekends = value;
    this.publish("settings", "update-allow-weekends", value);

    this.save();
  }

  halfHoursChange(value) {
    this.halfHourIntervals = value;
    this.publish("settings", "update-half-hours", value);

    this.save();
  }
}

export class ConfigurationView extends View {
  constructor(model, identity) {
    super(model);
    this.model = model;
    this.identity = identity;

    this.initRangeSliders();

    this.subscribe("identity", "established", this.collapse);
    this.subscribe("settings", "update-days-range", this.updateDaysRange);
    this.subscribe("settings", "update-time-range", this.updateTimeRange);
    this.subscribe(
      "settings",
      "update-allow-weekends",
      this.updateWeekendsCheckbox
    );
    this.subscribe(
      "settings",
      "update-half-hours",
      this.updateHalfHoursCheckbox
    );

    this.initToggleChevron();

    this.initWeekendsCheckbox();
    this.initHafHoursCheckbox();
  }

  collapse({ userId }) {
    const selfId = this.identity.selfId(this.viewId);

    const collapsedByDefault =
      userId === selfId && this.identity.numberOfUsers() > 1;

    if (collapsedByDefault)
      element(".column.side.left").classList.add("collapsed");
  }

  initToggleChevron() {
    element(".toggle-settings").onclick = () => {
      element(".column.side.left").classList.toggle("collapsed");
    };
  }

  initWeekendsCheckbox() {
    this.includeWeekends = element(".include-weekends input");

    this.includeWeekends.checked = this.model.allowWeekends;

    this.includeWeekends.onchange = (event) => {
      this.publish(
        "settings",
        "allow-weekends-change",
        event.currentTarget.checked
      );
    };
  }

  initHafHoursCheckbox() {
    this.halfHourIntervals = element(".half-hours input");

    this.halfHourIntervals.checked = this.model.halfHourIntervals;

    this.halfHourIntervals.onchange = (event) => {
      this.publish(
        "settings",
        "half-hours-change",
        event.currentTarget.checked
      );
    };
  }

  initRangeSliders() {
    this.initDaysRangeSlider();
    this.initTimeRangeSlider();
  }

  initDaysRangeSlider() {
    const selector = element(".days-range");

    const [min, max] = this.model.daysRangeMinMax;
    const [lower, upper] = this.model.daysRange;

    const onChange = (values) => {
      this.publish("settings", "days-range-change", values);
    };

    const formatValue = (value) => {
      return value === 0 ? i18next.t("today") : value + 1;
    };

    this.daysRangeSlider = new RangeSlider(
      selector,
      { min, max, lower, upper },
      { onChange, formatValue }
    );
  }

  initTimeRangeSlider() {
    let selector = element(".time-range");

    const [min, max] = this.model.timeRangeMinMax;
    const [lower, upper] = this.model.timeRange;

    const onChange = (values) => {
      this.publish("settings", "time-range-change", values);
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

  updateWeekendsCheckbox(checked) {
    this.includeWeekends.checked = checked;
  }

  updateHalfHoursCheckbox(checked) {
    this.halfHourIntervals.checked = checked;
  }
}
