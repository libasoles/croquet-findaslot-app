import { View } from "@croquet/croquet";
import i18next from "i18next";

export class SetupView extends View {
  wasShareTheLinkBannerDisplayed = false;
  wasSelectAvailabilityBannerDisplayed = false;

  constructor(event, identity, calendarService) {
    super(event);
    this.event = event;
    this.identity = identity;
    this.calendarService = calendarService;

    this.subscribe("event-name", "name-changed", this.onEventNameSet);
    this.subscribe("identity", "name-changed", this.onUserNameSet);
  }

  me() {
    return this.identity.selfId(this.viewId);
  }

  onEventNameSet() {
    if (this.calendarService.userHasAnySelection(this.me())) return;

    const readyToGo = this.identity.isNameSet(this.me());

    if (readyToGo) {
      this.future(100).displayShareTheLinkBanner();
    }
  }

  onUserNameSet() {
    if (this.calendarService.userHasAnySelection(this.me())) return;

    if (!this.event.isEventNameSet()) {
      this.publish("banner", "display", {
        message: i18next.t("setup_almost_done"),
      });

      return;
    }

    if (this.identity.numberOfUsers() === 1) {
      this.future(100).displayShareTheLinkBanner();
    } else {
      if (this.wasSelectAvailabilityBannerDisplayed) return;

      this.publish("banner", "display", {
        message: i18next.t("setup_select_availability"),
        sticky: true,
      });

      this.wasSelectAvailabilityBannerDisplayed = true;
    }
  }

  displayShareTheLinkBanner() {
    if (this.wasShareTheLinkBannerDisplayed) return;

    this.publish("banner", "display", {
      message: i18next.t("setup_done"),
      sticky: true,
    });

    this.wasShareTheLinkBannerDisplayed = true;
  }
}
