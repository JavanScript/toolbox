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
      <div className="relative z-10 flex min-h-screen w-full flex-col px-0 pb-20 pt-0 sm:px-10 lg:px-0">
        <section className="flex flex-1 flex-col gap-0">
          <div className="flex flex-1 flex-col">
            <ToolWorkspace />
          </div>
        </section>

        <section className="mt-20 flex flex-col gap-16">
          <div className="mx-auto w-full max-w-3xl text-center px-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)]/60 bg-[var(--background-subtle)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--foreground-muted)]">
              frictionless utility
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              The web-native toolbox that feels like your favorite native app.
            </h1>
            <p className="mt-4 text-lg text-[var(--foreground-muted)]">
              50+ daily-driver utilities, instant load, beautiful ergonomics, and zero data ever leaving your browser. Built for developers who care about craft.
            </p>
          </div>

          <div className="grid gap-6 border-t border-[var(--surface-border)]/60 pt-12 sm:grid-cols-3">
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
          </div>

          <div className="mx-auto w-full max-w-3xl text-center px-4">
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
          </div>
        </section>

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
