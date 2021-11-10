import { intlFormat } from "date-fns";
import { config } from "./config";

const dateTimeFormat = {
  weekday: "long",
  month: "short",
  day: "numeric",
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

export function formatDate(date) {
  return intlFormat(new Date(date), dateTimeFormat, {
    locale: config.locale,
  });
}

export function readCookie(name) {
  const result = document.cookie
    .split(";")
    .map((rawCookie) => rawCookie.split("="))
    .map(([key, value]) => [key.trim(), value])
    .find((cookie) => cookie[0] === name);

  if (!result) return;

  return result.reduce((_, value) => value);
}
