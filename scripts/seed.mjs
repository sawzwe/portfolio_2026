// Seed Supabase with the initial portfolio content.
//
// Usage:
//   1. Copy .env.example to .env and fill SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//   2. Run the SQL migration (supabase/migrations/0001_init.sql) first
//   3. node scripts/seed.mjs
//
// The service_role key bypasses RLS — keep it secret, never ship to the client.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Load .env manually (no dotenv dependency needed).
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
try {
  const env = readFileSync(resolve(root, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* .env optional if vars already in environment */
}

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Fill them in .env"
  );
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});

// ---- Import content. projects.ts/timeline.ts are TS; read the JSON site file
// directly and require the compiled data by re-declaring here is messy, so we
// import via a dynamic import of a small JSON mirror generated below. Instead,
// we read the TS files' exported arrays through a tiny transform: the data
// files are plain object literals, so we import them with a loader.
// Simplest robust approach: import the JSON site file + parse the TS data.

const site = JSON.parse(
  readFileSync(resolve(root, "app/data/site.json"), "utf8")
);

// Use jiti (bundled with Nuxt) to import the TypeScript data files directly.
const { createJiti } = await import("jiti");
const jiti = createJiti(import.meta.url);
const { projects } = await jiti.import(resolve(root, "app/data/projects.ts"));
const { timeline } = await jiti.import(resolve(root, "app/data/timeline.ts"));

async function run() {
  console.log("→ Seeding site…");
  {
    const { error } = await supabase.from("site").upsert({
      id: 1,
      name: site.name,
      role: site.role,
      location: site.location,
      availability: site.availability,
      education: site.education,
      intro: site.intro,
      focus: site.focus,
      email: site.socials.email,
      linkedin: site.socials.linkedin,
      cv: site.socials.cv,
    });
    if (error) throw error;
  }

  console.log(`→ Seeding ${projects.length} projects…`);
  {
    const rows = projects.map((p, i) => ({
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
      points: p.points ?? [],
      hero_image: null,
      detail_images: [],
      sort_order: i,
    }));
    const { error } = await supabase.from("projects").upsert(rows);
    if (error) throw error;
  }

  console.log(`→ Seeding ${timeline.length} timeline entries…`);
  {
    // Clear then insert to keep sort order deterministic.
    await supabase.from("timeline").delete().neq("year", "___never___");
    const rows = timeline.map((t, i) => ({
      year: t.year,
      title: t.title,
      text: t.text,
      dot: t.dot,
      sort_order: i,
    }));
    const { error } = await supabase.from("timeline").insert(rows);
    if (error) throw error;
  }

  console.log("✓ Seed complete.");
}

run().catch((e) => {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
});
