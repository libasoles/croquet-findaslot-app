import { App, Model, Session, View } from "@croquet/croquet";
import i18next from "i18next";
import BestResultsView from "./BestResults";
import Calendar from "./Calendar";
import { CalendarService } from "./Calendar/CalendarService";
import CalendarView from "./Calendar/CalendarView";
import { config } from "./config";
import Identity, { IdentityView } from "./Identity";
import { locales } from "./locales";
import Pills, { PillsView } from "./Participants/UsersPills";
import Settings, { SettingsView } from "./Settings";
import { BannerView } from "./widgets/Banner";
import Event, { EventView } from "./widgets/Event";
import { FeedbackView } from "./widgets/Feedback";
import { HistoryMenu } from "./widgets/HistoryMenu";
import { LanguageSwitch } from "./widgets/LanguageSwitch";
import { SetupView } from "./widgets/Setup";

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
  apiKey: "2Mv34ZE0caluPzQJzVd1UsQPvvJ21f6qXV7uj3w2Im",
  appId: "io.croquet.gperez.whenis", // TODO: better namespace
  name: App.autoSession(),
  password: App.autoPassword(),
  model: Main,
  view: MainView,
});
