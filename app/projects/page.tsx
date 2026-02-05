import Link from "next/link";
import Image from "next/image";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Projects | Saw Zwe Wai Yan",
  description:
    "A collection of projects showcasing full-stack development, machine learning, and mobile applications.",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight text-foreground hover:text-muted transition-colors"
          >
            ← Back
          </Link>
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            <Link
              href={siteConfig.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        <section className="mx-auto max-w-5xl px-6 lg:px-8 pt-20 pb-12 sm:pt-24">
          <h1 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            All Projects
          </h1>
          <p className="mt-4 text-base text-muted max-w-2xl">
            A collection of work spanning full-stack development, machine
            learning, and mobile applications.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={project.href ?? "#"}
                className="group"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-neutral-900 mb-4">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground group-hover:text-muted transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{project.role}</p>
                  {project.description && (
                    <p className="mt-2 text-sm text-muted/80 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs text-muted/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
