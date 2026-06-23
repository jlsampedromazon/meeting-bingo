# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state: MVP built (Phases 0–3 complete)

The app is implemented under `src/` and the toolchain is scaffolded (`package.json`, Vite, Tailwind
3.3.5, Vitest, ESLint). All four build phases from `docs/IMPLEMENTATION_PLAN.md` are done and tracked
in the Linear project "Meeting Bingo (MVP)" (issues JOS-5…JOS-22). The one remaining step is the
actual Vercel deploy (JOS-22), which needs the maintainer's Vercel account — `vercel.json` is ready.

`docs/IMPLEMENTATION_PLAN.md` remains the authoritative spec and supersedes the PRD/architecture/UXR
docs wherever they conflict. Stack pinned to the plan: React 18, Vite 5, Tailwind 3.3.5 (exact),
eslint-based lint, `tsc --noEmit` typecheck (current `create-vite` defaults to React 19 / Vite 8 /
oxlint — intentionally not used).

Source docs, in order of authority:
- `docs/IMPLEMENTATION_PLAN.md` — **start here.** Build phases, scope decisions, and a `## Review
  Summary` table of fixes applied during a VP-level review. Its §8 ("Gaps & decisions") resolves the
  contradictions found across the other three docs.
- `docs/meeting-bingo-prd.md` — product requirements, P0/P1/P2 scope, acceptance criteria.
- `docs/meeting-bingo-architecture.md` — file structure, core algorithms, and sample code. ⚠️ Has
  known internal inconsistencies (see "Watch out for" below); trust the implementation plan over it.
- `docs/meeting-bingo-uxr.md` — UX research; richer than MVP scope. The plan deliberately defers its
  *scope* features but keeps its *UX-detailing of in-scope P0* (permission priming, listening
  indicator, detection toast, always-on manual tap).

## What it is

Meeting Bingo: a single-page, **browser-only, zero-backend** React app. Players pick a buzzword
category, get a randomized 5×5 bingo card, and squares auto-fill when buzzwords are detected via the
browser's Web Speech API (manual tap is an always-available fallback). 5-in-a-row → confetti + a
shareable result. Everything runs client-side; deploys as a static site to Vercel.

## Commands (only valid after Phase 0 scaffolding)

These come from the architecture doc's planned `package.json` and won't work until the app is
scaffolded per `IMPLEMENTATION_PLAN.md` §5 Phase 0:

```bash
npm run dev        # vite dev server
npm run build      # tsc && vite build  → dist/
npm run preview    # serve the production build
npm run lint       # eslint . --ext ts,tsx
npm run typecheck  # tsc --noEmit
```

The plan also adds **Vitest** as a devDep for the three pure `lib/` modules
(`cardGenerator`, `bingoChecker`, `wordDetector`) — run a single test file with
`npx vitest run src/lib/<name>.test.ts`.

**Scaffold pin to respect:** Tailwind must be `tailwindcss@3.3.5` **exactly** (not `^3.3` — the
caret floats to v4-adjacent 3.4, which has a different, incompatible setup). Also install
`clsx` + `tailwind-merge` (they back `lib/utils.ts`'s `cn()`).

## Architecture (big picture)

- **No backend, no state library, no router.** State is `useState` + `localStorage` (a single
  `useGame` hook; Context is optional and likely unnecessary at this size). "Routing" is a
  screen-state switch in `App.tsx`: landing → category → game → win.
- **Build order is bottom-up** and load-bearing: `lib/utils.ts` (`cn`) → `types` → `data` → other
  `lib/` (pure functions) → `hooks` → `components` → `App`. `cn()` must exist first or Phase-1
  components won't compile.
- **The three pure `lib/` modules are the correctness core** and the only things worth unit-testing:
  `cardGenerator` (Fisher-Yates → 24 words + center FREE), `bingoChecker` (12 lines: 5 rows + 5 cols
  + 2 diagonals; absorbs what the arch doc calls `useBingoDetection`), `wordDetector` (word-boundary
  regex for single words, substring for phrases, plus an alias map).
- **Speech flow:** `useSpeechRecognition` (feature-detect, expose `isSupported`, continuous with a
  *guarded* auto-restart) fires an `onResult(chunk)` callback. Run `detectWords` on the **new chunk**,
  not the accumulated transcript, then auto-fill + toast + announce via `aria-live`.

## Watch out for (failure modes the docs/review surfaced)

- **Privacy claim is false as originally written.** Web Speech API on Chrome/Safari streams audio to
  a **cloud** service — it is *not* on-device. Never ship "audio never leaves the device / never sent
  to a server." Honest framing only: "we don't record or store audio." See IMPLEMENTATION_PLAN §8.7.
- **Auto-restart can spin a denied mic.** The arch doc's `useSpeechRecognition` restarts on `onend`
  via a stale closure; gate it behind a `wantListening` ref + error flag + backoff, and never restart
  after `not-allowed`/`service-not-allowed`.
- **Manual tap is P0 and always-on** (to correct ~80%-accuracy misses), not just a no-API fallback.
  When Speech is unsupported (Firefox), hide only the mic UI and show a persistent banner.
- **Persist timestamps as epoch `number`s**, not `Date` — `JSON.stringify` round-trips break
  time-to-bingo math.
- **Arch doc inconsistencies:** it prescribes a `GameContext` but its own `App.tsx` uses `useState`;
  it names `useGame`/`useLocalStorage`/`useBingoDetection` and `lib/utils.ts` but never implements
  them. The plan resolves all of these — follow the plan.
- **Accessibility is in-scope:** squares are focusable `<button>`s (Enter/Space), auto-fill/BINGO use
  ARIA live regions, and confetti/fill animations respect `prefers-reduced-motion`.

## Repo conventions

- `.claude/settings.local.json` is intentionally git-ignored (per-machine local config). The vendored
  `.claude/skills/plan-review-skill/` is committed and is what produced the IMPLEMENTATION_PLAN review.
