import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { projects } from "@/lib/projects";
import { companies } from "@/lib/companies";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight text-foreground hover:text-muted transition-colors"
          >
            {siteConfig.name}
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
            <Link
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              CV
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
        {/* Intro */}
        <section className="mx-auto max-w-5xl px-6 lg:px-8 pt-24 pb-12 sm:pt-32 sm:pb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl animate-fade-in-up opacity-0 [animation-fill-mode:forwards]">
              {siteConfig.introHeadline}
            </h1>
            <p className="mt-5 text-base leading-7 text-muted animate-fade-in-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards]">
              {siteConfig.introTagline}
            </p>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="mx-auto max-w-5xl px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-medium tracking-wide uppercase text-muted">
              Featured Work
            </h2>
            <Link
              href="/projects"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              View all projects →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects
              .filter((p) => p.featured)
              .map((project, i) => (
                <Link
                  key={project.id}
                  href={project.href ?? "#"}
                  className="group animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                  style={
                    {
                      animationDelay: `${150 + i * 80}ms`,
                    } as React.CSSProperties
                  }
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.stack.slice(0, 3).map((tech) => (
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

        {/* Companies */}
        <section className="mx-auto max-w-5xl px-6 lg:px-8 py-12 sm:py-16 border-t border-neutral-800">
          <h2 className="text-sm font-medium tracking-wide uppercase text-muted mb-8">
            Experience
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {companies.map((company, i) => (
              <div
                key={i}
                className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                style={
                  { animationDelay: `${300 + i * 80}ms` } as React.CSSProperties
                }
              >
                <h3 className="text-base font-medium text-foreground">
                  {company.name}
                </h3>
                {company.role && (
                  <p className="mt-1 text-sm text-muted">{company.role}</p>
                )}
                {company.period && (
                  <p className="mt-0.5 text-xs text-muted/60">
                    {company.period}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-5xl px-6 lg:px-8 py-20 sm:py-28 border-t border-neutral-800">
          <div className="text-center">
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-block animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            >
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground hover:text-muted transition-colors cursor-pointer">
                Get in touch 👋
              </h2>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-5xl px-6 lg:px-8 py-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted/60">
              © 2026 {siteConfig.name}. All rights reserved.
            </p>
            <span className="text-xs text-muted/60">{siteConfig.version}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
