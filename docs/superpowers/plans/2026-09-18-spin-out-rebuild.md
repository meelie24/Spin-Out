# Spin Out Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Rebuild Spin Out as a Next.js + React + TypeScript application with a Phaser 4 Reality Run and the full master-product flow.

**Architecture:** Next.js owns product flow and local persistence. Phaser owns the visual gambling surface. A pure TypeScript core owns math, outcomes, Reality Pings, Money Kept and history so behavior is testable independently from rendering.

**Tech Stack:** Next.js 16.3.3, React 19.2, TypeScript, Phaser 4.2.1, GSAP 3.13+, Web Audio API, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-18-spin-out-architecture-design.md`

## Global Constraints
- The master prompt in `docs/MASTER_PRODUCT_PROMPT.md` is authoritative.
- No real-money payment, deposits, prizes, jackpots, autoplay, near-miss manipulation, daily rewards or leaderboards.
- Reality Run maximum is 900 seconds with no visible countdown.
- The player can leave immediately at any point.
- Financial statements must be exact; hypothetical comparisons must be explicit.
- Setup is one interaction at a time and avoids form-like pages.
- User data stays browser-local in this build.
- No AI-style filler copy, em dashes or therapy/corporate phrasing.

### Task 1: Pure product engine
**Files:** `lib/types.ts`, `lib/engine.ts`, `lib/pings.ts`, `lib/storage.ts`, `tests/engine.test.ts`, `tests/pings.test.ts`
- [x] Write tests for outcome bounds, 900-second ending, exact money-kept math, shortfall math, ping factuality, returning averages and expired obligations.
- [x] Implement pure functions until tests pass.

### Task 2: Setup and persistence
**Files:** `components/RealitySetup.tsx`, `components/FakeDeposit.tsx`, `lib/storage.ts`
- [x] Implement first-run one-tap setup, optional lender/goal, returning flow and expired obligation update.
- [x] Add GSAP selection/transition motion and simulated deposit transition.

### Task 3: Phaser game
**Files:** `components/RealityGame.tsx`, `lib/phaserGame.ts`, `public/symbols/*.svg`
- [x] Build 5×3 slot scene with original symbols, vertical reel animation, casino lights and no near-miss engineering.
- [x] Build distinct sports, roulette/casino, poker and lottery surfaces.
- [x] Add responsive scaling and result animation bridge.

### Task 4: Reality Engine UI and audio
**Files:** `components/RealityRun.tsx`, `components/RealityPing.tsx`, `lib/audio.ts`
- [x] Add fake balance, bounded stake control, adaptive factual context, liquid-glass Pings and immediate exit.
- [x] Add Web Audio click, spin, result, ambient and Ping cues with mute/reduced-motion handling.

### Task 5: Post-run and returning product
**Files:** `components/PostRunFlow.tsx`, `components/Landing.tsx`
- [x] Implement ending urge, real-world outcome, Money Kept, time-to-exit, relapse UX and returning homepage.
- [x] Define signed-in/out and Plus provider-dependent states without faking external services.

### Task 6: Informational routes and visual polish
**Files:** `app/research/page.tsx`, `app/help/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/globals.css`
- [x] Build concise verified pages and finish ivory/cocoa/casino-rug design system.
- [x] Remove copy/design AI tells and verify accessibility/responsiveness.

### Task 7: QA and GitHub delivery
**Files:** `.github/workflows/ci.yml`, `README.md`
- [x] Run unit tests, typecheck and Next production build.
- [x] Inspect 320/375/390/430/mobile, tablet, laptop and desktop rendering.
- [x] Test first/returning setup, every game type, Ping dismiss, mute, reduced motion, exit, timeout, outcome branches, Money Kept and persistence.
- [x] Commit verified source to `meelie24/Spin-Out`.


### Task 8: Live anonymous presence
**Files:** `lib/presence.ts`, `app/api/presence/route.ts`, `components/JourneyCounter.tsx`, `tests/presence.test.ts`
- [x] Count unique session-only anonymous heartbeats with expiry.
- [x] Exclude the current visitor from the displayed companion count.
- [x] Hide the counter when nobody else is currently present or when the endpoint is unavailable.
- [x] Keep presence completely separate from gambling/profile data.
