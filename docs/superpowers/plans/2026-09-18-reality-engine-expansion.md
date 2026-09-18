# Reality Engine Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build one coordinated Reality Engine that embeds Life Ledger, X-Ray, Reactive World, Trigger Fingerprint, Reality Receipt, Recovery Progress, Payday Shield, and 10,000-run learning into the existing Spin Out flow without redesigning the product.

**Architecture:** A pure Intervention Director arbitrates all foreground/ambient interventions. Existing profile/run data remains the source of truth; new analysis modules derive observations, while UI components render only the director’s selected output.

**Tech Stack:** Next.js, React, TypeScript, Phaser, Supabase, localStorage, Playwright, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-reality-engine-expansion-design.md`

## Global Constraints

- Preserve the current premium brown casino look, Chinese casino influence, artwork, liquid-glass navigation, game structure, sound direction, and current trial/subscription architecture.
- No separate pages for the eight features.
- `Run 10,000` is a secondary action built into every game.
- One foreground intervention at a time.
- “Do nothing” is a valid director decision.
- Payday Shield must not interrupt active gameplay.
- Recovery progress must never reward more/longer simulated gambling.
- All user-facing copy must be short, conversational, specific, calm, contraction-friendly, and free of em dashes, therapy language, motivational slogans, corporate RG language, and generic warnings.
- Personal financial/context data must stay out of URLs and analytics event payloads.
- The one-run Plus trial remains authoritative.

## Task 1 — Reality Engine Director

- [x] Add failing unit tests for priority, cooldown, duplicate suppression, one-foreground rule, and provide-nothing state.
- [x] Create `lib/realityEngine/director.ts`.
- [x] Map existing Ping candidates into intervention families and priority levels.
- [x] Add ambient output and cooldown/suppression state to active runs.
- [x] Integrate director into `RealityRun` after result resolution and stake changes.
- [x] Run director/Ping tests and commit.

## Task 2 — X-Ray + Reactive World

- [x] Add failing tests for near-miss/chase/win/fast-play director decisions.
- [x] Create `components/XRayMoment.tsx`.
- [x] Add ambient modes to `RealityRun` and existing context background.
- [x] Extend audio engine with ambient density/narrowing controls.
- [x] Ensure X-Ray and ordinary Ping never stack.
- [x] Add mobile browser QA and screenshots.
- [x] Commit.

## Task 3 — Life Ledger editability + selective in-game use

- [x] Add compact private edit surface using existing profile fields.
- [x] Add remove/clear actions.
- [x] Keep setup short; do not create a budget builder.
- [x] Add director duplicate-suppression tests for Ledger vs Payday messages.
- [x] Verify no personal values enter URLs/analytics.
- [x] Commit.

## Task 4 — Trigger Fingerprint + Recovery Progress

- [x] Create `lib/realityEngine/insights.ts` with evidence thresholds.
- [x] Add tests proving one session never becomes a pattern.
- [x] Add descriptive observations for limit overrun, pace after loss, session timing, and shorter-session trends.
- [x] Integrate simple “What keeps showing up” and recovery observations into existing home/Plus hierarchy.
- [x] Verify no dense new dashboard or streak reset.
- [x] Commit.

## Task 5 — Reality Receipt expansion

- [x] Create pure receipt builder `lib/realityEngine/receipt.ts`.
- [x] Add tests for behavior selection and real-life translation.
- [x] Extend existing receipt with start/end balance and one selected behavior observation.
- [x] End with “You left.”
- [x] Add mobile visual regression screenshot.
- [x] Commit.

## Task 6 — Payday Shield

- [x] Extend profile types for optional difficult-time triggers and up to two plan actions.
- [x] Add compact edit/setup UI.
- [x] Create `lib/realityEngine/payday.ts` for timing/context matching.
- [x] Surface shield only on home/pre-session.
- [x] Add tests proving it does not appear during active gameplay and is suppressed when duplicate Ledger context is already foregrounded.
- [x] Commit.

## Task 7 — Integrated 10,000-run experience

- [x] Add deterministic long-run aggregation helpers around calibrated game engines.
- [x] Add tests that output totals equal 10,000 and net math matches generated outcomes.
- [x] Add `Run 10,000` secondary action to every game.
- [x] Create `LongRunExperience` integrated overlay/panel, not route.
- [x] Animate progression from individual outcomes to aggregate view.
- [x] Add optional entry from relevant X-Ray/Receipt moments.
- [x] Verify close returns to the current session with state unchanged.
- [x] Add mobile/desktop screenshots.
- [x] Commit.

## Task 8 — Overload/orchestration QA

- [x] Build one synthetic overload scenario: payday tomorrow + car due + three losses + raised stake + rapid play + crossed limit + history pattern.
- [x] Assert only one foreground intervention appears.
- [x] Assert ambient world may change quietly.
- [x] Assert later strong limit intervention can fire after suppression window.
- [x] Assert Receipt waits until session end.
- [x] Commit.

## Task 9 — Real-user test + permanent fix pass

- [x] Test first 5 seconds, 30 seconds, and full clean-browser journey.
- [x] Test stop-motivated, skeptical, low-patience, returning, and realistic mobile users.
- [x] Test every game and all intervention families.
- [x] Test leaving before/after limits and after Pings.
- [x] Test one-run Plus + RevenueCat/Paddle path only to the extent real provider sandbox/account configuration exists; do not fabricate payment success.
- [x] Write `docs/USER_TEST_FINDINGS.md` before fixes.
- [x] Fix shared root causes first.
- [x] Add regression protection for every Blocker/High issue where practical.
- [x] Retest all affected journeys.
- [x] Write final before/after report.
- [x] Commit.

## Task 10 — Verification / closeout

- [x] Run core tests, typecheck, lint, production build.
- [x] Run complete Playwright responsive/accessibility/game/intervention matrix.
- [x] Inspect key screenshots: home desktop/mobile, game, Reality Ping, X-Ray, Payday Shield, Receipt, paywall, 10,000 run.
- [x] Update implementation matrices honestly.
- [x] Do not merge `main` until the broader payment/deployment gates are legitimately satisfied.


## Closeout note

Implementation and the user-test/permanent-fix pass are complete on the release branch.

Verified product code head: `77e590b630cac4e5342eb55afab570188554ae23`.

Final documentation head may be newer because closeout/report commits rerun CI without changing product behavior.

External release gates intentionally remain outside this completed plan:
- real Paddle sandbox + RevenueCat lifecycle verification
- Git-native full-stack deployment of the exact release branch
- deployed desktop/mobile/console/network retest
- final custom-domain connection
- merge to `main` only after those gates pass
