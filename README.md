# Portfolio 2026

A minimal, production-ready portfolio site for a software developer and product manager. Built with Next.js and Tailwind CSS, optimized for [Vercel](https://vercel.com) deployment.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. **Configure your content**

   - **Links and copy:** Edit `lib/site-config.ts` — add your name, intro headline and tagline, LinkedIn URL, resume URL, contact email, and version.
   - **Projects:** Edit `lib/projects.ts` — replace the placeholder projects with your own (title, role, period, optional `href`, and `gradient`).

4. **Deploy to Vercel**

   - Push this repo to GitHub (or connect your Git provider in Vercel).
   - In [Vercel](https://vercel.com), click **Add New Project** and import this repository.
   - Vercel will detect Next.js; leave build settings as default and deploy.

   Or use the CLI:

   ```bash
   npx vercel
   ```

## Project structure

- `app/` — Next.js App Router: `layout.tsx`, `page.tsx`, `globals.css`
- `lib/site-config.ts` — Site-wide copy and links (name, intro, LinkedIn, resume, version, contact)
- `lib/projects.ts` — Project list for the showcase grid
- `tailwind.config.ts` — Theme (colors, animations); palette is limited to 3 colors + gradients

## Design

- **Colors:** Dark background (`#0f0f0f`), light text (`#f5f5f5`), muted text (`#a3a3a3`), and a single accent with gradients (indigo family). No more than three base colors; gradients are accent-based.
- **Layout:** Single-page: header (name + LinkedIn/Resume) → intro → project grid → footer (contact CTA + version).
- **Inspiration:** Layout and typography are inspired by [rocky.framer.website](https://rocky.framer.website/).

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Run production build locally
- `npm run lint` — Run ESLint
