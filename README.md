# Portfolio Hero Section - Nuxt 3

A production-ready Hero section for a portfolio site built with Nuxt 3, Tailwind CSS, and modern animations.

## Features

- **Modern Stack**: Nuxt 3, TypeScript, Tailwind CSS
- **Smooth Animations**: SVG path drawing, staggered text animations
- **Accessibility**: ARIA labels, keyboard navigation, reduced motion support
- **Performance**: Intersection Observer, optimized animations
- **Responsive**: Mobile-first design with responsive typography

## Tech Stack

- **Framework**: Nuxt 3
- **Styling**: Tailwind CSS
- **Animations**: CSS animations with reduced motion support
- **TypeScript**: Full type safety
- **Data**: Local JSON file (`/data/site.json`)

## Project Structure

```
├── components/
│   ├── Hero.vue          # Main hero section component
│   └── Logo.vue          # SVG logo with path drawing animation
├── pages/
│   ├── index.vue         # Home page (renders Hero)
│   └── contact.vue       # Contact page placeholder
├── data/
│   └── site.json         # Portfolio content data
├── types/
│   └── site.ts           # TypeScript interfaces
└── assets/css/
    └── main.css          # Global styles and animations
```

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the Hero section.

## Customization

Edit `/data/site.json` to customize the portfolio content:

```json
{
  "name": "Your Name",
  "role": "Your Role",
  "taglines": ["Your taglines"],
  "socials": { "github": "...", "linkedin": "..." },
  "location": "Your Location",
  "availability": "Your availability status"
}
```

## Performance Features

- **Intersection Observer**: Animations only trigger when in view
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Optimized Animations**: Only `transform` and `opacity` properties
- **Fast Page Transitions**: Under 450ms with simple fade/slide

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Focus indicators for interactive elements
- Screen reader friendly content structure
- Reduced motion support for users with vestibular disorders

## Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```
