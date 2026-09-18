# Reality Engine Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

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

- [ ] Add failing unit tests for priority, cooldown, duplicate suppression, one-foreground rule, and provide-nothing state.
- [ ] Create `lib/realityEngine/director.ts`.
- [ ] Map existing Ping candidates into intervention families and priority levels.
- [ ] Add ambient output and cooldown/suppression state to active runs.
- [ ] Integrate director into `RealityRun` after result resolution and stake changes.
- [ ] Run director/Ping tests and commit.

## Task 2 — X-Ray + Reactive World

- [ ] Add failing tests for near-miss/chase/win/fast-play director decisions.
- [ ] Create `components/XRayMoment.tsx`.
- [ ] Add ambient modes to `RealityRun` and existing context background.
- [ ] Extend audio engine with ambient density/narrowing controls.
- [ ] Ensure X-Ray and ordinary Ping never stack.
- [ ] Add mobile browser QA and screenshots.
- [ ] Commit.

## Task 3 — Life Ledger editability + selective in-game use

- [ ] Add compact private edit surface using existing profile fields.
- [ ] Add remove/clear actions.
- [ ] Keep setup short; do not create a budget builder.
- [ ] Add director duplicate-suppression tests for Ledger vs Payday messages.
- [ ] Verify no personal values enter URLs/analytics.
- [ ] Commit.

## Task 4 — Trigger Fingerprint + Recovery Progress

- [ ] Create `lib/realityEngine/insights.ts` with evidence thresholds.
- [ ] Add tests proving one session never becomes a pattern.
- [ ] Add descriptive observations for limit overrun, pace after loss, session timing, and shorter-session trends.
- [ ] Integrate simple “What keeps showing up” and recovery observations into existing home/Plus hierarchy.
- [ ] Verify no dense new dashboard or streak reset.
- [ ] Commit.

## Task 5 — Reality Receipt expansion

- [ ] Create pure receipt builder `lib/realityEngine/receipt.ts`.
- [ ] Add tests for behavior selection and real-life translation.
- [ ] Extend existing receipt with start/end balance and one selected behavior observation.
- [ ] End with “You left.”
- [ ] Add mobile visual regression screenshot.
- [ ] Commit.

## Task 6 — Payday Shield

- [ ] Extend profile types for optional difficult-time triggers and up to two plan actions.
- [ ] Add compact edit/setup UI.
- [ ] Create `lib/realityEngine/payday.ts` for timing/context matching.
- [ ] Surface shield only on home/pre-session.
- [ ] Add tests proving it does not appear during active gameplay and is suppressed when duplicate Ledger context is already foregrounded.
- [ ] Commit.

## Task 7 — Integrated 10,000-run experience

- [ ] Add deterministic long-run aggregation helpers around calibrated game engines.
- [ ] Add tests that output totals equal 10,000 and net math matches generated outcomes.
- [ ] Add `Run 10,000` secondary action to every game.
- [ ] Create `LongRunExperience` integrated overlay/panel, not route.
- [ ] Animate progression from individual outcomes to aggregate view.
- [ ] Add optional entry from relevant X-Ray/Receipt moments.
- [ ] Verify close returns to the current session with state unchanged.
- [ ] Add mobile/desktop screenshots.
- [ ] Commit.

## Task 8 — Overload/orchestration QA

- [ ] Build one synthetic overload scenario: payday tomorrow + car due + three losses + raised stake + rapid play + crossed limit + history pattern.
- [ ] Assert only one foreground intervention appears.
- [ ] Assert ambient world may change quietly.
- [ ] Assert later strong limit intervention can fire after suppression window.
- [ ] Assert Receipt waits until session end.
- [ ] Commit.

## Task 9 — Real-user test + permanent fix pass

- [ ] Test first 5 seconds, 30 seconds, and full clean-browser journey.
- [ ] Test stop-motivated, skeptical, low-patience, returning, and realistic mobile users.
- [ ] Test every game and all intervention families.
- [ ] Test leaving before/after limits and after Pings.
- [ ] Test one-run Plus + RevenueCat/Paddle path only to the extent real provider sandbox/account configuration exists; do not fabricate payment success.
- [ ] Write `docs/USER_TEST_FINDINGS.md` before fixes.
- [ ] Fix shared root causes first.
- [ ] Add regression protection for every Blocker/High issue where practical.
- [ ] Retest all affected journeys.
- [ ] Write final before/after report.
- [ ] Commit.

## Task 10 — Verification / closeout

- [ ] Run core tests, typecheck, lint, production build.
- [ ] Run complete Playwright responsive/accessibility/game/intervention matrix.
- [ ] Inspect key screenshots: home desktop/mobile, game, Reality Ping, X-Ray, Payday Shield, Receipt, paywall, 10,000 run.
- [ ] Update implementation matrices honestly.
- [ ] Do not merge `main` until the broader payment/deployment gates are legitimately satisfied.
