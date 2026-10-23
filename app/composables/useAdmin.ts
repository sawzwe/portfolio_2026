import type { Project, TimelineEntry, SiteData } from "~/types/site";
import type { ProjectRow, TimelineRow } from "~/types/database";
import { projectToRow, rowToProject, rowToTimeline } from "~/types/database";

/**
 * Admin write operations. All of these require an authenticated session;
 * RLS rejects them otherwise.
 */
export function useAdmin() {
  const supabase = useSupabaseClient();

  // ---------- PROJECTS ----------
  async function listProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as unknown as ProjectRow[]).map(rowToProject);
  }

  async function saveProject(p: Project): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .upsert(projectToRow(p) as never);
    if (error) throw error;
  }

  async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  }

  // ---------- TIMELINE ----------
  async function listTimeline(): Promise<TimelineEntry[]> {
    const { data, error } = await supabase
      .from("timeline")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as unknown as TimelineRow[]).map(rowToTimeline);
  }

  async function saveTimeline(t: TimelineEntry): Promise<void> {
    const row: Record<string, unknown> = {
      year: t.year,
      title: t.title,
      text: t.text,
      dot: t.dot,
      sort_order: t.sortOrder ?? 0,
    };
    if (t.id) row.id = t.id;
    const { error } = await supabase.from("timeline").upsert(row as never);
    if (error) throw error;
  }

  async function deleteTimeline(id: string): Promise<void> {
    const { error } = await supabase.from("timeline").delete().eq("id", id);
    if (error) throw error;
  }

  // ---------- SITE ----------
  async function saveSite(s: SiteData): Promise<void> {
    const { error } = await supabase.from("site").upsert({
      id: 1,
      name: s.name,
      role: s.role,
      location: s.location,
      availability: s.availability,
      education: s.education,
      intro: s.intro,
      focus: s.focus,
      email: s.socials.email,
      linkedin: s.socials.linkedin,
      cv: s.socials.cv,
    } as never);
    if (error) throw error;
  }

  // ---------- IMAGE UPLOAD ----------
  async function uploadImage(file: File, projectId: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${projectId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) throw error;
    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);
    return data.publicUrl;
  }

  return {
    listProjects,
    saveProject,
    deleteProject,
    listTimeline,
    saveTimeline,
    deleteTimeline,
    saveSite,
    uploadImage,
  };
}
