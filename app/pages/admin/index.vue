<!-- pages/admin/index.vue -->
<template>
  <div class="min-h-screen box-border" style="padding: 40px 44px 80px">
    <!-- Header -->
    <div class="flex justify-between items-center" style="margin-bottom: 40px">
      <div>
        <div
          class="text-[12px] tracking-[0.22em] text-grey-700 uppercase"
          style="margin-bottom: 8px"
        >
          Admin
        </div>
        <h1
          class="m-0 font-bold"
          style="font-size: 28px; letter-spacing: -0.02em"
        >
          Content
        </h1>
      </div>
      <div class="flex items-center" style="gap: 20px">
        <span class="text-[12px]" style="color: #b3b3af">{{
          user?.email
        }}</span>
        <NuxtLink
          to="/"
          target="_blank"
          class="text-[12px] tracking-[0.12em] uppercase"
          >View site ↗</NuxtLink
        >
        <button
          type="button"
          class="text-[12px] tracking-[0.12em] uppercase bg-transparent border-0 cursor-pointer p-0"
          style="color: #b00020"
          @click="signOut"
        >
          Sign out
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div
      class="flex"
      style="gap: 28px; border-bottom: 1px solid #e4e4e0; margin-bottom: 36px"
    >
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        class="text-[13px] tracking-[0.12em] uppercase bg-transparent border-0 cursor-pointer"
        style="padding: 0 0 14px"
        :style="{
          fontWeight: tab === t ? 700 : 400,
          color: tab === t ? '#111' : '#b3b3af',
          borderBottom: tab === t ? '2px solid #111' : '2px solid transparent',
          marginBottom: '-1px',
        }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <p v-if="banner" style="color: #1a7f37; font-size: 13px; margin: 0 0 20px">
      {{ banner }}
    </p>
    <p v-if="errorMsg" style="color: #b00020; font-size: 13px; margin: 0 0 20px">
      {{ errorMsg }}
    </p>

    <!-- PROJECTS TAB -->
    <div v-show="tab === 'Projects'">
      <div class="flex justify-between items-center" style="margin-bottom: 20px">
        <div class="text-[13px]" style="color: #6f6f6f">
          {{ projects.length }} projects
        </div>
        <button
          type="button"
          class="text-[12px] font-bold tracking-[0.1em] uppercase"
          style="
            background: #111;
            color: #fff;
            padding: 10px 18px;
            border-radius: 99px;
            border: 0;
            cursor: pointer;
          "
          @click="newProject"
        >
          + New project
        </button>
      </div>

      <AdminProjectEditor
        v-for="(p, i) in projects"
        :key="p.id + '-' + i"
        :project="p"
        @save="onSaveProject"
        @delete="onDeleteProject"
      />
    </div>

    <!-- TIMELINE TAB -->
    <div v-show="tab === 'Timeline'">
      <div class="flex justify-between items-center" style="margin-bottom: 20px">
        <div class="text-[13px]" style="color: #6f6f6f">
          {{ timeline.length }} entries
        </div>
        <button
          type="button"
          class="text-[12px] font-bold tracking-[0.1em] uppercase"
          style="
            background: #111;
            color: #fff;
            padding: 10px 18px;
            border-radius: 99px;
            border: 0;
            cursor: pointer;
          "
          @click="newTimeline"
        >
          + New entry
        </button>
      </div>

      <AdminTimelineEditor
        v-for="(t, i) in timeline"
        :key="(t.id ?? 'new') + '-' + i"
        :entry="t"
        @save="onSaveTimeline"
        @delete="onDeleteTimeline"
      />
    </div>

    <!-- SITE TAB -->
    <div v-show="tab === 'Site'">
      <AdminSiteEditor v-if="site" :site="site" @save="onSaveSite" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Project, TimelineEntry, SiteData } from "~/types/site";

// This page is protected by @nuxtjs/supabase redirect middleware.
definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const admin = useAdmin();

const tabs = ["Projects", "Timeline", "Site"] as const;
const tab = ref<(typeof tabs)[number]>("Projects");

const projects = ref<Project[]>([]);
const timeline = ref<TimelineEntry[]>([]);
const site = ref<SiteData | null>(null);

const banner = ref("");
const errorMsg = ref("");

function flash(msg: string) {
  banner.value = msg;
  errorMsg.value = "";
  setTimeout(() => (banner.value = ""), 2500);
}
function fail(e: unknown) {
  errorMsg.value = e instanceof Error ? e.message : String(e);
}

async function loadAll() {
  try {
    projects.value = await admin.listProjects();
    timeline.value = await admin.listTimeline();
    const { data } = await supabase
      .from("site")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    site.value = data
      ? {
          name: data.name,
          role: data.role,
          location: data.location,
          availability: data.availability,
          education: data.education,
          intro: data.intro,
          focus: data.focus,
          socials: { email: data.email, linkedin: data.linkedin, cv: data.cv },
        }
      : {
          name: "",
          role: "",
          location: "",
          availability: "",
          education: "",
          intro: "",
          focus: "",
          socials: { email: "", linkedin: "", cv: "" },
        };
  } catch (e) {
    fail(e);
  }
}

onMounted(loadAll);

// ---- Projects ----
function newProject() {
  projects.value.unshift({
    id: "new-" + Date.now(),
    title: "Untitled",
    year: new Date().getFullYear().toString(),
    cats: [],
    group: "dev",
    role: "",
    stack: "",
    tint: "#f0f0ec",
    ph: "",
    w: 360,
    h: 320,
    off: 0,
    desc: "",
    points: [],
    heroImage: null,
    detailImages: [],
    sortOrder: projects.value.length,
  });
}
async function onSaveProject(p: Project) {
  try {
    await admin.saveProject(p);
    flash("Project saved.");
    await loadAll();
  } catch (e) {
    fail(e);
  }
}
async function onDeleteProject(id: string) {
  try {
    if (!id.startsWith("new-")) await admin.deleteProject(id);
    projects.value = projects.value.filter((p) => p.id !== id);
    flash("Project deleted.");
  } catch (e) {
    fail(e);
  }
}

// ---- Timeline ----
function newTimeline() {
  timeline.value.push({
    year: new Date().getFullYear().toString(),
    title: "",
    text: "",
    dot: "#111",
    sortOrder: timeline.value.length,
  });
}
async function onSaveTimeline(t: TimelineEntry) {
  try {
    await admin.saveTimeline(t);
    flash("Timeline saved.");
    await loadAll();
  } catch (e) {
    fail(e);
  }
}
async function onDeleteTimeline(t: TimelineEntry) {
  try {
    if (t.id) await admin.deleteTimeline(t.id);
    timeline.value = timeline.value.filter((x) => x !== t);
    flash("Entry deleted.");
  } catch (e) {
    fail(e);
  }
}

// ---- Site ----
async function onSaveSite(s: SiteData) {
  try {
    await admin.saveSite(s);
    flash("Site settings saved.");
  } catch (e) {
    fail(e);
  }
}

async function signOut() {
  await supabase.auth.signOut();
  router.replace("/admin/login");
}

useHead({ title: "Admin — Content" });
</script>
