# Meeting Bingo

A single-page, browser-only React app that turns meetings into bingo. Pick a buzzword
category, get a randomized 5×5 card, and squares auto-fill when buzzwords are detected via the
browser's Web Speech API. Manual tap is always available. Five in a row → confetti + a shareable
result. Zero backend; deploys as a static site.

**Live:** https://meeting-bingo-jade.vercel.app

## Features

- Three buzzword packs: **Agile & Scrum**, **Corporate Speak**, **Tech & Engineering**.
- 5×5 card with a free center; auto-fill via speech, plus always-on manual tap.
- Bingo on any of the 12 lines (5 rows + 5 columns + 2 diagonals) → confetti + win stats.
- Share your result (native share sheet on mobile, clipboard otherwise) including a play link.
- In-progress games persist across reloads (localStorage).
- Accessible: keyboard-operable squares, `aria-live` announcements, and `prefers-reduced-motion`
  support. Win cue isn't color-only.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3.3.5 · Web Speech API · `canvas-confetti`. State is
`useState` + `localStorage` (no router, no backend).

## Commands

```bash
npm install        # install dependencies
npm run dev        # vite dev server
npm run build      # tsc && vite build → dist/
npm run preview    # serve the production build
npm run lint       # eslint . --ext ts,tsx
npm run typecheck  # tsc --noEmit
npm run test       # vitest run (pure lib modules)
```

## Notes

- **Privacy:** the app does not record or store audio. Chrome/Safari Web Speech streams audio to a
  cloud recognizer, so we never claim "audio never leaves your device." Manual tap works everywhere.
- **Browser support:** speech auto-fill needs a working Web Speech API — use **Chrome, Edge, or
  Safari**. **Firefox** has no Web Speech API, and **Brave** ships the API but disables its speech
  backend; in both, the app detects this, hides the mic UI, shows a banner, and stays fully playable
  via **manual taps**.
- A microphone needs a secure context (HTTPS or `localhost`).

## Deploy (Vercel)

Deployed on Vercel (see the live link above). `vercel.json` is committed (static build, SPA rewrite,
`Permissions-Policy: microphone=(self)`). Deploy by importing the repo at vercel.com or running the
Vercel CLI:

```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

## Docs

Planning lives in `docs/` — `IMPLEMENTATION_PLAN.md` is the authoritative build spec (it tracks the
Linear project and supersedes the PRD/architecture/UXR docs where they conflict).
