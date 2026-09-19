# Spin Out Reference-Locked Visual Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The founder has already selected continuous native execution and explicitly asked not to stop for intermediate approval.

**Goal:** Rebuild Spin Out's visual layer so the shipped interface visibly matches the founder-approved reference quality and UI Craft rules while preserving the current functional product behavior.

**Architecture:** Preserve the current Next.js/React product flows, Reality Engine, routes, data model, and researched quality-pass behavior. Rebuild the visual system from a small set of intentional primitives, create authored game-tile artwork rather than repeating symbol grids, and verify each major surface against the strict reference rubric using actual CI screenshots.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, SVG/vector artwork, Phaser, Playwright.

**Spec authority:**
1. Current founder instructions and current product behavior on `release/final-production-pass`.
2. Founder visual master in Library: strict references A/B/C and sections covering card richness, symbol quality, background, typography, motion, and generated-app tells.
3. Adapted UI Craft rules: reject generic AI composition, repeated card grids, default gradients, random glass, weak hierarchy, decoration without a job; treat type, spacing, color, imagery, motion and empty space as one system.
4. UI/UX verification rules for responsive/accessibility/state coverage.
5. External references:
   - https://dribbble.com/shots/26138509--Liquid-Glass-Effect-Sidebar-UI
   - https://dribbble.com/shots/26710647-Casino-Website-Design-in-Chinese-Style
   - https://dribbble.com/shots/26768357-Casino-Website-Gambling

## Global Constraints

- Preserve the current six-game scope including Sportsbook. The older "remove Sports" visual-master instruction is superseded by the newer founder-approved product pass.
- Preserve dark espresso/chocolate, oxblood, bronze/aged gold, warm cream, near-black warm brown.
- Preserve Chinese casino influence with accurate cultural symbols. No pseudo-Chinese glyphs.
- Preserve Reality Ping, X-Ray, Reality Run, black-hole/three-droplet interaction, current onboarding and earned-question behavior.
- No generic Tailwind/shadcn card-grid appearance.
- No identical shell for every game.
- No decorative glass without material depth, edge light, translucency, and a functional job.
- No font choice merely because it is trendy. Type must produce hierarchy even if color is removed.
- No new blocking step before gameplay.
- All 320/390/430/tablet/desktop QA requirements remain.
- Reduced motion, keyboard, touch, restore, returning user and accessibility remain first-class.
- All game art must be original Spin Out artwork, not copied reference assets.

## 100-Point Reference Rubric

A result reaches 100 only if every line passes. Any hard-gate failure caps the score at 99.

### 1. Reference fidelity & product signature — 15
- 5: composition/richness clearly belongs in the same quality class as B/C
- 5: Spin Out remains immediately identifiable rather than becoming a copy
- 5: no generic AI-layout tells

### 2. Authored game artwork — 20
- 10: all six games recognizable before reading the title
- 5: foreground/midground/background/framing/lighting exist, not a symbol row
- 5: art survives enlargement and uses no emoji/generic icon as primary art
**Hard gate:** any tile that still reads as "three icons inside the same card" fails.

### 3. Typography — 10
- 3: display, game, body, label/intervention and numerical roles are visibly distinct
- 3: headings have authored proportions/line breaks rather than generic app type
- 2: tabular numerals where values change
- 2: mobile type remains readable without becoming tiny
**Hard gate:** default-looking generic sans hierarchy fails.

### 4. Liquid-glass navigation/material system — 10
- 4: continuous floating smoked-glass body with environmental bleed-through
- 2: layered depth/edge illumination rather than blur + one shadow
- 2: integrated active state
- 2: coherent icon/mark weight and motion
**Hard gate:** "brown rectangle + blur" fails.

### 5. Homepage environment — 10
- 3: authored environmental QUIT system with scale/depth/cropping variation
- 3: casino symbols integrated into environment, not wallpaper
- 2: lighting/material atmosphere
- 2: prompts live inside composition without covering interactions

### 6. Hierarchy/composition — 10
- 4: one loud thing per important state
- 3: game library has intentional hierarchy/variation
- 3: spacing and empty space support composition rather than template rhythm

### 7. Material/color/lighting — 8
- 3: espresso/oxblood/bronze/cream system is rich, not dull
- 3: believable material differentiation: lacquer, metal, glass, paper, felt/reel surfaces where appropriate
- 2: controlled highlights/glows rather than random ambient blobs

### 8. Motion & interaction finish — 5
- 2: hover/pressed/focus states feel physical and product-specific
- 2: motion supports depth/hierarchy
- 1: reduced-motion alternative remains polished

### 9. Mobile-specific composition — 7
- 3: not desktop stacked vertically
- 2: all six games remain discoverable without gesture knowledge
- 2: artwork remains meaningful at 320–430px

### 10. Secondary-surface coherence — 5
- My Reality, Run 10,000, Reality Ping, X-Ray, receipt and Plus use the same authored type/material language without becoming six copies of one card.

## Review Focus

1. 320px phones: richness must survive without clipping, hidden game choices or tiny labels.
2. High urge: visual rebuild may not add a new gate or slow the five-question path.
3. Reduced motion: imagery/material hierarchy must still carry the design when motion is off.
4. Sensitive My Reality content: visual richness may not make sensitive values decorative or harder to scan/edit.
5. Performance: above-the-fold art must remain lightweight enough for CI/browser QA and mobile use.

---

### Task 1: Pin the visual structure with regression tests

**Files:**
- Modify: `qa/smoke.mjs`
- Modify: `qa/user-test-round2.mjs`

- [ ] Add failing browser assertions for a featured-game composition and supporting game compositions instead of six identical `.home-game-card` structures.
- [ ] Require every game tile to contain a dedicated authored-art container with a game-specific art identifier.
- [ ] Require the desktop sidebar to expose the continuous material body and integrated active marker.
- [ ] Require typography-role classes/attributes for display, game titles, numeric values and intervention labels.
- [ ] Require 320px no overflow and all six quick choices.
- [ ] Run CI/browser QA and confirm the new assertions fail for the intended current-state reason.

### Task 2: Rebuild typography and shared material primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `components/Landing.tsx`
- Modify only where needed: shared secondary-surface components

- [ ] Define intentional display, game-title, body, label, intervention and numeric type roles using reliable web-safe/system-backed stacks unless a verified build-safe bundled option is added.
- [ ] Replace repeated generic radii/shadows/gradients with a small material vocabulary: smoked glass, lacquer, aged bronze, reel/paper/felt surfaces.
- [ ] Rebuild sidebar depth, transparency, edge light and active state against Reference A.
- [ ] Keep accessibility contrast and focus states.

### Task 3: Create six authored game-art compositions

**Files:**
- Create: `components/GameTileArt.tsx`
- Create/Modify: `public/game-art/*.svg`
- Modify: `components/Landing.tsx`
- Modify: `app/globals.css`

Each game gets a distinct composition:
- Slots: dimensional reel cabinet, ruby 7/cherry/BAR, bronze frame
- Sportsbook: physical bet slip + odds board/stadium-light language
- Roulette: wheel crop, ball track, felt/bronze table language
- Video Poker: layered cards/chips/felt, held-card framing
- Scratch: oversized ticket/foil/coin-scratch composition
- Something else: accurate 福 / sycee / traditional coin inspired Spin Out composition

- [ ] No tile may be implemented as the same three-icon grid with swapped symbols.
- [ ] Use foreground/midground/background, masking, typography, lighting and edge overlap.
- [ ] Verify Chinese character/object accuracy from existing verified assets before enlargement/reuse.
- [ ] Keep assets original and lightweight.

### Task 4: Recompose the homepage around the references

**Files:**
- Modify: `components/Landing.tsx`
- Modify: `app/globals.css`

- [ ] Make one game composition featured/larger on desktop and use asymmetric supporting layout instead of one equal card grid.
- [ ] Integrate Reality Pings as intentional red interruptions within the composition.
- [ ] Rebuild environmental QUIT/symbol depth as art direction rather than repeated wallpaper.
- [ ] Preserve current hero comprehension and mobile quick chooser.
- [ ] Add physical hover/pressed states and controlled lighting response.

### Task 5: Design mobile as its own composition

**Files:**
- Modify: `app/globals.css`
- Test: `qa/smoke.mjs`, `qa/user-test-round2.mjs`

- [ ] Preserve immediate six-game discoverability.
- [ ] Use an intentional mobile game library with image-led tiles; do not merely stack desktop cards.
- [ ] Keep 44px+ targets, 320px no horizontal overflow, readable type, and no hidden swipe dependency.
- [ ] Keep the casino richness through cropped artwork, not tiny text.

### Task 6: Bring key secondary surfaces into the same system

**Files:**
- Modify as needed: `components/RealityContextPanel.tsx`, `components/LongRunExperience.tsx`, `components/RealityPing.tsx`, `components/XRayMoment.tsx`, `components/PostRunFlow.tsx`, `components/PlusDashboard.tsx`, `app/globals.css`

- [ ] Preserve all researched information architecture from the quality pass.
- [ ] Replace generic dashboard/card styling with purpose-specific compositions using the same type/material language.
- [ ] Keep one loud idea per state.
- [ ] Do not overdecorate sensitive or statistical content.

### Task 7: Render, inspect, score, and close every deduction

- [ ] Run core tests, typecheck, lint, build and browser QA.
- [ ] Capture 320, 390, 430, tablet and desktop screenshots.
- [ ] Inspect homepage, sidebar, six game tiles, My Reality, Run 10,000, normal/strong Reality Ping, X-Ray, post-run receipt/Money Kept and Plus.
- [ ] Score each rubric line with screenshot evidence.
- [ ] For every deduction, identify the single largest visual gap and correct it.
- [ ] Repeat render → compare → correct until there are no remaining rubric deductions or an evidence-backed technical blocker is explicitly documented.
- [ ] Do not call 100/100 while any hard gate fails.

### Task 8: Resume the research-first synthetic panels

Only after the visual candidate clears the reference rubric:
- [ ] freeze the new exact SHA
- [ ] build/run the 500 synthetic product-user panel
- [ ] build/run the 300 UI/UX panel using actual screenshots
- [ ] research and fix repeated material findings
- [ ] run final CI and produce the final report
