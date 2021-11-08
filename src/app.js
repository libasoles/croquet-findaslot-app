import { App, Model, View, Session } from "@croquet/croquet";
import Calendar from "./Calendar";
import CalendarView from "./CalendarView";
import Configuration, { ConfigurationView } from "./Configuration";
import EventName, { EventNameView } from "./EventName";
import BestResultsView from "./BestResults";
import Identity, { IdentityView } from "./Identity";
import i18next from "i18next";

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

    this.i18n();

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

  i18n() {
    i18next.init({
      lng: "en",
      debug: false,
      resources: {
        en: {
          translation: {
            best_results: "Best results",
            no_results: "No results to display yet",
            votes: "votes",
            today: "today",
            event_name: "Event name",
            your_name: "Your name",
          },
        },
        es: {
          translation: {
            best_results: "Aun nadie marco sus horarios",
            no_results: "Aun nadie marco sus horarios",
            votes: "votos",
            today: "hoy",
            event_name: "Nombre del evento",
            your_name: "Tu nombre",
          },
        },
      },
    });
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
