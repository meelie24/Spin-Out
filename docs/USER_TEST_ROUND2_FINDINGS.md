# Spin Out — Same-Persona Onboarding Retest

**Verified application-code SHA:** `9c15fab317276fb3368a06f0db3538f4e0cb1e24`  
**Branch:** `release/final-production-pass`  
**GitHub CI run:** `35412505503`

This retest uses the same product perspectives requested for comparison: genuinely trying to stop, skeptical, low patience, returning, and mobile. These are **simulated browser/persona journeys**, not recruited-human interviews. The functional observations below come from the browser suite; the reaction notes are reasoned persona reads based on those observed journeys.

## What changed

The previous first-run flow still asked too much before the useful part of Spin Out. It has been replaced with:

**Five high-value answers → actual game visible → “That’s enough to start” explanation → Start Reality Run → optional one-question setup beside/under the live game.**

There is no deposit/load confirmation between the five questions and the game.

When the homepage already tells Spin Out which game the person chose, the five required interactions are:

1. How much were you about to put in?
2. What were you hoping would happen?
3. Realistically, what is this money for? If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?
4. How bad do you want to play right now?
5. Before you start, where do you want to stop?

The visible game then appears behind the explanation. The remaining questions start only after the user chooses **Start Reality Run**.

## Browser-observed results

| Area | Observed result |
|---|---|
| Mandatory entry | Five-question known-game journey reaches the game preview with no deposit gate. |
| Intro | Actual game is visible before start; mobile and desktop each show the appropriate “more immersive” explanation. |
| Optional setup | Exactly one continuation question is visible at a time. |
| Desktop | Compact glass setup card stays beside the game instead of overlapping it. |
| Mobile | Open dock stays within 140px; collapsed rail stays within 46px; 320px viewport has no horizontal page overflow. |
| Choice overflow | Horizontal chips use an edge fade so another option reads as scrollable rather than clipped. |
| Gameplay priority | First meaningful game action collapses the optional dock. Reality Ping/X-Ray/other foreground moments collapse it too. |
| Persistence | Answers are stored before the transition and completed questions do not return on active-run restore. |
| Same-run immersion | Adding the car-payment amount and due timing during gameplay updates the active Reality Run immediately; the current run begins rendering that context without waiting for the next session. |
| Returning users | Existing completed context is inferred and respected; a complete returning profile is not forced through the optional continuation questions again. |
| Motion | Completion uses the one-second consume sequence with exactly three droplet elements; reduced-motion removes the black-hole/droplet motion and still advances correctly. |
| Existing trust regressions | Neutral **Continue run** wording, focus management, truthful AVAILABLE language, prompt dismissal memory and Run 10,000 copy all remain green. |

## Same-persona read

### Genuinely trying to stop

The required five now capture the immediate session: money at risk, what the person wants from the session, what the money still needs to cover, current urge, and a stopping intention. That is enough for behavioral interventions to have useful anchors before the optional setup is complete.

The biggest improvement is that deeper context is no longer the price of admission. The person can start, then add bill amount, due date, personal reason, difficult times or other context between actions.

**Likely reaction:** the run gets useful faster, while the optional questions still feel relevant because newly added context visibly changes the current experience.

### Skeptical

The “more immersive” line now has a product behavior behind it. The browser test proves that additional context is inserted into the active run immediately instead of being stored for some vague future personalization.

Reality Pings remain behavior-triggered and the Intervention Director can stay silent, so extra personal context is not repeated in every message.

**Likely reaction:** the claim feels more credible once the game starts reflecting information the person just supplied.

### Low patience

The old sequence required multiple financial/detail screens plus a separate load/deposit transition. The new known-game route requires five answers and one explicit **Start Reality Run** action. The optional dock then gets itself out of the way on the first meaningful game action.

**Likely reaction:** five questions are still noticeable, but the “just let me try it” complaint is materially reduced because there is no second setup/deposit gate after them.

### Returning

A returning user does not repeat the first-run questionnaire. Known context is retained, and continuation questions appear only when context is missing or genuinely stale.

**Likely reaction:** Spin Out feels like it remembers the person rather than restarting an intake form.

### Mobile

The mobile design is not a shrunk desktop sidebar. It is a glass dock attached to the bottom edge, capped at 110–140px for normal questions and 42–46px when collapsed. Text uses the system-first, Apple-like scale specified in the design, and the game remains the dominant surface.

**Likely reaction:** the optional setup remains visible enough to remember, but it does not feel like a bottom sheet taking over the phone.

## Findings that were fixed during this retest

1. The fourth core question was refined again to the owner-approved wording: **“Realistically, what is this money for? If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?”**
2. Mobile horizontal choices originally ended on a raw partial chip. A deliberate right-edge fade now makes horizontal continuation obvious.
3. Desktop acceptance originally reused a mobile-only intro assertion. The test now validates whichever responsive explanation is actually visible.
4. The RevenueCat release path had a documentation/code naming mismatch. The server entitlement lookup now prefers `REVENUECAT_SECRET_API_KEY`, with tested fallbacks for existing non-production environments.

## Verification result

The implementation passed:
- 66 core tests after release-key hardening
- TypeScript
- ESLint
- production Next.js build
- responsive/browser smoke suite
- five-question entry
- 390px and 320px mobile dock checks
- reduced motion
- persistence/restore
- first-action and intervention collapse
- same-run personalization
- desktop beside-game placement
- returning-profile behavior
- lender conditional path
- all existing intervention/truthfulness regressions

The onboarding/product code is therefore closed at the CI release-candidate level. Netlify deployed verification and real Paddle/RevenueCat sandbox lifecycle testing remain separate external release gates.
