# Meeting Bingo — Implementation Plan

**Derived from**: `meeting-bingo-prd.md`, `meeting-bingo-architecture.md`, `meeting-bingo-uxr.md`
**Date**: 2026-06-23
**Status**: Plan only — no code written yet

---

## Review Summary

Reviewed 2026-06-23 by VP Product / VP Engineering / VP Design (plan-review skill). **Verdict: GO
WITH REVISIONS** — applied below. Highlights:

| # | Sev | Change applied |
|---|-----|----------------|
| C1 | Critical | Removed the false "audio never leaves device" guarantee; documented Web Speech as cloud-based (§1, §8.7); flagged privacy copy for review |
| C2 | Critical | Wired the PRD-required detection **Toast** + fill animation into Phase 2.3 + DoD |
| C3 | Critical | Added `MicPermissionGate` with honest pre-prompt trust copy (UXR intent, corrected per C1) before the browser prompt (Phase 2.4) |
| C4 | Critical | `lib/utils.ts` `cn()` now built **first** in Phase 1.1 (was a compile-breaker) |
| C5 | Critical | Accessibility throughout: `<button>` squares + keyboard, aria-live regions, `prefers-reduced-motion`, non-color win cue |
| H1–H3 | High | Manual tap always-on; safe speech auto-restart (no denied-mic spin); Firefox unsupported banner |
| H4–H7 | High | Epoch-number timestamps; reframed §2 scope; specified listening states; non-color win highlight |
| M1–M8 | Medium | Verified word counts (48/47/46 vs 40/43/40) + ≥40 assertion; per-chunk detection; one-away counter; perf gates; phantom hooks resolved; alias `interface` dropped; New-Card confirm; discreet celebration |
| L1–L5 | Low | Scaffold direct to root; `vercel.json` headers; exact dep pins + Vitest; play URL in share text; chunk-based detection note |

Full findings and rationale: `~/.claude/plans/lazy-booping-shamir.md`.

---

## 1. What we're building

A single-page, browser-only React app that turns meetings into bingo. Players pick a buzzword
category, get a randomized 5×5 card, and squares auto-fill when buzzwords are detected via the
browser's Web Speech API. Manual tap is the fallback. On 5-in-a-row → confetti + shareable result.

**Hard constraints (from docs):**
- Zero backend, zero paid services. Everything runs client-side.
- The app does **not record or store** audio: transcript text is matched locally and discarded.
  ⚠️ Do **not** claim "audio never leaves the device" — Chrome/Safari `webkitSpeechRecognition`
  streams audio to a browser **cloud** recognition service. See §8.7; user-facing copy in §5 Phase 2.4.
- MVP target is small and self-contained (the docs frame it as a 90-min workshop build). ⚠️ Treat
  90 min as aspirational — the P0 UX items added by this review (toast, permission priming,
  accessibility, manual-tap-always-on) push it past that.

Manual tap is a **first-class, always-available** action (see §5 Phase 2), not just a no-Speech-API
fallback — players use it to correct the ~80% of words recognition misses (PRD US-3.1, P0).

## 2. Scope decision: follow the PRD, not the UXR

The UXR doc describes a richer vision (join-game, multiplayer, custom packs, leaderboards,
recurring links, server-side share images). **The PRD explicitly lists those as out of scope for
MVP.** This plan builds the PRD MVP. UXR-only **scope** features go in the backlog (§9).

**But** "follow the PRD not the UXR" applies only to *scope*. We **keep the UXR's UX-detailing of
in-scope P0 features** — several of those details are also PRD acceptance criteria and are cheap:
permission-trust copy, the live "Listening…" indicator, the detection toast, and an always-on
manual tap. Dropping them as "UXR vision" would fail PRD P0. These are folded into §5 below.

**In scope (MVP):** card generation, 3 category packs, free space, Web Speech transcription,
auto-fill, manual toggle, BINGO detection (12 lines), win celebration, share result, localStorage
persistence, mobile-responsive, dark mode (P2, droppable).

**Out of scope (MVP):** accounts, multiplayer/sync, custom buzzwords, any backend, sound effects,
history beyond current session, leaderboards, calendar.

## 3. Tech stack (locked by docs)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 18 + TypeScript | |
| Build | Vite 5 | `npm create vite@latest -- --template react-ts` |
| Styling | Tailwind CSS **3.3.5 (exact)** | ⚠️ pin exact, not `^3.3` — caret floats to 3.4. See §8.1 |
| Speech | Web Speech API | no dependency; `webkit` prefix for Safari |
| Animation | `canvas-confetti@^1.9.2` | runtime dep besides React |
| Classnames | `clsx` (+ `tailwind-merge`) | powers `lib/utils.ts` `cn()` — see §8.3 / Phase 1.1 |
| State | `useState` + `localStorage` | Context optional — see §8.2 |
| Testing | Vitest (devDep) | unit-test the 3 pure `lib/` modules — see §7 |
| Deploy | Vercel (static) | `dist/` output; add `vercel.json` headers — see §5 Phase 3 |

Local toolchain confirmed: Node v24.14.0, npm 11.9.0 — compatible.

## 4. Target file structure

Per architecture doc (§Project Structure). Build order is bottom-up: types → data → lib → hooks →
components → App.

```
src/
  types/index.ts            # all interfaces (BingoSquare, BingoCard, GameState, WinningLine, ...)
  data/categories.ts        # 3 packs, ~48 words each (use architecture doc's lists — they're the
                            #   reconciled版本; PRD lists are slightly shorter)
  lib/
    cardGenerator.ts        # Fisher-Yates shuffle, pick 24 + center free space
    bingoChecker.ts         # checkForBingo, countFilled, getClosestToWin
    wordDetector.ts         # detectWords (word-boundary regex + phrase substring) + aliases
    shareUtils.ts           # clipboard + navigator.share text summary (incl. play URL)
    utils.ts                # cn() classnames helper (clsx + tailwind-merge) — BUILD FIRST, Phase 1.1
  hooks/
    useSpeechRecognition.ts # Web Speech wrapper; continuous; SAFE auto-restart (wantListening
                            #   ref + error flag + backoff — must NOT spin-restart a denied mic, §8.8)
    useGame.ts              # game state + actions (toggle, autofill, win check) — implemented here,
                            #   not inherited from arch (arch left it undefined). useBingoDetection
                            #   is intentionally absorbed into lib/bingoChecker.ts — do not create it.
    useLocalStorage.ts      # persistence helper (epoch-number timestamps — see §8.9)
  components/
    LandingPage.tsx
    CategorySelect.tsx
    MicPermissionGate.tsx   # pre-prompt explainer w/ verbatim UXR privacy copy (§5 Phase 2.4)
    UnsupportedBanner.tsx   # persistent "speech unavailable, tap manually" banner (Firefox, §5 2.5)
    GameBoard.tsx           # header + card + transcript + controls
    BingoCard.tsx
    BingoSquare.tsx         # focusable <button>, Enter/Space activate (a11y, §5 Phase 1.3)
    TranscriptPanel.tsx     # live text + Listening/Paused/No-mic/Error status (§5 Phase 2.4)
    WinScreen.tsx
    GameControls.tsx
    ui/{Button,Card,Toast}.tsx   # Toast wired on each detection (PRD US-2.3, §5 Phase 2.3)
  App.tsx                   # screen routing: landing → category → game → win
  main.tsx
  index.css                 # tailwind directives
```

## 5. Build phases

**Tracked in Linear** — project [Meeting Bingo (MVP)](https://linear.app/jose-sampedro-mazon/project/meeting-bingo-mvp-f711741b62fb)
(start 2026-06-23, target 2026-07-03). Each phase is a milestone with target dates; issues carry
detailed acceptance criteria and `blockedBy` dependencies.

| Phase | Milestone target | Issues |
|-------|------------------|--------|
| Phase 0 — Scaffold | 2026-06-24 | JOS-5 |
| Phase 1 — Core game (no speech) | 2026-06-26 | JOS-6 · JOS-7 · JOS-8 · JOS-9 · JOS-10 |
| Phase 2 — Speech integration | 2026-06-30 | JOS-11 · JOS-12 · JOS-13 · JOS-14 · JOS-15 |
| Phase 3 — Polish, persistence & ship | 2026-07-03 | JOS-16 · JOS-17 · JOS-18 · JOS-19 · JOS-20 · JOS-21 (QA) · JOS-22 (deploy/DoD) |

### Phase 0 — Scaffold (~10 min)
1. `npm create vite@latest . -- --template react-ts` **directly in the repo root** (keep existing
   `README.md`/`docs/`/`.git`). If the CLI refuses a non-empty dir, scaffold to a temp dir and move
   the full set — `src/`, `index.html`, `package.json`, `tsconfig*.json`, `vite.config.ts`,
   `.eslintrc*`, `.gitignore` — not just `src/`.
2. `npm i canvas-confetti clsx tailwind-merge` ; `npm i -D tailwindcss@3.3.5 postcss autoprefixer vitest` ;
   `npx tailwindcss init -p` (exact Tailwind pin — `^3.3` floats into v4-adjacent 3.4; see §8.1).
3. Wire Tailwind directives into `index.css`; configure `content` globs.
4. **Gate:** `npm run dev` serves a blank styled page.

### Phase 1 — Core game, no speech (~30 min)
1. **`lib/utils.ts` `cn()` FIRST** (`clsx` + `tailwind-merge`) — it's imported by `BingoSquare`/
   `TranscriptPanel`; building it last breaks the Phase-1 compile.
2. `types/index.ts` (epoch-`number` timestamps, §8.9), `data/categories.ts`. Assert each pack has
   `>= 40` unique words after dedup (PRD US-1.2 "40+ unique per category") — fail loud, don't truncate.
3. `lib/cardGenerator.ts` + `lib/bingoChecker.ts` incl. `getClosestToWin` (pure — Vitest in isolation).
4. `BingoSquare` as a focusable `<button>` (Enter/Space toggles, visible focus ring; non-color fill
   cue, not only the green) → `BingoCard` → `GameBoard` (manual click toggles only). Wire
   `getClosestToWin` to an **X/24 filled counter + "one-away" line highlight** (PRD US-3.2).
5. `LandingPage` + `CategorySelect`; `App.tsx` screen routing.
6. Wire manual toggle → `checkForBingo` → `WinScreen` (static, no confetti yet). "New Card" /
   category re-pick **confirms before discarding** an in-progress card (PRD US-1.3, M7).
7. **Gate:** can play a full manual game and reach BINGO on any of the 12 lines, keyboard-only.

### Phase 2 — Speech integration (~25 min)
1. `hooks/useSpeechRecognition.ts` (feature-detect; expose `isSupported`). **Safe auto-restart:**
   gate `onend → start()` behind a `wantListening` ref + last-error flag + backoff so a denied/
   errored mic does **not** spin-restart (the arch sample's stale-closure restart will; §8.8).
2. `lib/wordDetector.ts` (word-boundary for single words, substring for phrases, alias map).
3. Run `detectWords` on the **new chunk** passed to `onResult(chunk)` — NOT the accumulated
   transcript string (avoids O(n) rescans + stale re-matches; §8.5). On each hit: mark `isAutoFilled`
   → play the <500 ms fill animation → **fire a Toast with the detected word** (PRD US-2.3) →
   announce via an `aria-live="polite"` region (BINGO uses `assertive`). Dedup against already-filled.
4. `MicPermissionGate` shown **before** the browser prompt. Keep the UXR's trust *intent* but use
   **honest** copy (the verbatim UXR line "processed locally… never sent to any server" is false for
   the cloud Web Speech API — §8.7). Recommended: *"Meeting Bingo listens for buzzwords using your
   browser's speech recognition. We don't record or store any audio — transcript text is matched and
   immediately discarded."* (Get final wording privacy-reviewed.) `TranscriptPanel` shows live text +
   detected chips + a discrete status: **Listening / Paused / No-mic / Error**, with a visible
   Stop/Start toggle.
5. Manual tap stays **always available** during speech play (correct misses). If `!isSupported`,
   hide only the mic UI and show the persistent `UnsupportedBanner` ("speech unavailable in this
   browser — tap squares manually"); game remains fully playable (Firefox).
6. **Gate:** speaking a card word fills its square < 500 ms and shows a toast; denied/absent mic does
   not spin-restart and degrades gracefully to manual with a visible banner.

1. `canvas-confetti` on win + highlight winning line. **Discreet by default** (UXR Principle 3): no
   sound, short/bounded burst, professional read. Guard confetti **and** the fill animation behind
   `prefers-reduced-motion` (skip/replace with an instant state). Win line uses a non-color cue too.
2. `WinScreen` stats (time-to-bingo, winning word, filled count, category).
3. `shareUtils.ts` — clipboard text summary + `navigator.share` on mobile. **Include the play URL**
   in the shared text so receivers can launch immediately (PRD US-4.3, viral loop).
4. `useLocalStorage` — persist in-progress game across reload. Store `startedAt`/`completedAt` as
   **epoch numbers** (not `Date`) so JSON round-trips don't break time-to-bingo math (§8.9).
5. Responsive pass + dark mode (P2, drop if short on time).
6. Add `vercel.json` headers (`Permissions-Policy: microphone=(self)`; secure-context — getUserMedia
   needs HTTPS).
7. **Gate:** end-to-end flow works; `npm run build` + `npm run typecheck` clean; perf spot-checks pass
   (landing TTI < 2 s, transcription starts < 1 s, auto-fill < 500 ms, detection accuracy ~70–80% on
   clear speech); deploy to Vercel.

## 6. Core algorithms (already specified in architecture doc — reuse as-is)
- **Card gen:** Fisher-Yates shuffle → first 24 words → 5×5 with center (2,2) = pre-filled FREE.
- **Win check:** 5 rows + 5 cols + 2 diagonals; return first complete line + its square IDs.
- **Detection:** normalize lowercase; single words via `\bword\b` regex (escaped); multi-word
  phrases via substring; skip already-filled; optional alias map (ci/cd, mvp, roi, devops).
  ⚠️ **Drop the arch's `api → ['interface']` alias** — it false-fires on unrelated speech and hurts
  the >70% precision target. Audit dotted aliases (`m.v.p.`) against `\b` (the dots break word
  boundaries) before trusting them.

## 7. Testing checklist (from PRD §9 / architecture)
- Card has 24 unique words + center free space; categories produce different cards.
- All 12 winning lines detected; free space counts toward its row/col/diagonal.
- Manual tap toggles on/off; same word spoken twice fills once.
- Mic permission prompt appears; transcript shows; compound words ("code review") detected.
- Graceful fallback when Speech API unavailable (Firefox, shows banner) or permission denied
  (no mic spin-restart loop).
- Detecting a word shows its **toast** (PRD US-2.3); auto-fill announced to screen readers (aria-live).
- Squares are keyboard-operable (Tab to focus, Enter/Space toggles); full game winnable keyboard-only.
- `prefers-reduced-motion` suppresses confetti + fill animation.
- Each category pack has ≥40 unique words after dedup (assert at module load, PRD US-1.2).
- Win stats correct; share copies expected content incl. play URL; mobile share sheet triggers.
- Tab-switch-and-return; mobile landscape.

Recommend adding lightweight unit tests (Vitest) for the three pure `lib/` modules even though the
docs don't require them — they're the correctness-critical core and trivial to test.

## 8. Gaps & decisions in the docs (resolve before/while coding)

1. **Tailwind version.** Docs pin v3.3.5 and use `npx tailwindcss init -p`. The current default
   `npm i tailwindcss` installs v4, which has a different setup (Vite plugin, no init). **Decision:
   pin `tailwindcss@3.3.5` exactly** (not `^3.3` — the caret floats to 3.4.x) to match the docs
   verbatim and avoid setup friction. Flag if you'd rather modernize to v4.
2. **State management.** Architecture lists a `context/GameContext.tsx` and `useGame`/
   `useBingoDetection` hooks, but the sample `App.tsx` uses plain `useState` and prop-drills. For an
   app this small, **plain `useState` + a single `useGame` hook is enough**; skip Context unless
   prop-drilling gets painful.
3. **`lib/utils.ts` (`cn`) is referenced but never defined.** ✅ Resolved: build it **first** in
   Phase 1.1 using `clsx` + `tailwind-merge`. (Compile-breaker if left for last — it's imported by
   `BingoSquare`/`TranscriptPanel`.)
4. **Category word lists differ between PRD and architecture docs.** Verified counts: architecture
   **48 / 47 / 46** (Agile/Corporate/Tech), PRD **40 / 43 / 40**. **Use the architecture doc's lists**
   (fuller) — but either set clears the 24-word card. ⚠️ PRD US-1.2 requires **40+ unique per
   category**, so assert `>= 40` after dedup (some near-duplicates exist). (Earlier prose claiming
   "PRD lists are slightly shorter / ~48 each" was imprecise — Corporate PRD is 43, not shorter.)
5. **Detection ordering risk:** the architecture's `useSpeechRecognition` appends finals into one
   growing `transcript` string; detection should run on each *new final chunk*, not the whole
   accumulated string, to avoid O(n) rescans and stale matches. Run `detectWords` on the chunk
   passed to the `onResult` callback.
6. **UXR vs PRD scope mismatch** (multiplayer/custom/join) — already resolved in §2: MVP follows PRD.
7. **⚠️ Web Speech API is NOT on-device (integrity).** Chrome/Safari `webkitSpeechRecognition`
   streams audio to a **cloud** recognition service (Google/Apple); only Firefox-class engines are
   local, and Firefox doesn't expose the API anyway. So the docs' "audio never leaves the device"
   guarantee is **false on every browser where the feature works.** User-facing copy must say only
   "this app does not record or store your audio" (true — we keep no recording). Get this privacy
   wording reviewed before any public/workshop use. (User-facing copy lives in §5 Phase 2.4.)
8. **Speech auto-restart safety.** The arch's `useSpeechRecognition` does `onend → start()` against a
   stale-closure `isListening`; on permission-deny or repeated errors it spin-restarts the mic. Gate
   restart behind a `wantListening` ref + last-error flag + backoff, and never restart after a
   `not-allowed`/`service-not-allowed` error.
9. **Timestamp serialization.** Persisting `Date` objects via `JSON.stringify` yields strings on
   reload, breaking time-to-bingo math. Store `startedAt`/`completedAt` as **epoch numbers**
   (the arch data model already uses numbers) — or add a load-time reviver.

## 9. Post-MVP backlog (from PRD §12 + UXR vision)
Custom buzzword packs · multiplayer sync (WebRTC / Firebase) · join-game links · leaderboards ·
achievement/streaks · more category packs (sales, board, client) · recurring game links · PWA ·
server-rendered share images · sound-effects toggle.

## 10. Definition of done (MVP)
- All PRD P0 acceptance criteria pass on Chrome; P1 (share, persistence, responsive) working.
- Detection **toast** fires (PRD US-2.3); pre-permission trust copy shown; no "audio never leaves
  device" claim anywhere in the UI (§8.7).
- Accessibility: squares keyboard-operable, auto-fill/BINGO announced via aria-live,
  `prefers-reduced-motion` honored; win cue not color-only.
- Perf spot-checks: landing TTI < 2 s, transcription starts < 1 s, auto-fill < 500 ms,
  detection accuracy ~70–80% on clear speech.
- Graceful degradation on Firefox (visible banner, manual play) / denied mic (no spin-restart).
- `npm run build` + `npm run typecheck` clean; Vitest passes for the 3 pure `lib/` modules.
- Deployed to a public Vercel URL (with `vercel.json` mic/secure-context headers).
