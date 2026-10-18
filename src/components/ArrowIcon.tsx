export function ArrowIcon({ direction = "right" }: { direction?: "right" | "up-right" }) {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={direction === "up-right" ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-7-7 7 7-7 7"} />
    </svg>
  );
}
