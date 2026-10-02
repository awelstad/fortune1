import type { HomepageSettings, Project } from "./types";

type NowBuildingSettings = Pick<HomepageSettings, "now_building_count" | "now_building_mode" | "now_building_ids">;

/** Dollar size used to rank jobs: project value, else Fortune's electrical contract. */
export const jobValue = (p: Pick<Project, "project_value" | "electrical_contract_value">) =>
  p.project_value ?? p.electrical_contract_value ?? 0;

/** Biggest first: dollar value, then square footage, then the admin's display order. */
export function byJobSize<T extends Pick<Project, "project_value" | "electrical_contract_value" | "square_feet" | "display_order">>(a: T, b: T) {
  return jobValue(b) - jobValue(a) || (b.square_feet ?? 0) - (a.square_feet ?? 0) || a.display_order - b.display_order;
}

/**
 * The hero "Now Building" board. Automatic = the biggest current jobs; manual =
 * the admin's picks in their order, skipping any that are no longer current.
 */
export function pickNowBuilding<T extends Project>(projects: T[], settings: NowBuildingSettings): T[] {
  const count = Math.min(8, Math.max(1, settings.now_building_count || 5));
  const current = projects.filter((p) => p.status === "current");
  if (settings.now_building_mode === "manual" && settings.now_building_ids?.length) {
    const byId = new Map(current.map((p) => [p.id, p]));
    return settings.now_building_ids.map((id) => byId.get(id)).filter((p): p is T => !!p).slice(0, count);
  }
  return [...current].sort(byJobSize).slice(0, count);
}
