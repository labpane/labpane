import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  experimentalParseClassName: ({ className, parseClassName }) =>
    parseClassName(className.replace(/^labui:/, "")),
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
