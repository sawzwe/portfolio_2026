// sawmill/timeline.ts
// Single source of truth for the plank labels in the sawmill hero.
//
// Order matters: index 0 is the current role, i.e. the log segment under the
// saw at the top of the page. The rest are past entries, newest first; each
// scroll step cuts the next one and stacks its plank. The log carries one
// extra blank segment after these ("what's next"); the waiting log on the
// second conveyor stands for the same idea.

export interface TimelineEntry {
  id: string;
  title: string;
  year: string;
  org: string;
  detail: string;
}

export const TIMELINE: readonly TimelineEntry[] = [
  {
    id: "salesmind-tpm",
    title: "Technical PM",
    year: "now",
    org: "SalesMind AI",
    detail: "Company-based lead search; owns day-to-day product decisions",
  },
  {
    id: "freelance-backend-seo",
    title: "Freelance Backend & SEO",
    year: "2025",
    org: "Nestopa, Craft Story, Easy Deal",
    detail: "Automated SEO publishing; full backends with auth, roles, AI services",
  },
  {
    id: "google-th-ai-top-12",
    title: "Google TH.AI Top 12",
    year: "2025",
    org: "Google Thailand",
    detail: "Built the Adaptive Microsite: prospect briefs auto-generated from LinkedIn",
  },
  {
    id: "salesmind-frontend",
    title: "Frontend Engineer",
    year: "2024",
    org: "SalesMind AI",
    detail: "Sole frontend engineer; team grew monthly revenue ~10x",
  },
  {
    id: "ps-park-apartment",
    title: "PS Park Apartment",
    year: "2024",
    org: "Project",
    detail: "Electron app replacing a 20+ year old system; admin work cut 70%",
  },
  {
    id: "house-of-griffin",
    title: "House of Griffin",
    year: "2023",
    org: "Project",
    detail: "Digitized a paper school system for 5 stakeholders",
  },
  {
    id: "bsc-computer-science",
    title: "B.Sc. Computer Science",
    year: "2020–24",
    org: "Assumption University",
    detail: "Magna Cum Laude",
  },
];

/** Caption for the blank last slice, shown once every entry is stacked. */
export const NEXT_ENTRY: TimelineEntry = {
  id: "next",
  title: "What's next",
  year: "",
  org: "",
  detail: "The last slice of the log is still blank.",
};

/** One log slice per entry, plus the blank "next" slice at the back. */
export const LOG_SEGMENT_COUNT = TIMELINE.length + 1;
