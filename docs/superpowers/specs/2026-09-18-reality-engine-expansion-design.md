# Spin Out Reality Engine Expansion — Design

**Date:** 2026-09-18  
**Branch:** `release/final-production-pass`  
**Source:** `docs/INTERVENTION_SYSTEM.md` plus the owner-approved Reality Engine expansion brief.

## Goal

Turn the existing Reality Ping / Life Ledger / session-history work into one coordinated Reality Engine that makes Spin Out feel observant without making the user feel constantly interrupted.

The current premium brown casino visual direction stays intact. No new top-level product area is introduced. New features are embedded in the existing home, game, Plus, pre-session, and post-session surfaces.

## Research rules that shape the design

1. **Silence is a valid intervention.** JITAI literature explicitly supports a “provide nothing” option to reduce intervention burden, fatigue, and habituation.
2. **Interrupt at meaningful breakpoints.** Foreground interventions should wait for natural task boundaries when possible, such as after a resolved result, not fight the user during an animation or decision.
3. **Personalized behavioral feedback beats generic warnings.** Gambling studies support using the user’s own tracked behavior and limits. Generic popups are often ignored.
4. **Do not rely on popups alone.** Limit reminders and informational messages can be missed; ambient/environmental truth and post-session feedback carry part of the intervention load.
5. **Probability education alone is not enough.** The 10,000-run experience must be tied to the exact game the user just played and to the user’s distorted expectation. It is not a standalone statistics lesson.

## Existing implementation audit

### Already present and extended, not duplicated
- Life Ledger inputs: obligation type, amount, due date, available-until-income, payday date, goals, lender context.
- Reality Ping behavior engine: rapid replay, streaks, limit overrun, stake escalation, near miss, win-after-losses, user reason, dismissal behavior.
- Reactive context: `reality-background` / context ghosts and intensity-driven game environment.
- Session telemetry: action timing, streaks, limits, near misses, stakes, totals, exit timing.
- Reality Receipt foundation: exit receipt and Money Kept summary.
- Recovery signal foundation: recent exit average, three-exit improvement trend, Money Kept.
- Calibrated game engines: slots, sportsbook, roulette, video poker, scratch.

### Missing or incomplete
- One shared Intervention Director across Pings, X-Ray, ambient world, Payday Shield, and strong interrupts.
- Distinct X-Ray presentation.
- Evidence-threshold Trigger Fingerprint.
- Recovery Progress observations beyond basic exit trend.
- Payday Shield preferences and simple plan.
- Integrated 10,000-run experience.
- Editable private personal context surface.
- Shared regression tests for orchestration/overload suppression.

## Architecture

### 1. Reality Engine Director

New file: `lib/realityEngine/director.ts`.

Inputs:
- game behavior snapshot
- Reality Ping candidates
- recent interventions
- current foreground state
- Life Ledger context
- Payday Shield context
- session intensity
- chosen limits
- past session observations

Output:
- `ambient`: optional environment state only
- `foreground`: zero or one of `ping | xray | strong`
- suppression keys and cooldown metadata

Rules:
- one foreground intervention at a time
- strong limit/chasing events suppress weaker events
- X-Ray suppresses ordinary Pings carrying the same idea
- no Payday foreground intervention during active gameplay
- ambient changes may happen while foreground is quiet
- same idea family is suppressed for a context-sensitive window
- “do nothing” is the normal output when nothing has earned attention

Priority:
1. far past user-set limit
2. clear chasing / stake escalation / rapid chase cluster
3. strong near-miss or win-learning moment
4. useful personalized Life Ledger fact
5. general pace observation
6. ambient-only context

### 2. Intervention levels

- **Level 0 Ambient:** environment temperature, sound narrowing, context ghosts, Ledger text.
- **Level 1 Notice:** existing small Reality Ping.
- **Level 2 X-Ray:** result is held/highlighted after resolution and a concise observation appears with optional explanation / 10,000 action.
- **Level 3 Strong:** explicit two-choice interruption for meaningful limit/chasing patterns.

### 3. Life Ledger

No second ledger model. Existing `RealityProfile` money fields become the ledger source.

Add a compact editable home/account surface for:
- due-next obligation
- amount
- due date
- money until income
- personal goal

Edits update the same profile fields used by gameplay.

In-game use remains selective and director-controlled.

### 4. X-Ray Mode

New component: `components/XRayMoment.tsx`.

It appears only after the game result has resolved and only for:
- near miss
- stake increase after loss / chase
- clear accelerating play
- win after losses

Copy stays short. Longer explanation is behind a tap.

The game result remains visible underneath. X-Ray never becomes a separate page.

### 5. Reactive Game World

Extend existing intensity/context system rather than creating a second layer.

Director emits `ambientMode`:
- `normal`
- `cooling`
- `ledger`
- `strong`

Effects remain subtle:
- slightly cooler / less warm lighting
- reduced ambient sound density
- slower background motion
- selectively stronger context ghosts
- obligation amount / due date can surface in the environment

No explanatory modal accompanies the change.

### 6. Trigger Fingerprint

New pure analysis: `lib/realityEngine/insights.ts`.

Observations are descriptive only and require minimum evidence.

Examples:
- “You’ve gone past your limit in 4 of your last 6 sessions.”
- “You play faster after the first loss.” only after multiple comparable sessions.
- late-night pattern only after enough longer sessions cluster in that window.

Home/Plus presentation:
- simple “What keeps showing up” cards
- no dense chart dashboard
- nothing shown when evidence is weak

### 7. Reality Receipt

Extend the current exit receipt, not replace it.

Prioritize:
1. session duration
2. rounds
3. start/end balance
4. one important behavior
5. one real-life translation
6. limit / earlier-exit observation
7. “You left.”

Keep it compact.

### 8. Recovery Progress

Derived from session history. Never rewards more play.

Possible observations:
- stayed within chosen limit in N of last M
- last 4 of 5 comparable sessions were shorter
- stopped after a chase/strong Ping
- protected amount / Money Kept

No streak reset.

### 9. Payday Shield

Add optional profile fields:
- difficult times: payday, Friday night, late night, after drinking, after argument, bored, stressed, alone, custom
- plan actions: up to two

Home/pre-session only:
- surface when timing/context actually matches
- show one concise card
- never compete with gameplay Pings
- no active-game Payday popup

### 10. 10,000 Runs

Integrated, not a separate route/page.

Each game has a secondary `Run 10,000` button in the game information/control area.

New component: `components/LongRunExperience.tsx`.

It opens as an in-product cinematic panel:
1. one result
2. rapid batch progression
3. thousands condense
4. final net / win-loss/near-miss summary from the actual calibrated game engine

Rules:
- uses the exact game model
- no invented percentages
- optional
- can also be offered from relevant X-Ray moments or Receipt
- closes back into the current game/session without navigation

For video poker, the long-run model uses a fixed documented hold strategy helper rather than pretending to model perfect human decisions unless explicitly implemented and tested.

### 11. Privacy / editability

Personal context stays out of URLs and analytics event payloads.

Create one compact private settings surface from home for editing/removing:
- Life Ledger context
- quit reason
- difficult-time triggers
- payday plan

### 12. User-test pass after implementation

After this expansion is green:
- test fresh, skeptical, low-patience, returning, mobile users
- test every game
- test all Reality Engine triggers
- test overload scenario
- write findings before fixes
- fix root causes
- add regression controls
- retest the full flows

The current one-run Plus trial remains authoritative. The older “48-hour trial” wording in the later user-test prompt is superseded by the owner’s later one-run trial instruction.

## Non-goals

- No redesign.
- No new standalone dashboards for each feature.
- No separate 10,000 page.
- No gamified recovery streaks.
- No diagnostic labels.
- No constant popups.
- No duplicated Life Ledger model.
