import * as React from "react";

const query = "(max-width: 767px)";

const subscribe = (change: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
};

const matches = () => window.matchMedia(query).matches;

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, matches, () => false);
}
