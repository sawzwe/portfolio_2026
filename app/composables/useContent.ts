import type { Project, TimelineEntry, SiteData } from "~/types/site";
import type { ProjectRow, TimelineRow, SiteRow } from "~/types/database";
import { rowToProject, rowToTimeline, rowToSite } from "~/types/database";

// Static fallbacks — used when Supabase has no data yet (or isn't reachable),
// so the site always renders something.
import { projects as fallbackProjects } from "~/data/projects";
import { timeline as fallbackTimeline } from "~/data/timeline";
import fallbackSite from "~/data/site.json";

/**
 * Fetch all projects (ordered). SSR-friendly via useAsyncData.
 */
export function useProjects() {
  const supabase = useSupabaseClient();
  return useAsyncData<Project[]>("projects", async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false });

    if (error) {
      console.error("[content] projects fetch failed:", error.message);
      return fallbackProjects;
    }
    if (!data || data.length === 0) return fallbackProjects;
    return (data as unknown as ProjectRow[]).map(rowToProject);
  });
}

/**
 * Fetch a single project by slug id.
 */
export function useProject(id: string) {
  const supabase = useSupabaseClient();
  return useAsyncData<Project | null>(`project-${id}`, async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[content] project fetch failed:", error.message);
      return fallbackProjects.find((p) => p.id === id) ?? null;
    }
    if (!data) return fallbackProjects.find((p) => p.id === id) ?? null;
    return rowToProject(data as unknown as ProjectRow);
  });
}

/**
 * Fetch the growth timeline (ordered).
 */
export function useTimeline() {
  const supabase = useSupabaseClient();
  return useAsyncData<TimelineEntry[]>("timeline", async () => {
    const { data, error } = await supabase
      .from("timeline")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[content] timeline fetch failed:", error.message);
      return fallbackTimeline;
    }
    if (!data || data.length === 0) return fallbackTimeline;
    return (data as unknown as TimelineRow[]).map(rowToTimeline);
  });
}

/**
 * Fetch the single site-settings row.
 */
export function useSite() {
  const supabase = useSupabaseClient();
  return useAsyncData<SiteData>("site", async () => {
    const { data, error } = await supabase
      .from("site")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[content] site fetch failed:", error.message);
      return fallbackSite as SiteData;
    }
    if (!data) return fallbackSite as SiteData;
    return rowToSite(data as unknown as SiteRow);
  });
}
