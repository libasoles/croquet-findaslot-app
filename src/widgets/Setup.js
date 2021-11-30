import { View } from "@croquet/croquet";
import i18next from "i18next";
import { element, readCookie } from "../utils";

export class SetupView extends View {
  constructor(event, identity, calendarService) {
    super(event);
    this.event = event;
    this.identity = identity;
    this.calendarService = calendarService;

    new FirstTimeBanner();

    this.almostThereBanner = new AlmostThereBanner(this.publish.bind(this));
    this.shareTheLinkBanner = new ShareTheLinkBanner(this.publish.bind(this));
    this.selectAvailabilityBanner = new SelectAvailabilityBanner(
      this.publish.bind(this)
    );

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
      this.almostThereBanner.display();

      return;
    }

    if (this.identity.numberOfUsers() === 1) {
      this.future(100).displayShareTheLinkBanner();
    } else {
      this.selectAvailabilityBanner.display();
    }
  }

  displayShareTheLinkBanner() {
    this.shareTheLinkBanner.display();
  }
}

class FirstTimeBanner {
  constructor() {
    this.banner = element(".landing-banner");

    const firstTimeHere = !readCookie("beenHereBefore")
      ? true
      : !parseInt(readCookie("beenHereBefore"));

    if (firstTimeHere) {
      this.banner.classList.remove("hidden");

      this.init();
    }
  }

  init() {
    this.banner.querySelector("button").onclick = () => {
      this.banner.classList.add("fadeOut");

      setTimeout(() => element("body").removeChild(this.banner), 250);

      document.cookie = `beenHereBefore=1`;
    };
  }
}

class AlmostThereBanner {
  constructor(publish) {
    this.publish = publish;
  }

  display() {
    this.publish("banner", "display", {
      message: i18next.t("setup_almost_done"),
    });
  }
}

class ShareTheLinkBanner {
  displayed = false;

  constructor(publish) {
    this.publish = publish;
  }

  display() {
    if (this.displayed) return;

    this.publish("banner", "display", {
      message: i18next.t("setup_done"),
      sticky: true,
    });

    this.displayed = true;
  }
}

class SelectAvailabilityBanner {
  displayed = false;

  constructor(publish) {
    this.publish = publish;
  }

  display() {
    if (this.displayed) return;

    this.publish("banner", "display", {
      message: i18next.t("setup_select_availability"),
      sticky: true,
    });

    this.displayed = true;
  }
}
