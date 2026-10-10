import type { CSSProperties } from "react";
const paths = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  back: "M20 12H5m6-6-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "m5 12 4 4 10-10",
  undo: "M5 8h9a6 6 0 0 1 0 12M5 8l4-4M5 8l4 4",
  reset: "M4 9a8 8 0 1 1 0 6M4 4v5h5",
  close: "m6 6 12 12M6 18 18 6",
  desk: "M3 8h18v4H3zM5 12v8m14-8v8",
  chair: "M8 3h8l1 10H7zM5 13h14v4H5zM12 17v4m-5 0h10",
  extras:
    "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z",
  move: "M12 3v18M3 12h18m-6-6-3-3-3 3m6 12-3 3-3-3M6 9l-3 3 3 3m12-6 3 3-3 3",
  info: "M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  box: "m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10",
  leaf: "M5 19C1 6 12 3 21 3c0 9-3 20-16 16Zm0 0L17 7",
  camera: "M4 7h4l2-3h4l2 3h4v13H4zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  monitor: "M3 4h18v13H3zM12 17v4m-5 0h10",
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: keyof typeof paths;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
