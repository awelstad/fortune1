import type { ProjectStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

const tone: Record<ProjectStatus, string> = {
  current: "bg-live",
  upcoming: "bg-amber",
  completed: "bg-fog",
};

export function StatusBadge({
  status,
  variant = "overlay",
}: {
  status: ProjectStatus;
  variant?: "overlay" | "light" | "dark";
}) {
  const shell =
    variant === "overlay"
      ? "bg-ink/70 text-white backdrop-blur-sm ring-1 ring-white/15"
      : variant === "dark"
        ? "bg-white/5 text-white ring-1 ring-white/15"
        : "bg-white text-ink ring-1 ring-rule";
  return (
    <span className={`label inline-flex items-center gap-2 px-2.5 py-1.5 ${shell}`}>
      <span
        className={`size-1.5 rounded-full ${tone[status]} ${status === "current" ? "animate-pulse-live" : ""}`}
        aria-hidden
      />
      {statusLabel[status]}
    </span>
  );
}
