import { View } from "@croquet/croquet";
import { target } from "./utils";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";

export class LanguageSwitch extends View {
  constructor(model) {
    super(model);

    const links = (
      <>
        <a href={this.uri("en")}>EN</a> / <a href={this.uri("es")}>ES</a>
      </>
    );

    render(links, target("footer .language-switch"));
  }

  uri(lang) {
    const { origin, search, hash } = window.location;

    return `${origin}/${lang === "es" ? "" : lang}${search}${hash}`;
  }
}
