import type { Metric } from "@/lib/format";

/** A big numeral with unit and technical label. */
export function MetricBlock({
  metric,
  size = "md",
  tone = "light",
}: {
  metric: Metric;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "light" | "dark";
}) {
  const num = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-5xl sm:text-6xl",
    xl: "text-6xl sm:text-7xl lg:text-8xl",
  }[size];
  const isText = metric.key === "size";
  return (
    <div className="min-w-0">
      <div
        className={`${isText ? "font-display-wide text-base leading-tight sm:text-lg" : `numeral ${num}`} ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        {metric.value}
        {metric.unit && <span className="ml-1 align-baseline text-[0.42em] tracking-normal">{metric.unit}</span>}
      </div>
      <div className={`label mt-2 ${tone === "dark" ? "text-fog" : "text-mute"}`}>{metric.label}</div>
    </div>
  );
}
