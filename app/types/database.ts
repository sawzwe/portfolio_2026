import type { Project, TimelineEntry, SiteData, ProjectGroup } from "./site";

// ---- Raw row shapes returned by Supabase ----
export interface ProjectRow {
  id: string;
  title: string;
  year: string;
  cats: string[];
  group: string;
  role: string;
  stack: string;
  tint: string;
  ph: string;
  w: number;
  h: number;
  off: number;
  descr: string;
  points: string[];
  hero_image: string | null;
  detail_images: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineRow {
  id: string;
  year: string;
  title: string;
  text: string;
  dot: string;
  sort_order: number;
}

export interface SiteRow {
  id: number;
  name: string;
  role: string;
  location: string;
  availability: string;
  education: string;
  intro: string;
  focus: string;
  email: string;
  linkedin: string;
  cv: string;
}

// ---- Row -> UI mappers ----
export function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    title: r.title,
    year: r.year,
    cats: r.cats ?? [],
    group: (r.group as ProjectGroup) ?? "dev",
    role: r.role,
    stack: r.stack,
    tint: r.tint,
    ph: r.ph,
    w: r.w,
    h: r.h,
    off: r.off,
    desc: r.descr,
    points: r.points ?? [],
    heroImage: r.hero_image,
    detailImages: r.detail_images ?? [],
    sortOrder: r.sort_order,
  };
}

export function rowToTimeline(r: TimelineRow): TimelineEntry {
  return {
    id: r.id,
    year: r.year,
    title: r.title,
    text: r.text,
    dot: r.dot,
    sortOrder: r.sort_order,
  };
}

export function rowToSite(r: SiteRow): SiteData {
  return {
    name: r.name,
    role: r.role,
    location: r.location,
    availability: r.availability,
    education: r.education,
    intro: r.intro,
    focus: r.focus,
    socials: { email: r.email, linkedin: r.linkedin, cv: r.cv },
  };
}

// ---- UI -> Row mappers (for writes) ----
export function projectToRow(p: Project): ProjectRow {
  return {
    id: p.id,
    title: p.title,
    year: p.year,
    cats: p.cats,
    group: p.group,
    role: p.role,
    stack: p.stack,
    tint: p.tint,
    ph: p.ph,
    w: p.w,
    h: p.h,
    off: p.off,
    descr: p.desc,
    points: p.points,
    hero_image: p.heroImage ?? null,
    detail_images: p.detailImages ?? [],
    sort_order: p.sortOrder ?? 0,
  };
}
