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
import { FeedbackView } from "./Feedback";
import { HistoryMenu } from "./HistoryMenu";

class Main extends Model {
  init(options, persistedState) {
    if (persistedState && persistedState.documents) {
      this.hydrate(options, persistedState);
    } else {
      this.createSession();
    }
  }

  hydrate(options, persistedState) {
    switch (persistedState.version) {
      case 1:
      default:
        const { documents } = persistedState;
        this.identity = Identity.create(options, documents.identity);
        this.calendar = Calendar.create(options, documents.calendar);
        this.settings = Settings.create(options, documents.settings);
        this.eventName = EventName.create(options, documents.eventName);
        this.pills = Pills.create();
        break;
    }
  }

  createSession() {
    this.identity = Identity.create();
    this.calendar = Calendar.create();
    this.settings = Settings.create();
    this.eventName = EventName.create();
    this.pills = Pills.create();
  }

  save() {
    this.persistSession(this.serialize);
  }

  serialize() {
    return {
      version: 1,
      documents: {
        identity: this.identity.serialize(),
        calendar: this.calendar.serialize(),
        settings: this.settings.serialize(),
        eventName: this.eventName.serialize(),
      },
    };
  }
}

class MainView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.i18n();

    this.views = [
      new IdentityView(model.identity, model.identity),
      new CalendarView(
        model.calendar,
        model.identity,
        model.settings,
        model.pills
      ),
      new HistoryMenu(model.eventName),
      new PillsView(
        model.pills,
        model.identity,
        model.calendar,
        model.eventName
      ),
      new ConfigurationView(model.settings, model.identity),
      new EventNameView(model.eventName, model.identity),
      new BestResultsView(model.calendar, model.eventName, model.identity),
      new FeedbackView(model),
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
