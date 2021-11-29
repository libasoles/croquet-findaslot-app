import { View } from "@croquet/croquet";
import { element, target } from "../utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class BannerView extends View {
  seconds = 6;

  constructor(model) {
    super(model);
    this.subscribe("banner", "display", this.display);
  }

  display({ message, sticky }) {
    const onClose = ({ currentTarget }) => {
      this.close(currentTarget.parentNode);
    };

    const banner = (
      <div className="banner animated flipInX">
        <p>{message}</p>
        <button onClick={onClose}>&times;</button>
      </div>
    );

    const element = render(banner, target(".banners"));

    if (!sticky) {
      setTimeout(() => this.close(element), this.seconds * 1000);
    }
  }

  close(bannerSelector) {
    bannerSelector.classList.add("fadeOut");

    setTimeout(() => element(".banners").removeChild(bannerSelector), 250);
  }
}
