import { intlFormat } from "date-fns";

export const locale = "en-US";

const dateTimeFormat = {
  weekday: "long",
  month: "short",
  day: "numeric",
  hour: "numeric",
};

export function range(start, end, includeEnd = true) {
  if (typeof end === "undefined")
    return start === 0 ? [] : [0, ...range(1, start, false)];

  if (start === end) {
    if (end === 0) return [];
    if (includeEnd) return [end];
    return [];
  }

  return [start, ...range(start + 1, end, includeEnd)];
}

export function display(domNode) {
  domNode.classList.remove("hidden");
}

export function hide(domNode) {
  domNode.classList.add("hidden");
}

export function target(name) {
  return document.querySelector(name);
}

export function formatDateTime(date) {
  return intlFormat(new Date(date), dateTimeFormat, {
    locale,
  });
}
