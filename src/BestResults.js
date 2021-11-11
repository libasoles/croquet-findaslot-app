import { View } from "@croquet/croquet";
import { render } from "@itsjavi/jsx-runtime/src/jsx-runtime/index";
import { formatDate, target } from "./utils";
import createDotElements from "./Dots";
import i18next from "i18next";

export default class BestResultsView extends View {
  constructor(model) {
    super(model);
    this.model = model;

    this.hydrate();

    this.subscribe(
      "calendar",
      "selected-slots-updated",
      this.renderMoreVotedResults.bind(this)
    );
  }

  hydrate() {
    this.renderMoreVotedResults({
      countedSlots: this.model.countedSlots(),
    });
  }

  renderMoreVotedResults({ countedSlots }) {
    if (countedSlots.size === 0) {
      render(<p>{i18next.t("no_results")}</p>, target(".best-results"));
      return;
    }

    const bestFiveOrderedByCount = this.takeBest(countedSlots, 5);

    const results = (
      <ul>
        {bestFiveOrderedByCount.map(([timeSlot, votes]) => {
          const date = formatDate(timeSlot);
          const time = new Date(timeSlot).getHours();
          const dots = createDotElements(votes);

          return (
            <li>
              {date} - {time}hs
              <div className="dots">{dots}</div>
              <p>
                {votes} {i18next.t("votes")}
              </p>
            </li>
          );
        })}
      </ul>
    );

    render(results, target(".best-results"));
  }

  takeBest(countedSlots, amount) {
    return Array.from(countedSlots)
      .sort(([slotA, countA], [slotB, countB]) => countB - countA)
      .slice(0, amount);
  }
}
