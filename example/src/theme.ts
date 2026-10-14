import { useEffect, useSyncExternalStore } from "react";

const key = "labpane-theme";
const root = document.documentElement;

function stored() {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(change: () => void) {
  const observer = new MutationObserver(change);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => root.classList.contains("dark");

export function setDark(dark: boolean) {
  try {
    localStorage.setItem(key, dark ? "dark" : "light");
  } catch {}
  root.classList.toggle("dark", dark);
}

export function useDark() {
  const dark = useSyncExternalStore(subscribe, isDark);
  useEffect(() => {
    const system = matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (!stored()) root.classList.toggle("dark", system.matches);
    };
    system.addEventListener("change", follow);
    return () => system.removeEventListener("change", follow);
  }, []);
  return dark;
}
