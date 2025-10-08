# devtools.io · Strategy-led prototype

devtools.io is a web-native toolbox for developers who expect native-app polish with web reach. This prototype translates the **"Frictionless Utility"** strategy into a working playground: live utilities, a global command surface, and a layout that keeps the tool workspace front-and-center.

## 🔁 Quick start

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the experience. Edit `app/page.tsx` or the supporting styles in `app/globals.css` and the page will live-reload.

## ✨ Experience highlights

- **Dark-first visual language** with layered surfaces, desaturated accents, and purposeful typography.
- **Global omni-search** fixed in the header, piping into the command palette and the workspace's live filter.
- **Interactive tool workspace** featuring JSON Formatter, Base64 Encoder/Decoder, and Timestamp Converter with persistent state, copy-first ergonomics, toast feedback, and responsive layout.
- **Principles spotlight** reinforcing the strategic differentiators (design, performance, privacy) without overwhelming the hero narrative.
- **Future-facing roadmap context** kept lightweight so the real tools remain the primary focus.

## 🧭 Product principles

The implementation is guided by the strategic doc in `Devtools.io Strategy and Design.md` and centers on three non-negotiables:

1. **Uncompromising design & UX** – zero onboarding friction, no intrusive banners, and copy-paste-centric flows.
2. **Instantaneous performance** – a client-side architecture with background code-splitting and offline readiness.
3. **Absolute privacy & trust** – all processing stays inside the browser with localStorage persistence for state.

## 🧩 Project structure

- `app/layout.tsx` – Metadata, font wiring, and global HTML scaffolding.
- `app/page.tsx` – Slim landing page that centers the live workspace, hero story, principles, and supporting CTAs.
- `app/globals.css` – Dark theme tokens, typography rules, and global resets tuned to the design language.
- `components/tool-workspace.tsx` – Command palette-integrated workspace with category tags, search, and active tool host.
- `components/tools/` – Actual tool implementations for JSON formatting, Base64 conversion, and timestamps.
- `components/global-search.tsx` – Persistent top-level omnibox dispatching events into the workspace/palette.
- `components/toast-provider.tsx` – Lightweight toast system used by copy buttons and tool actions.
- `public/` – Placeholder assets; swap or extend for future OG images and favicons.

## 🛣️ MVP toolset summary

| Category | Tools |
| --- | --- |
| Converters | JSON ↔ YAML, JSON ↔ CSV, cURL → Code, HTML ↔ Markdown, etc. |
| Generators | UUID/ULID, Fake data, CSS gradients, Passwords, QR codes |
| Formatters & Validators | JSON validator, Regex tester, Cron parser, SQL/XML/HTML formatters |
| Text Manipulation | Case converter, Diff checker, Slugify, Line tools |
| Color Utilities | Picker, Palette generator, Contrast checker, Shades/Tints |
| Image & Media | Image ↔ Base64, SVG optimizer |
| Web & Network | JWT debugger, User-agent parser, URL encoder/decoder |
| Hashing & Encoding | SHA-256 generator, Base64 encoder/decoder |

## 🚀 Next steps

- Expand the tool catalog (e.g., YAML ↔ JSON, JWT debugger, color palette tools) using the established workspace patterns.
- Wire additional keyboard shortcuts (⌘/Ctrl + Enter to run, history cycling, quick clearing) into the shared infrastructure.
- Enhance analytics-free insights (recent tools, pinned favorites) using the existing local storage hook.
- Produce a polished OG image and replace placeholder links with operational resources.

## 🧪 Tooling

- [Next.js App Router](https://nextjs.org/docs/app) with TypeScript
- Tailwind CSS (v4) via `@tailwindcss/postcss`
- Geist Sans + Geist Mono (system UI plus monospaced) via `next/font`

Contributions, design feedback, and strategy critiques are welcome as we evolve the prototype into the full devtools.io experience.
