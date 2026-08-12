# Parrhesia theme direction: "The Observatory" (2026-08-12)

New landing page (`/` for logged-out visitors) + the theming direction meant to
eventually unify the whole app. Goal: one look that reads as **magic/space to a
9-year-old** and **high-tech/serious to an adult** — without splitting into a
"kids mode" and an "adult mode".

## The idea

The product's core object — the skill tree — IS the brand. Render knowledge as
a **constellation**: star-nodes joined by filaments of light against deep
indigo space. Kids parse it as wonder; adults parse it as a network/tech
visualization. Mastery = a node turning **gold**. That one metaphor drives the
art, the copy ("light your first star"), and eventually the tree view itself.

What we deliberately avoid:
- **Kiddie pastel/cartoon** — talks down to adults, and kids don't need it.
- **Grim hacker-terminal dark mode** — reads hostile to parents/teachers.
- **RFab's anime/Neko Voss style** — wrong brand (same rule as Hard EA).

## Tokens (scoped to `.landing` for now)

| Token | Value | Role |
|---|---|---|
| `--ci-space` | `#0d1030` | deep-space background (hero, final CTA) |
| `--ci-space-2` | `#191650` | secondary space tone |
| `--ci-purple` | `#5f31dd` | primary (kept from existing theme) |
| `--ci-purple-soft` | `#7c5cf0` | hover/gradient partner |
| `--ci-cyan` | `#45d8e2` | "live knowledge" glow accent |
| `--ci-gold` | `#ffc857` | mastery/achievement |
| `--ci-paper` | `#faf9ff` | warm-white content background |
| `--ci-ink` / `--ci-ink-soft` | `#221c3f` / `#4c4570` | text |

Existing lime `#c6e76c` stays reserved for progress/success states; the
crimson gear logo `#c2242e` stays the mark. Type stays Poppins (900 display).
Content sections are **light** (classroom readability, accessibility); dark
space is used as *bands* (hero, final CTA), not as the whole page.

## Generated art pipeline

`scripts/_gen_landing_assets.js` — RFab image API (`RFAB_API_KEY` env,
`openai:gpt-image-2` stills, `gemini:gemini-omni-flash-preview` i2v for the
hero ambient loop, ffmpeg ping-pong for seamless looping). Raw generations are
cached in `scripts/_landing_raw/` (git-ignored candidates); outputs land in
`public/images/landing/` as webp + mp4. Delete a raw to force regen. House
style string lives in the script — painterly-3D animated-feature look, **no
text in images**, no anime.

## What shipped where

- `src/components/pages/LandingView.vue` — hero (video bg + poster,
  reduced-motion honored), how-it-works, 3 feature rows, audience band,
  final CTA. Reveal-on-scroll via IntersectionObserver.
- `src/router/index.js` — `/` is now `home` (landing) for logged-out users;
  logged-in users bounce to skill-tree/search as before; `home` added to the
  guest allowlist.
- `src/App.vue` — `home` + `student-signup` added to the fixed-top navbar
  routes so the hero runs full-bleed under the nav.
- `src/components/pages/SignUpStudentAccountView.vue` — restyled to the
  Observatory look (reuses the landing hero video/still as backdrop; <800px
  gets the still, not the 4MB mp4), staged entrance animations
  (reduced-motion safe). The tutorial/role popup no longer auto-opens:
  the video is behind a "Watch the 2-minute intro" button (Collins, Aug 12),
  and the instructor path is an inline "Teaching a class?" link.

## Next steps (not done)

- Extend tokens app-wide (App.vue `:root`) once the landing look is approved.
- Skill-tree view: adopt constellation styling (gold mastered nodes already
  matches the metaphor).
- OG/social image for parrhesia.io from the hero art.
