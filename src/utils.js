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
