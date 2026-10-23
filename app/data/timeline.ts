import type { TimelineEntry } from "~/types/site";

/**
 * Career timeline: seed content for the CMS (`npm run seed`) and the offline
 * fallback when Supabase is unreachable or empty. The live source of truth is
 * the CMS `timeline` table, edited in /admin; this file only mirrors its
 * initial content.
 *
 * Oldest first. The About page lists it in this order; the sawmill hero
 * reverses it, so the last entry is the slice under the saw.
 * `dot`: filled (#111) for past entries, hollow (#fcfcfb) for the current one.
 */
export const timeline: TimelineEntry[] = [
  {
    year: "2020–24",
    title: "B.Sc. Computer Science",
    org: "Assumption University",
    text: "Magna Cum Laude",
    dot: "#111",
  },
  {
    year: "2023",
    title: "House of Griffin",
    org: "Project",
    text: "Digitized a paper school system for 5 stakeholders",
    dot: "#111",
  },
  {
    year: "2024",
    title: "PS Park Apartment",
    org: "Project",
    text: "Electron app replacing a 20+ year old system; admin work cut 70%",
    dot: "#111",
  },
  {
    year: "2024",
    title: "Frontend Engineer",
    org: "SalesMind AI",
    text: "Sole frontend engineer; team grew monthly revenue ~10x",
    dot: "#111",
  },
  {
    year: "2025",
    title: "Google TH.AI Top 12",
    org: "Google Thailand",
    text: "Built the Adaptive Microsite: prospect briefs auto-generated from LinkedIn",
    dot: "#111",
  },
  {
    year: "2025",
    title: "Freelance Backend & SEO",
    org: "Nestopa, Craft Story, Easy Deal",
    text: "Automated SEO publishing; full backends with auth, roles, AI services",
    dot: "#111",
  },
  {
    year: "now",
    title: "Technical PM",
    org: "SalesMind AI",
    text: "Company-based lead search; owns day-to-day product decisions",
    dot: "#fcfcfb",
  },
];
