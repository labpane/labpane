import type { SVGProps } from "react";

const icon = (strokeWidth: number, ...paths: string[]) =>
  function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  };

export const ChevronLeftIcon = icon(4 / 3, "M10 4 6 8l4 4");
export const ChevronRightIcon = icon(4 / 3, "m6 4 4 4-4 4");
export const XIcon = icon(7 / 6, "m12 4-8 8", "m4 4 8 8");
