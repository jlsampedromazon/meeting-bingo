# Meeting Bingo

A single-page, browser-only React app that turns meetings into bingo. Pick a buzzword
category, get a randomized 5×5 card, and squares auto-fill when buzzwords are detected via the
browser's Web Speech API. Manual tap is always available. Five in a row → confetti + a shareable
result. Zero backend; deploys as a static site.

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
- **Browser support:** speech auto-fill needs the Web Speech API (Chrome/Edge/Safari). On Firefox the
  mic UI is hidden and the game stays fully playable via manual taps.
- A microphone needs a secure context (HTTPS or `localhost`).

## Deploy (Vercel)

`vercel.json` is committed (static build, SPA rewrite, `Permissions-Policy: microphone=(self)`).
Deploy by importing the repo at vercel.com or running the Vercel CLI:

```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

## Docs

Planning lives in `docs/` — `IMPLEMENTATION_PLAN.md` is the authoritative build spec (it tracks the
Linear project and supersedes the PRD/architecture/UXR docs where they conflict).
</content>
