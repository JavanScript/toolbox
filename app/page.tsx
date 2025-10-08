import { GlobalSearch } from "@/components/global-search";
import { ToolWorkspace } from "@/components/tool-workspace";

const principles = [
  {
    title: "Uncompromising design",
    description:
      "A dark-first system UI that feels native, with purposeful typography, layered depth, and delightful micro-interactions.",
  },
  {
    title: "Instant performance",
    description:
      "Every tool ships client-side, code-split, and optimized for zero network round-trips so actions feel instantaneous.",
  },
  {
    title: "Absolute privacy",
    description:
      "Your data never leaves the browser. Local storage persistence lets you pick up where you left off with full trust.",
  },
];


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(88,166,255,0.2),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(88,166,255,0.12),transparent_45%)]">
      <div className="absolute inset-0 opacity-[0.18] blur-3xl bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.35),transparent_55%)]" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10 sm:px-10 lg:px-14">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(88,166,255,0.12)] text-base font-semibold text-[var(--accent)]">
              d·
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--foreground-muted)]">
                devtools.io
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">
                Frictionless developer utilities
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <GlobalSearch />
            <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
              <span className="hidden items-center gap-2 rounded-full border border-[var(--surface-border)]/60 px-3 py-1.5 xl:inline-flex">
                <svg
                  aria-hidden
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-[var(--accent)]"
                >
                  <path
                    d="M9.333 5.333H6.667V2.667a.667.667 0 0 0-1.334 0v2.666H2.667a.667.667 0 0 0 0 1.334h2.666v2.666a.667.667 0 0 0 1.334 0V6.667h2.666a.667.667 0 0 0 0-1.334Z"
                    fill="currentColor"
                  />
                </svg>
                Roadmap first 50 tools
              </span>
              <button className="rounded-full border border-[var(--surface-border)]/70 bg-[rgba(255,255,255,0.05)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]">
                Join early access
              </button>
            </div>
          </div>
        </header>

        <main className="mt-12 flex flex-col gap-16">
          <section className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--foreground-muted)]">
              frictionless utility
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              The web-native toolbox that feels like your favorite native app.
            </h1>
            <p className="mt-4 text-lg text-[var(--foreground-muted)]">
              50+ daily-driver utilities, instant load, beautiful ergonomics, and zero data ever leaving your browser. Built for developers who care about craft.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--foreground-muted)]">
              <button className="rounded-full border border-[var(--accent)]/80 bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-[#0b0d12] transition hover:bg-[#6baeff]">
                Request invite
              </button>
              <button className="rounded-full border border-[var(--surface-border)]/70 bg-[var(--background-subtle)] px-6 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:border-[var(--accent)]/60 hover:text-[var(--foreground)]">
                View roadmap
              </button>
            </div>
          </section>

          <section className="relative rounded-[40px] border border-[var(--surface-border)]/80 bg-[rgba(10,12,20,0.72)] p-4 shadow-[0_40px_120px_-60px_var(--glow)]">
            <div className="pointer-events-none absolute inset-0 rounded-[40px] border border-[var(--accent)]/10" aria-hidden />
            <div className="relative">
              <ToolWorkspace />
            </div>
          </section>

          <section className="grid gap-6 border-t border-[var(--surface-border)]/60 pt-12 sm:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-3xl border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] p-8 transition hover:border-[var(--accent)]/60 hover:shadow-[0_30px_60px_-30px_var(--glow)]"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {principle.title}
                </h2>
                <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                  {principle.description}
                </p>
              </div>
            ))}
          </section>

          <section className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">
              Built for velocity, respected for craft.
            </h2>
            <p className="mt-4 text-sm text-[var(--foreground-muted)]">
              devtools.io is an independent, principle-driven alternative to ad-supported utilities. We're shipping polish on day one and iterating with community feedback.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
              <span className="rounded-full border border-[var(--surface-border)]/60 px-4 py-2">
                Client-side privacy
              </span>
              <span className="rounded-full border border-[var(--surface-border)]/60 px-4 py-2">
                Keyboard-native UX
              </span>
              <span className="rounded-full border border-[var(--surface-border)]/60 px-4 py-2">
                Crafted in the open
              </span>
            </div>
          </section>
        </main>

        <footer className="mt-16 flex flex-col gap-4 border-t border-[var(--surface-border)]/60 py-6 text-xs text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} devtools.io — crafted for the modern web developer.
          </p>
          <div className="flex gap-6">
            <a className="transition hover:text-[var(--foreground)]" href="#">
              Privacy promise
            </a>
            <a className="transition hover:text-[var(--foreground)]" href="#">
              Accessibility
            </a>
            <a className="transition hover:text-[var(--foreground)]" href="#">
              Design system
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
