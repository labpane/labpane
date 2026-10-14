import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  experimentalParseClassName: ({ className, parseClassName }) =>
    parseClassName(className.replace(/^labui:/, "")),
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const focusRing =
  "labui:focus-visible:border-ring labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50";

export const invalidRing =
  "labui:aria-invalid:border-destructive labui:aria-invalid:ring-destructive/20 labui:dark:aria-invalid:ring-destructive/40";

export const overlay =
  "labui:fixed labui:inset-0 labui:z-50 labui:bg-overlay labui:data-[state=open]:animate-fade-in labui:data-[state=closed]:animate-fade-out";

export const closeButton = [
  "labui:absolute labui:top-4 labui:right-4 labui:inline-flex labui:size-8 labui:items-center labui:justify-center labui:rounded-md",
  "labui:text-muted-foreground labui:transition-colors labui:hover:bg-accent labui:hover:text-foreground",
  "labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:focus-visible:outline-none labui:disabled:pointer-events-none",
  "labui:[&_svg]:pointer-events-none labui:[&_svg]:size-4 labui:[&_svg]:shrink-0",
].join(" ");

export const inputSurface = [
  "labui:w-full labui:min-w-0 labui:rounded-md labui:border labui:border-input labui:bg-input-background labui:shadow-xs",
  "labui:text-base labui:md:text-sm labui:placeholder:text-muted-foreground labui:transition-[color,box-shadow] labui:outline-none",
  "labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
  focusRing,
  invalidRing,
].join(" ");
