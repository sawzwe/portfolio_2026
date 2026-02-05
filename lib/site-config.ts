/**
 * Site configuration — update these values for your portfolio.
 */

export const siteConfig = {
  /** Your name as shown in the header */
  name: "Saw Zwe Wai Yan",

  /** Short intro headline (e.g. "i'm rocky 👋") */
  introHeadline: "i'm saw",

  /** Tagline highlighting dual expertise (software dev + product) */
  introTagline:
    "product manager & software engineer building scalable web applications with Next.js, React, and modern cloud infrastructure.",

  /** LinkedIn profile URL */
  linkedInUrl: "https://www.linkedin.com/in/saw-zwe/",

  /** Resume / CV URL (e.g. Google Drive, Notion, or hosted PDF) */
  resumeUrl: "#",

  /** Footer version string (e.g. "v1.0.0" or "2026.1") */
  version: "2026.1",

  /** Optional: contact CTA text */
  contactCta: "get in touch",

  /** Email for "get in touch" link (mailto:) */
  contactEmail: "sawzwewaiyan26@gmail.com",
} as const;

export type SiteConfig = typeof siteConfig;
