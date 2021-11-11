import { App, Model, View, Session } from "@croquet/croquet";
import Calendar from "./Calendar";
import CalendarView from "./CalendarView";
import Settings, { ConfigurationView } from "./Settings";
import EventName, { EventNameView } from "./EventName";
import BestResultsView from "./BestResults";
import Identity, { IdentityView } from "./Identity";
import i18next from "i18next";
import { locales } from "./locales";
import { config } from "./config";
import Pills, { PillsView } from "./UsersPills";

class Main extends Model {
  init() {
    this.identity = Identity.create();
    this.calendar = Calendar.create();
    this.configuration = Settings.create();
    this.eventName = EventName.create();
    this.pills = Pills.create();
  }
}

class MainView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.i18n();

    this.views = [
      new IdentityView(model.identity),
      new CalendarView(
        model.calendar,
        model.identity,
        model.configuration,
        model.pills
      ),
      new PillsView(model.pills, model.identity, model.calendar),
      new ConfigurationView(model.configuration),
      new EventNameView(model.eventName),
      new BestResultsView(model.calendar),
    ];
  }

  detach() {
    super.detach();

    this.views.forEach((view) => view.detach());
  }

  i18n() {
    i18next.init({
      lng: config.lang,
      debug: false,
      resources: {
        es: {
          translation: locales.es,
        },
        en: {
          translation: locales.en,
        },
      },
    });
  }
}

Main.register("Main");
Identity.register("Identity");
EventName.register("EventName");
Calendar.register("Calendar");
Settings.register("Settings");
Pills.register("Pills");

Session.join({
  apiKey: "1d5yaq96ii9K5L7zHGa6lxgaMpbO7Au1oinsteyx5",
  appId: "io.croquet.gperez.whenis", // TODO: better namespace
  name: App.autoSession(),
  password: App.autoPassword(),
  model: Main,
  view: MainView,
});
