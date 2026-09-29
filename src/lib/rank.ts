import type { ProjectWithMedia } from "./types";

/** Rough "how much does this project sell" score: photography + documented scale. */
export function showcaseScore(p: ProjectWithMedia): number {
  return (
    (p.hero ? 1e12 : 0) +
    (p.hero?.width ?? 0) * 1e6 +
    (p.project_value ? 1e5 : 0) +
    (p.square_feet ? 1e4 : 0) +
    (p.units ? 1e4 : 0) +
    (p.electrical_contract_value ? 1e3 : 0)
  );
}

/** Stable: projects with photography first, admin display order preserved within each group. */
export function photoFirst<T extends ProjectWithMedia>(projects: T[]): T[] {
  return [...projects.filter((p) => p.hero), ...projects.filter((p) => !p.hero)];
}

export function best<T extends ProjectWithMedia>(projects: T[]): T | null {
  return projects.reduce<T | null>((top, p) => (!top || showcaseScore(p) > showcaseScore(top) ? p : top), null);
}
