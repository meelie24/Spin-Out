# Spin Out prompt implementation matrix

This file tracks the authoritative `MASTER_PRODUCT_PROMPT.md` plus later owner approvals. It is a build checklist, not marketing copy.

## Core product and first run

- [x] Minimal action-first landing page with returning-user state.
- [x] First-run Reality Setup collects intended wager, gambling type, trigger, available money, next income date, next obligation, obligation amount/due date, optional lender context, optional money goal, and starting urge.
- [x] Setup presents one decision at a time, auto-advances tap choices, uses short 180–320 ms motion, and avoids a progress bar/question count.
- [x] Returning setup reuses context and normally asks only intended wager, trigger, and urge. Expired obligations trigger an update.
- [x] Simulated practice deposit transfers the intended wager visually into the run and explicitly says no real money moves.

## Reality Run

- [x] 900-second maximum with no visible countdown and no duration reward.
- [x] Immediate natural exit: Cash Out for slots, Leave for sports/lottery, Leave Table for casino/poker. No confirmation.
- [x] Time to voluntary exit recorded; returning homepage and results use the user’s own history only.
- [x] Original slots, fictional sports market, roulette/casino, poker, and scratch/lottery Phaser surfaces.
- [x] 5×3 original slot art, five vertical reels, simultaneous settle, no engineered near misses.
- [x] Variable practice stake is bounded by the intended wager and remaining practice balance.
- [x] Dark royal casino-rug environment, champagne/brass framing, reflected light, animated perimeter bulbs, and a focused WebGL game window.
- [x] Web Audio cues for clicks, reel motor/ticks, restrained result feedback, ambient room tone, and the distinct Reality Ping cue. Mute is always available.

## Reality Engine

- [x] Real-life context progressively appears behind the game as simulated losses grow, including obligation, due timing, personal goal, and exact shortfall where known.
- [x] Reality Pings use confirmed facts, exact calculations, or explicitly hypothetical “could’ve” comparisons.
- [x] Trigger-specific Ping families cover win-it-back, win-money, boredom, rush, switch-off, and habit.
- [x] Recovery/break-even, stake escalation, obligation threshold, payday, lender, goal, and generic loss moments can trigger a Ping.
- [x] Pings are spaced, escalate by level, avoid repeating the same category, and learn locally from which categories preceded voluntary exits.
- [x] Ping display is liquid blurred glass over the still-visible game, enters around 83% → 103% → 100% in ~280 ms, and the whole surface dismisses in one tap/click.
- [x] Ping shown time, dismissal time, next action, stake changes, and voluntary exits are retained locally for the on-device relevance model.

## Ending and long-term feedback

- [x] Same 1–10 urge control after the run and brief before→after display.
- [x] Real-world outcome asks No / Less than planned / Yes and records actual wager without shame language.
- [x] Money Kept is intended wager minus actual wager. Overspending is shown factually if actual exceeds intended.
- [x] Money Kept connects to the entered obligation when mathematically relevant.
- [x] Monthly/all-time Money Kept and recent voluntary-exit average are shown without leaderboards, percentiles, streaks, or duration rewards.
- [x] Returning homepage shows Money Kept and one useful exit metric without becoming a dashboard.

## Product states, privacy, and monetization

- [x] First visit, returning visit, optional question skipped, no obligation, unknown income timing, active run, Ping active/dismissed, muted sound, reduced motion, voluntary exit, automatic timeout, urge lower/same/higher, did-not-gamble, gambled-less/full/more, first/returning Money Kept, expired obligation, free/premium/canceled/payment-failed models, and responsive sizes have explicit UI/state handling.
- [x] Profile, run history, Ping learning, and analytics stay in browser storage in this build.
- [x] No advertising audiences, public sharing, leaderboards, streaks, daily rewards, jackpots, loot boxes, or casino-affiliate links.
- [x] Spin Out+ pricing and appropriate post-run placement exist; core Reality Runs remain free.
- [x] External payment and cross-device account providers are **not fabricated**. The UI identifies provider-dependent functions as unavailable until connected.
- [x] Live social-presence counter is real, anonymous, ephemeral, and separate from Reality Run data. It only appears when at least one other current session is counted.

## Informational routes and safety

- [x] Research, Help, Privacy, Terms, and not-found routes.
- [x] Research wording distinguishes related evidence from evidence about Spin Out itself.
- [x] Verified support links with geographic scope and no invented local phone number.
- [x] Gambling-cue limitation remains visible in research/terms, while the landing experience stays minimal.

## Owner-approved visual additions

- [x] Sleek modern sans UI with warm ivory/cocoa surfaces outside the run.
- [x] Royal brown/wine casino-rug world around the game window.
- [x] High-immersion lights surrounding the game window.
- [x] Simulated fake deposit step.
- [x] Liquid blurred-glass prompts with the game visible behind them.
- [x] Five-reel game, real-feeling reel movement, rich original fruit/bell/seven/gem art, sound effects, and ambient audio.
- [x] No generic AI-site phrasing, feature-grid filler, fake testimonials, fake user counts, or SaaS dashboard treatment.
- [x] Live wording: “N people are on this journey with you” uses only a real ephemeral presence count.

## Provider boundary

Authentication, cross-device sync, and paid subscription charging require an external identity/billing provider and secrets. This repository implements their product states and never pretends those external actions happened. Connecting a provider is deployment configuration, not simulated product behavior.
