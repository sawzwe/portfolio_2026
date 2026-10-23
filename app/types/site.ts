export type ProjectGroup = "dev" | "data" | "seo";

/** Shape the UI renders against. */
export interface Project {
  id: string;
  title: string;
  year: string;
  cats: string[];
  group: ProjectGroup;
  role: string;
  stack: string;
  tint: string;
  ph: string;
  /** card width in px (used for the horizontal gallery layout) */
  w: number;
  /** card height in px */
  h: number;
  /** vertical offset in px for the staggered gallery */
  off: number;
  desc: string;
  points: string[];
  heroImage?: string | null;
  detailImages?: string[];
  sortOrder?: number;
}

/**
 * One career timeline entry. The single source for the About page, the
 * sawmill hero planks and the home timeline list (CMS table `timeline`,
 * offline fallback app/data/timeline.ts).
 */
export interface TimelineEntry {
  id?: string;
  /** Label printed on the plank: "2024", "now", "2020–24". */
  year: string;
  title: string;
  /** Company, school or "Project". */
  org: string;
  /** One-line detail. */
  text: string;
  /** dot fill colour */
  dot: string;
  sortOrder?: number;
}

export interface SiteData {
  name: string;
  role: string;
  location: string;
  availability: string;
  education: string;
  intro: string;
  focus: string;
  socials: {
    email: string;
    linkedin: string;
    cv: string;
  };
}
