import { View } from "@croquet/croquet";
import { target } from "./utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import i18next from "i18next";
import { config } from "./config";

const NewEvent = () => {
  const lang = config.locale.lang;

  return (
    <li className="new-event">
      <a href={"/" + lang}>
        <span className="plus-icon"></span> {i18next.t("new_event")}
      </a>
    </li>
  );
};

export class HistoryMenu extends View {
  constructor(eventName) {
    super(eventName);
    this.eventName = eventName;

    this.subscribe("identity", "established", this.createOrUpdateSession);
    this.subscribe(
      "event-name",
      "update-event-name",
      this.createOrUpdateSession
    );

    this.hydrate();
  }

  hydrate() {
    const sessionsLog = this.readSessions();

    this.renderMenu(sessionsLog);
  }

  createOrUpdateSession() {
    const { eventName } = this.eventName;

    if (!eventName) return;

    const session = {
      url: window.location.href,
      lastDate: new Date(),
      eventName,
    };

    const sessionsLog = this.readSessions();

    const sessionIdentifier = window.location.search + window.location.hash;

    sessionsLog.set(sessionIdentifier, session);

    this.saveSessions(sessionsLog);

    this.renderMenu(sessionsLog);
  }

  readSessions() {
    return new Map(JSON.parse(localStorage.getItem("sessions"))) || new Map();
  }

  saveSessions(sessionsLog) {
    const encodedSessions = JSON.stringify(Array.from(sessionsLog));

    window.localStorage.setItem("sessions", encodedSessions);
  }

  renderMenu(sessions) {
    const menuItems = this.menuItems(sessions);

    render(
      <>
        <NewEvent />
        <li className="history">
          <h3>{i18next.t("history")}</h3>
        </li>
        <>{menuItems}</>
      </>,
      target("nav .menu")
    );
  }

  menuItems(sessions) {
    if (sessions.size === 0) {
      return <li>{i18next.t("no_other_events_yet")}</li>;
    }

    const limit = 7;

    return Array.from(sessions)
      .sort(
        ([_, sessionA], [__, sessionB]) =>
          new Date(sessionB.lastDate).getTime() -
          new Date(sessionA.lastDate).getTime()
      )
      .slice(0, limit)
      .map(([_, session]) => {
        return (
          <li className="other-event">
            <a href={session.url}>
              <span>{session.eventName}</span>
            </a>
          </li>
        );
      });
  }
}
