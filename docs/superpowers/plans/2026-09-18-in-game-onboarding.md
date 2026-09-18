# In-Game Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Spin Out's long mandatory setup + deposit gate with five high-value questions, a pre-run explanation over the game, and one-question-at-a-time continuation onboarding with a compact mobile dock and black-hole completion motion.

**Architecture:** Keep RealitySetup responsible only for the five-question gate and return both RealityProfile and SessionLimit. Add a non-running game preview stage for the explanation so the real run timer/access claim does not start early. Add a focused InRunSetup component that edits one existing RealityProfile field at a time, persists explicit completion markers inside the profile JSON, and pushes each saved profile back into RealityRun immediately.

**Tech Stack:** Next.js 16, React 19, TypeScript, GSAP already present, CSS animations, Phaser game surface, Playwright QA, Vitest/core tests, existing Supabase JSON profile sync.

**Spec:** `docs/IN_GAME_ONBOARDING_SPEC.md`

## Global Constraints

- Exactly five high-value mandatory interactions before the game preview.
- No old deposit confirmation gate after the five questions.
- Desktop continuation onboarding shows one compact question beside the game.
- Mobile continuation onboarding uses a 110–140px open bottom dock and 42–46px collapsed rail.
- Ordinary mobile questions never become a large bottom sheet.
- Question typography uses a clean system-first stack: ~16–17px semibold question, 14–15px answers, 11–12px secondary label.
- Every continuation answer persists before animation and becomes available to the current Reality Run.
- Completed questions use ~1s 2D black-hole motion with exactly three glass droplets; reduced motion uses short fade/scale.
- Reality Ping/X-Ray/Long Run foreground surfaces collapse the setup UI and have priority.
- Preserve all existing games, Intervention Director behavior, trial/access logic, run restore, multi-tab lock, analytics protections, and current visual identity.
- Work only on `release/final-production-pass`; do not merge `main`.

---

### Task 1: Write the failing journey tests

**Files:**
- Modify: `qa/user-test-round2.mjs`

**Interfaces:**
- Consumes: existing `/play?game=slots` route and localStorage seed helpers.
- Produces: browser assertions for the new five-question gate, intro, dock, persistence, mobile size, and intervention priority.

- [ ] Add a first-time slots journey that asserts the visible setup sequence does not ask game again, reaches the game preview after five interactions, never renders `.deposit-terminal`, and shows the intro copy + Start Reality Run.
- [ ] Run CI QA against the branch and verify the new journey fails because the existing long setup/deposit flow is still present.
- [ ] Add a mobile continuation journey that starts the run, asserts exactly one setup question is visible, checks the open dock bounding box is <=140px on a 390x844 viewport, collapses it, and checks the rail is <=46px.
- [ ] Add a continuation-persistence journey that answers one optional question, reloads/restores, and proves the completed question is not asked again.
- [ ] Add an intervention-priority journey that proves an open setup question collapses when a Reality Ping/X-Ray takes foreground.
- [ ] Keep the existing strong-ping wording regression in the same suite.

### Task 2: Reduce RealitySetup to the five-question gate

**Files:**
- Modify: `components/RealitySetup.tsx`
- Modify: `lib/types.ts`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Consumes: optional `initialGame`, existing RealityProfile.
- Produces: `onComplete(profile: RealityProfile, limit: SessionLimit)`.
- Produces profile field: `onboardingCompleted?: OnboardingQuestionKey[]`.

- [ ] Add `OnboardingQuestionKey` and optional `onboardingCompleted` to RealityProfile. Completion markers stay in the existing JSON profile, so no database schema change is required.
- [ ] Replace first-run steps with exactly: wager; game only when unknown or urge when known; session intent; real-life obligation anchor; stopping intention.
- [ ] Rewrite session-intent copy to “What were you hoping would happen?” and map natural choices onto existing TriggerType values.
- [ ] Rewrite obligation-anchor copy to “What does this money need to make it past?” and store only the existing ObligationType at this stage.
- [ ] Move SessionLimit choices into the fifth setup interaction and return the selected limit from `onComplete`.
- [ ] For the known-game path, use “How bad do you want to play right now?” as the freed high-value interaction so the total remains five.
- [ ] Construct a valid partial RealityProfile with deferred optional financial details null and explicit continuation completion markers empty.
- [ ] Verify the first-time journey reaches the next stage in five interactions.

### Task 3: Remove the deposit gate and add the game-visible intro

**Files:**
- Create: `components/RunIntro.tsx`
- Modify: `components/PlayExperience.tsx`
- Modify: `app/globals.css`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Consumes: RealityProfile, SessionLimit.
- Produces: `onStart(): void`.
- PlayExperience stages become `loading | setup | intro | run | post`.

- [ ] Remove FakeDeposit from the first-run state machine.
- [ ] After setup, persist the profile and move directly to `intro`.
- [ ] Build RunIntro using the same run-shell/run-card/casino-frame visual language and RealityGame preview, with controls visibly present but inactive.
- [ ] Overlay one liquid-glass explanation with “That's enough to start.” and the locked desktop/mobile copy plus one **Start Reality Run** button.
- [ ] Only mount the real RealityRun after Start Reality Run so startedAt, access claim, ambient audio, run lease, and analytics start at the real beginning.
- [ ] Verify no deposit screen appears and the intro sits over a visible game.

### Task 4: Build one-question continuation onboarding

**Files:**
- Create: `components/InRunSetup.tsx`
- Modify: `components/RealityRun.tsx`
- Modify: `components/PlayExperience.tsx`
- Modify: `app/globals.css`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- `InRunSetup({ profile, foregroundOpen, onProfileChange, onFirstGameAction })`
- `RealityRun` receives `onProfileChange(next: RealityProfile): void`.
- Each commit updates localStorage via `updateData`, calls existing `syncProfileIfSignedIn`, and calls `onProfileChange` before transition animation.

- [ ] Build a deterministic contextual question queue using completion markers and current profile values.
- [ ] Include income date, available money, obligation amount/date when relevant, quit reason, money goal, difficult times, lender context, and payday-plan context.
- [ ] Accept explicit “Not sure”/skip/null answers and mark those questions complete.
- [ ] Save before animating; never advance on unsaved state.
- [ ] Pass the new profile to PlayExperience so RealityRun recomputes using the updated prop during the same run.
- [ ] Auto-collapse continuation onboarding whenever `ping`, X-Ray surface, or Long Run is open.
- [ ] On mobile, expose a hook from the first meaningful game action so an open dock gently collapses after that action if the user is not interacting with it.
- [ ] Verify persistence and intervention-priority journeys.

### Task 5: Implement the desktop card, compact mobile dock, and black-hole motion

**Files:**
- Modify: `components/InRunSetup.tsx`
- Modify: `app/globals.css`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Uses `data-state=expanded|collapsed|consuming` and `data-reduced-motion=true|false` for browser-verifiable UI state.

- [ ] Desktop: place one compact liquid-glass question beside the run-card; collapsed state is a thin “Finish your setup · N left” tab.
- [ ] Mobile <=700px: convert the same component into a bottom dock inside the run viewport with max ordinary height 140px and collapsed height 46px.
- [ ] Use a system-first font stack and locked size ranges; preserve >=44px practical touch targets.
- [ ] Keep short answers in compact chips/two-column/horizontal layouts before increasing dock height.
- [ ] Implement ~1s consume animation: card pulled into bottom-center 2D hole, hole pinches, exactly three droplet elements animate with slightly different trajectories/bounces, next question enters.
- [ ] Under prefers-reduced-motion, replace consume motion with a short fade/scale and no required bouncing.
- [ ] Verify mobile bounding-box tests and reduced-motion behavior.

### Task 6: Close existing round-two regression and rerun same-user persona journeys

**Files:**
- Modify: `components/RealityPing.tsx`
- Modify: `qa/user-test-round2.mjs`
- Modify: `docs/USER_TEST_ROUND2_FINDINGS.md`
- Modify: `docs/USER_TEST_FINAL_REPORT.md`

**Interfaces:**
- Strong Reality Ping neutral continuation label is exactly `Continue run`.

- [ ] Confirm the existing regression fails on current branch for “Keep going”.
- [ ] Change strong Reality Ping action to “Continue run”.
- [ ] Keep the primary user-testing perspectives: genuinely trying to stop, skeptical, low patience, returning, mobile.
- [ ] Record browser-observable outcomes and clearly label persona reactions as simulated, not recruited-human quotes.
- [ ] Compare time/clicks to first gameplay, intro understanding, voluntary setup continuation, mobile crowding, and same-run personalization.
- [ ] Fix any new behavior failures with a red test first.

### Task 7: Full verification and release-path continuation

**Files:**
- Modify only if verification exposes a real issue: affected production/test files.
- Update: `docs/PROMPT_IMPLEMENTATION_MATRIX.md` and release docs for verified state.

**Interfaces:**
- Full commands: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run qa`.

- [ ] Run the complete CI workflow on the exact branch SHA and inspect job logs.
- [ ] Verify all five games plus Something Else still start and complete actions.
- [ ] Verify mobile and desktop browser journeys, console errors, and no horizontal overflow.
- [ ] Re-read `docs/IN_GAME_ONBOARDING_SPEC.md` line by line and confirm every acceptance requirement has an implemented/tested counterpart.
- [ ] Update stale implementation-matrix wording, including the established Netlify deployment path.
- [ ] Continue the existing release closeout only after the exact feature SHA is green. Do not merge main automatically.
