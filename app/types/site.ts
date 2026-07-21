export type ProjectGroup = "dev" | "data" | "seo";

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
}

export interface TimelineEntry {
  year: string;
  title: string;
  text: string;
  /** dot fill colour */
  dot: string;
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
