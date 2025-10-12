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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(88,166,255,0.24),transparent_60%),radial-gradient(circle_at_78%_12%,rgba(88,166,255,0.16),transparent_50%)]">
      <div className="absolute inset-0 opacity-[0.22] blur-3xl bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.38),transparent_60%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgba(10,12,20,0.9)] via-transparent to-transparent" aria-hidden />
      <div className="relative z-10 flex min-h-screen w-full flex-col px-4 pb-24 pt-6 sm:px-10 lg:px-16">
        <section className="flex flex-1 flex-col gap-8">
          <div className="flex flex-1 flex-col">
            <ToolWorkspace />
          </div>
        </section>

        <section className="mt-24 flex flex-col gap-20">
          <div className="mx-auto w-full max-w-4xl text-center px-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)]/40 bg-[rgba(10,12,20,0.7)] px-5 py-1.5 text-xs uppercase tracking-[0.45em] text-[var(--foreground-muted)] shadow-[0_10px_40px_-30px_var(--glow)]">
              frictionless utility
            </span>
            <h1 className="mt-8 text-balance text-4xl font-semibold leading-[1.08] text-[var(--foreground)] sm:text-5xl lg:text-[56px]">
              The web-native toolbox that feels like your favorite native app.
            </h1>
            <p className="mt-6 text-lg text-[var(--foreground-muted)] sm:text-xl">
              50+ daily-driver utilities, instant load, beautiful ergonomics, and zero data ever leaving your browser. Built for developers who care about craft.
            </p>
          </div>

          <div className="mx-auto w-full max-w-5xl">
            <div className="grid gap-8 border-t border-[var(--surface-border)]/50 pt-14 sm:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="relative rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.72)] p-8 shadow-[0_30px_120px_-70px_var(--glow)] transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_35px_140px_-70px_var(--glow)]"
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(88,166,255,0.4)] to-transparent" aria-hidden />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {principle.title}
                </h2>
                <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                  {principle.description}
                </p>
              </div>
            ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl text-center px-4">
            <h2 className="text-3xl font-semibold text-[var(--foreground)] sm:text-[34px]">
              Built for velocity, respected for craft.
            </h2>
            <p className="mt-4 text-sm text-[var(--foreground-muted)] sm:text-base">
              devtools.io is an independent, principle-driven alternative to ad-supported utilities. We're shipping polish on day one and iterating with community feedback.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.32em] text-[var(--foreground-muted)]">
              <span className="rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] px-4 py-2 shadow-[0_20px_60px_-40px_var(--glow)]">
                Client-side privacy
              </span>
              <span className="rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] px-4 py-2 shadow-[0_20px_60px_-40px_var(--glow)]">
                Keyboard-native UX
              </span>
              <span className="rounded-full border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.7)] px-4 py-2 shadow-[0_20px_60px_-40px_var(--glow)]">
                Crafted in the open
              </span>
            </div>
          </div>
        </section>

        <footer className="mt-20 flex flex-col gap-4 border-t border-[var(--surface-border)]/60 py-8 text-xs text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between">
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
