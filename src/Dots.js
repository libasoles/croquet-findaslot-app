import { range } from "./utils";

export default function createDotElements(count) {
  return count > 0
    ? range(count).map((i) => <div className="dot"></div>)
    : null;
}
