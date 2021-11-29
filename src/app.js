import { App, Model, View, Session } from "@croquet/croquet";
import Calendar from "./Calendar";
import CalendarView from "./Calendar/CalendarView";
import Settings, { SettingsView } from "./Settings";
import Event, { EventView } from "./widgets/Event";
import BestResultsView from "./BestResults";
import Identity, { IdentityView } from "./Identity";
import i18next from "i18next";
import { locales } from "./locales";
import { config } from "./config";
import Pills, { PillsView } from "./Participants/UsersPills";
import { FeedbackView } from "./widgets/Feedback";
import { HistoryMenu } from "./widgets/HistoryMenu";
import { LanguageSwitch } from "./widgets/LanguageSwitch";
import { CalendarService } from "./Calendar/CalendarService";
import { SetupView } from "./widgets/Setup";
import { BannerView } from "./widgets/Banner";

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
        this.settings = Settings.create(options, documents.settings);
        this.calendar = Calendar.create(options, documents.calendar);
        this.event = Event.create(options, documents.event);
        this.pills = Pills.create();
        break;
    }
  }

  createSession() {
    this.identity = Identity.create();
    this.settings = Settings.create();
    this.calendar = Calendar.create();
    this.event = Event.create();
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
        settings: this.settings.serialize(),
        calendar: this.calendar.serialize(),
        event: this.event.serialize(),
      },
    };
  }
}

class MainView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.i18n();

    const calendarService = new CalendarService(
      model.calendar,
      model.settings,
      model.identity
    );

    this.views = [
      new IdentityView(model.identity),
      new CalendarView(
        calendarService,
        model.calendar,
        model.identity,
        model.settings,
        model.pills
      ),
      new HistoryMenu(model.event),
      new PillsView(
        calendarService,
        model.pills,
        model.identity,
        model.event,
        model.settings
      ),
      new SettingsView(model.settings, model.identity),
      new EventView(model.event, model.identity, model.settings),
      new BestResultsView(
        calendarService,
        model.event,
        model.identity,
        model.settings
      ),
      new FeedbackView(model),
      new LanguageSwitch(model),
      new SetupView(model.event, model.identity, calendarService),
      new BannerView(model),
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
Event.register("Event");
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
