import { App, Model, View, Session } from "@croquet/croquet";
import Calendar from "./Calendar";
import CalendarView from "./CalendarView";
import Configuration, { ConfigurationView } from "./Configuration";
import EventName, { EventNameView } from "./EventName";
import BestResultsView from "./BestResults";
import Identity, { IdentityView } from "./Identity";

class Main extends Model {
  init() {
    this.calendar = Calendar.create();
    this.configuration = Configuration.create();
    this.identity = Identity.create();
    this.eventName = EventName.create();
  }
}

class MainView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.views = [
      new CalendarView(model.calendar, model.configuration),
      new ConfigurationView(model.configuration),
      new EventNameView(model.eventName),
      new BestResultsView(model.calendar),
      new IdentityView(model.identity),
    ];
  }

  detach() {
    super.detach();

    this.views.forEach((view) => view.detach());
  }
}

Main.register("Main");
Identity.register("Identity");
EventName.register("EventName");
Calendar.register("Calendar");
Configuration.register("Configuration");

Session.join({
  apiKey: "1d5yaq96ii9K5L7zHGa6lxgaMpbO7Au1oinsteyx5",
  appId: "io.croquet.gperez.whenis", // TODO: better namespace
  name: App.autoSession(),
  password: App.autoPassword(),
  model: Main,
  view: MainView,
});
