import { intlFormat } from "date-fns";
import { config } from "./config";

export const longDateFormat = {
  weekday: "long",
  month: "short",
  day: "numeric",
};

export const dayFormat = {
  weekday: "long",
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
  return element(name);
}

export function element(selector) {
  return document.querySelector(selector);
}

export function formatDate(date, format = longDateFormat) {
  const dateObject = typeof date === "string" ? new Date(date) : date;

  return intlFormat(dateObject, format, {
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

export function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.platform
    )
  );
}
