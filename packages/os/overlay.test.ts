import { afterEach, expect, it } from "bun:test";
import { hasOpenOverlay } from "./overlay.js";

afterEach(() => {
  document.body.innerHTML = "";
  delete (document as { fullscreenElement?: unknown }).fullscreenElement;
});

const show = (html: string) => {
  document.body.innerHTML = html;
  return hasOpenOverlay();
};

it("is open while a dialog, menu, listbox, or marked overlay is in the document", () => {
  expect(show("<p>Page</p>")).toBe(false);
  expect(show('<div role="dialog">Save?</div>')).toBe(true);
  expect(show('<div role="alertdialog">Discard?</div>')).toBe(true);
  expect(show('<ul role="menu"><li role="menuitem">Cut</li></ul>')).toBe(true);
  expect(show('<ul role="listbox"><li role="option">One</li></ul>')).toBe(true);
  expect(show("<div data-labpane-overlay>Palette</div>")).toBe(true);
  expect(show('<button aria-haspopup="menu">Menu</button>')).toBe(false);
});

it("counts a full-screen element, but not the whole page in full screen", () => {
  document.body.innerHTML = "<video></video>";
  const full = (element: Element) =>
    Object.defineProperty(document, "fullscreenElement", {
      value: element,
      configurable: true,
    });
  full(document.querySelector("video")!);
  expect(hasOpenOverlay()).toBe(true);
  full(document.documentElement);
  expect(hasOpenOverlay()).toBe(false);
});
