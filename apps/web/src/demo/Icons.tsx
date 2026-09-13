export function Icon({
  name,
  size = 20,
}: {
  name:
    | "play"
    | "arrow"
    | "back"
    | "check"
    | "download"
    | "reset"
    | "close"
    | "up"
    | "down"
    | "film"
    | "spark"
    | "file";
  size?: number;
}) {
  const paths: Record<string, string> = {
    play: "m9 5 10 7-10 7Z",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    back: "M20 12H4m6-6-6 6 6 6",
    check: "m5 12 4 4L19 6",
    download: "M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5",
    reset: "M3 10a9 9 0 1 1 2 8M3 3v7h7",
    close: "m6 6 12 12M6 18 18 6",
    up: "m6 15 6-6 6 6",
    down: "m6 9 6 6 6-6",
    film: "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4m10 0h4M3 15h4m10 0h4",
    spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
    file: "M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
