# Spin Out Research-First Quality Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the research-backed quality improvements to Spin Out, then validate them with the full engineering suite, a 500-profile synthetic product-user panel, and a separate 300-profile synthetic UI/UX review panel.

**Architecture:** Keep the existing product architecture and Reality Engine intact. Improve each weak surface independently: earned optional context, mobile home hierarchy, My Reality summary/edit separation, Run 10,000 explanation hierarchy, and action copy. Add deterministic research-calibrated synthetic-panel scripts so results are reproducible and comparable against the verified baseline SHA.

**Tech Stack:** Next.js 16, React 19, TypeScript, GSAP, Phaser, Playwright browser QA, Node core tests, existing localStorage/Supabase sync.

**Spec:** User-supplied `SPIN OUT — RESEARCH-FIRST PRODUCT QUALITY PASS` plus the decision records under `docs/research/2026-09-19-*-decision.md`.

## Global Constraints

- Preserve Spin Out's dark espresso/brown casino aesthetic, oxblood, bronze, cream, Chinese casino influence, liquid glass, premium artwork and motion.
- Keep exactly five high-value mandatory first-run interactions on the known-game path.
- Keep `Make it more immersive`, `Not now`, no task count, no completion percentage, and no hidden horizontal answer scrolling.
- Do not add a gate before gameplay.
- Do not use conversion psychology to encourage longer simulated gambling.
- Use TDD for every behavior-changing fix.
- Every fix must satisfy its problem-specific research criteria before synthetic-panel testing.
- Synthetic users/reviewers must always be labeled synthetic.
- Do not promote an unverified candidate.

## Review Focus

1. **High urge + low patience:** the quality pass must not add required first-run friction or delay gameplay.
2. **Low digital fluency:** all six games and all answer choices must be discoverable without gesture knowledge.
3. **Sensitive context:** My Reality must never expose/edit unrelated sensitive fields merely because one group is being edited.
4. **Returning state:** existing profile values and completion markers must survive the UI restructuring without re-questioning.
5. **320px + reduced motion:** mobile composition, Run 10,000 and optional context must remain fully usable at the smallest supported viewport and with reduced motion.

---

### Task 1: Earn optional context instead of chaining it

**Research:** `docs/research/2026-09-19-optional-personalization-decision.md`

**Files:**
- Create: `lib/contextQuestions.ts`
- Modify: `components/InRunSetup.tsx`
- Modify: `components/PostRunFlow.tsx`
- Modify: `components/PaydayShieldCard.tsx` only if a contextual invitation is justified by existing props
- Test: `tests/contextQuestions.test.ts`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Produce `getInRunContextQuestions(profile: RealityProfile): SetupQuestionDefinition[]`
- Produce `nextPostRunContextQuestion(profile: RealityProfile): OnboardingQuestionKey | null`
- Existing profile completion markers remain authoritative.

- [ ] Write core tests proving in-run auto-eligible context prioritizes high-value financial facts and does not expose every deeper question as one uninterrupted auto sequence.
- [ ] Verify RED.
- [ ] Extract question definitions/eligibility from `InRunSetup` into a focused module.
- [ ] Keep user-initiated `Make it more immersive` able to reveal the next relevant unanswered question.
- [ ] Preserve the existing behavior that each answer saves first, animates, then collapses.
- [ ] Add at most one context invitation in the post-run flow when research gives it an obvious payoff. It must be optional and may not block `Back home`.
- [ ] If Payday Shield already has enough data to make a missing payday plan relevant, expose a light invitation there; otherwise do not invent a new prompt.
- [ ] Add browser tests for: one answer then collapse; `Not now` preserves; post-run optional prompt never blocks exit; returning profile skips completed questions.
- [ ] Run targeted tests and commit.

### Task 2: Recompose the mobile homepage around the core job

**Research:** `docs/research/2026-09-19-mobile-home-decision.md`

**Files:**
- Modify: `components/Landing.tsx`
- Modify: `app/globals.css`
- Test: `qa/smoke.mjs`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Existing game routes remain `/play?game=<type>`.
- Desktop rich-card layout remains available.

- [ ] Write failing mobile browser assertions requiring all six game types to be directly discoverable in the early mobile composition without horizontal scrolling.
- [ ] Assert the compact mobile chooser appears before the decorative hero machine/prompt stack in visual DOM order.
- [ ] Assert no 320px horizontal overflow.
- [ ] Verify RED.
- [ ] Add a mobile-only compact six-game chooser tied to the existing game definitions.
- [ ] Keep full premium game cards lower on the page.
- [ ] On mobile, reduce pre-catalog Reality Ping previews to one strong example.
- [ ] Reweight/reorder hero machine as supporting art on mobile without removing it.
- [ ] Preserve desktop composition unless a shared change is required.
- [ ] Capture fresh 390px and 320px screenshots.
- [ ] Run targeted QA and commit.

### Task 3: Rebuild My Reality as summary first, edit second

**Research:** `docs/research/2026-09-19-my-reality-decision.md`

**Files:**
- Modify: `components/RealityContextPanel.tsx`
- Modify: `app/globals.css`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- Continue consuming/producing `RealityProfile`.
- Continue persisting with `updateData` and `syncProfileIfSignedIn`.
- `onSaved(nextProfile)` remains unchanged.

- [ ] Write failing browser test proving initial My Reality view has zero editable inputs/selects and displays current known facts.
- [ ] Add failing test that clicking Edit on one group exposes only that group's controls.
- [ ] Add failing test that saving one group updates summary and does not clear unrelated profile fields.
- [ ] Verify RED.
- [ ] Replace editor-first initial state with grouped summary cards.
- [ ] Use human labels based on stored values.
- [ ] Add per-group Edit/Add actions.
- [ ] Render only the selected group's controls.
- [ ] Save only the selected group while preserving all unrelated data.
- [ ] Add concise privacy/use explanation.
- [ ] Preserve focus management and close behavior.
- [ ] Verify 320px layout and keyboard access.
- [ ] Capture fresh My Reality screenshots.
- [ ] Run targeted QA and commit.

### Task 4: Make Run 10,000 teach sample vs expectation immediately

**Research:** `docs/research/2026-09-19-run-10000-decision.md`

**Files:**
- Modify: `components/LongRunExperience.tsx`
- Modify: `app/globals.css`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- `LongRunResult` stays unchanged.
- `onClose` stays unchanged.

- [ ] Write failing browser tests for exact dominant labels: `This 10,000-run sample` and `What the model expects over time`.
- [ ] Require one plain-language difference/uncertainty sentence visible without opening details.
- [ ] Require secondary metrics behind a `See the breakdown` control or clearly quieter collapsed section.
- [ ] Verify RED.
- [ ] Recompose final view around the two hero results.
- [ ] Add plain-language model-limit sentence.
- [ ] Move counts/staked/returned/strategy note to secondary disclosure.
- [ ] Keep 1→100→1,000→10,000 animation and reduced-motion shortcut.
- [ ] Verify 320px no clipping and focus behavior.
- [ ] Capture fresh screenshot and commit.

### Task 5: Finish the CTA audit without persuasion leakage

**Research:** `docs/research/2026-09-19-cta-language-decision.md`

**Files:**
- Modify: `components/PostRunFlow.tsx`
- Modify only if necessary: `components/RealityPing.tsx`, `components/XRayMoment.tsx`, `components/PlusPanel.tsx`
- Test: `tests/copy.test.ts`
- Test: `qa/user-test-round2.mjs`

**Interfaces:**
- No behavioral routing changes.
- Only copy that passes category-specific research may change.

- [ ] Add failing test requiring final post-run primary exit to read `Back home`.
- [ ] Assert `Send me the link`, `I'm done`, `Continue run`, `Got it`, `Make it more immersive`, and `Not now` remain present where appropriate.
- [ ] Verify RED.
- [ ] Replace ambiguous final `Done` with `Back home`.
- [ ] Do not alter gameplay/continuation wording merely for conversion.
- [ ] Run targeted tests and commit.

### Task 6: Build reproducible 500-user + 300-UI/UX synthetic panels

**Files:**
- Create: `qa/synthetic/product-panel.mjs`
- Create: `qa/synthetic/uiux-panel.mjs`
- Create: `qa/synthetic/panel-config.mjs`
- Create: `docs/SYNTHETIC_PRODUCT_PANEL_REPORT.md`
- Create: `docs/SYNTHETIC_UIUX_PANEL_REPORT.md`
- Modify: `package.json`

**Interfaces:**
- Product panel accepts a deterministic seed and product-observation JSON derived from browser QA.
- UI/UX panel accepts screenshot/surface measurements plus rubric features.
- Both output machine-readable JSON under `qa-artifacts/synthetic/` and a summarized markdown report.
- Baseline SHA is `a9fbf0e4d364c9ca0517ca55200420ef4e196397`.

- [ ] Freeze correlated profile distributions before reading candidate outcomes.
- [ ] Generate exactly 500 deterministic product profiles spanning motive, urge, pressure, readiness, patience, trust, privacy, digital literacy, attention, skepticism, impulsivity, completion tendency, device, game type, returning status and context availability.
- [ ] Encode action-first behavior: abandonment, skipping, misunderstanding, recall and return behavior occur before retrospective satisfaction.
- [ ] Calibrate generic web-behavior priors from the already-established WebChain/WebLINX/Mind2Web methodology and document limitations.
- [ ] Generate exactly 300 deterministic UI/UX reviewer profiles across mobile, interaction, hierarchy, accessibility, content, motion, IA, onboarding/growth, design systems, behavioral UX, data visualization and premium consumer UI specialties.
- [ ] Do not make the UI/UX panel an Apple-aesthetic panel.
- [ ] Score/report repeated findings, not only averages.
- [ ] Run baseline and candidate with the same frozen product profiles where comparable.
- [ ] Report all required metrics and segment breakdowns.
- [ ] Add npm scripts `qa:synthetic:product`, `qa:synthetic:uiux`, `qa:synthetic`.
- [ ] Run both panels and commit reports/artifacts source code.

### Task 7: Evidence-led fix loop and final verification

**Files:**
- Modify only files justified by repeated Critical/High/Medium findings.
- Update: `docs/PROMPT_IMPLEMENTATION_MATRIX.md`
- Update: `docs/USER_TEST_FINAL_REPORT.md`
- Create: `docs/RESEARCH_FIRST_QUALITY_PASS_REPORT.md`

**Interfaces:**
- Final report references exact commit SHA and CI run.
- No human-validation language for synthetic panels.

- [ ] Classify repeated panel findings by severity and affected segment.
- [ ] For each material finding, perform the prompt-required research check before changing code.
- [ ] Add a red regression test for every behavioral fix.
- [ ] Implement one fix pass.
- [ ] Rerun affected synthetic subset.
- [ ] Run full `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run qa`, and `npm run qa:synthetic`.
- [ ] Inspect fresh screenshots at 320px, 390px, 430px, tablet and desktop; reduced motion; My Reality; Run 10,000; Reality Ping; X-Ray; post-run; Plus.
- [ ] Run the full GitHub CI workflow on the exact final SHA and inspect every job/step.
- [ ] Update implementation matrix and final report with evidence, disagreements, rulings and external blockers.
- [ ] Do not promote another candidate until the exact final SHA is green.
