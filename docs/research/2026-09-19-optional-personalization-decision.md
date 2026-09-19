# Research Decision — Optional Personalization / Eventual Question Completion

**Date:** 2026-09-19  
**Working branch:** `release/final-production-pass`  
**Verified baseline SHA:** `a9fbf0e4d364c9ca0517ca55200420ef4e196397`  
**Category:** Optional personalization / profile completion

## Problem

Spin Out currently makes the remaining personal-context questions genuinely optional and compact, but the product still treats them as one sequential queue. After an answer, the next question is immediately available; if the person starts playing the dock collapses, and they must choose to reopen it. This is materially better than a form, but it still relies on the user wanting to continue supplying data without the product earning each additional ask.

The product goal is extremely high **eventual voluntary completion** among engaged users without increasing pre-game abandonment, generating guessed answers, lowering trust, or turning personalization into a task list.

The aspirational target remains 100% eventual voluntary completion. The product must report honestly if that target cannot be reached without degrading answer quality or the core experience.

## User signal

The prior 500-profile synthetic comparison showed the benefit-first dock increased the modeled number of users who supplied at least one optional answer, but average answers per participating user fell after checklist pressure was removed. That is a useful signal: more people were willing to contribute, while fewer felt compelled to complete everything in one sitting.

The remaining gap is **eventual completion over time**. Current behavior does not give Spin Out a strategy for earning later answers across the run and future sessions.

## Current Spin Out behavior

### What already works

- Five core questions only before gameplay.
- Remaining questions never block the game.
- `Make it more immersive` sells the user-facing payoff instead of profile completion.
- `Not now` collapses the question without marking it complete.
- No remaining-count or percentage.
- Important choices no longer depend on hidden horizontal scrolling.
- New context propagates into the active Reality Run immediately.
- Concrete real-life context can outrank generic lower-urgency Pings.
- Returning users do not repeat known context.

### Current weakness

`InRunSetup` still constructs a single deterministic queue:
- income timing
- available money
- obligation amount/date where relevant
- quit reason
- money goal
- difficult times
- lender context
- payday plan

The product does not yet decide **when a particular question is worth asking**. The next unanswered question is simply the next item.

## Current product flows inspected

### Media / recommendation products

1. **Spotify Taste Profile (2026 beta)**
   - Shows users how Spotify currently understands their taste.
   - Uses a benefit-led `Tell us more` control.
   - User can add as much or as little direction as desired.
   - Home recommendations update after the input.
   - Core listening continues if the user does nothing.

2. **Spotify Talk to Spotify (2026 beta)**
   - Lets users steer the experience conversationally while listening.
   - Users can give as much or as little direction as they want.
   - Existing listening history supplies context automatically.

3. **Netflix new-profile preference selection**
   - Explicit starting preferences are optional.
   - If skipped, Netflix starts with broad recommendations.
   - Observed viewing behavior later supersedes initial explicit preferences.

4. **Netflix thumbs feedback**
   - Feedback is attached directly to viewed content.
   - A small explicit action improves future recommendations.
   - Netflix combines explicit feedback with observed behavior.

5. **YouTube recommendation feedback**
   - `Not interested` is available on the recommendation itself.
   - `Tell us why` is a second, optional layer.
   - The ask occurs in the exact context the feedback will change.

6. **TikTok Manage Topics**
   - Users adjust topic preference strength rather than completing a profile.
   - Controls are available in settings and from the For You feed.
   - TikTok continues learning from ongoing behavior.

7. **Pinterest Refine Recommendations**
   - Pinterest first learns from saves, searches, boards and browsing.
   - Explicit tuning is available for activity, interests, boards and following.
   - Users correct the model instead of building a profile from scratch.

8. **Reddit Home recommendations**
   - Uses subscriptions, activity, dwell/engagement and initial stated topics.
   - Recommendation controls remain editable and can be disabled.

### Health / fitness / behavior products

9. **WHOOP Journal**
   - User chooses which behaviors matter enough to track.
   - Logging can happen the next morning or in the moment.
   - The payoff is explicit: behavior responses are correlated with recovery/performance.
   - The value of continued logging grows as WHOOP can show personalized impacts.

10. **Strava Focus (2026)**
    - Starts with one meaningful high-level focus.
    - Optional details and an end date come after the focus.
    - Details immediately affect personalized workout recommendations.
    - Strava tells the user when fresh recommendations are ready, often within minutes.
    - The focus remains visible and editable on the Progress tab.

11. **Apple Fitness Activity goals**
    - Suggested goals use prior performance.
    - Users can edit goals by day and can pause them.
    - The system does not repeatedly ask users to reconstruct known activity information.

12. **Apple Fitness+ Custom Plans**
    - Users may customize plans around their goals.
    - If they make no selections, the product can present popular activities instead of blocking progress.

### Transport / location

13. **Uber Saved Places**
    - A `Save this destination` ask can appear after the person has actually traveled there.
    - The product asks at a moment where the future convenience is obvious.
    - It does not ask the user to pre-fill every place they might care about.

14. **Google Maps personalization**
    - Uses search history, directions, saved lists, ratings and other account activity.
    - Users explicitly save or label places when useful.
    - Large amounts of personalization are inferred from behavior rather than questionnaire completion.

### Finance

15. **Monzo custom categories**
    - The personalization action starts from a real payment the person is already looking at.
    - A category can apply to that payment only, that merchant going forward, or past + future payments.
    - The immediate payoff is clearer spending insight and less future categorization work.

## Patterns that repeat

### 1. Infer first, ask second

Netflix, YouTube, Pinterest, Reddit, Google Maps and Apple all use behavior or known data to personalize without making the person manually describe everything.

**Spin Out implication:** never ask a question if reliable observed behavior or existing profile state already answers it well enough.

### 2. Ask at the moment the answer has a visible job

YouTube asks for recommendation feedback on the recommendation. Uber asks to save a destination after a trip. Monzo asks for transaction categorization while looking at a transaction. WHOOP asks about behaviors near the day they occurred.

**Spin Out implication:** questions should be routed to moments where the user can understand why the answer matters.

### 3. The core experience keeps working without the answer

Spotify, Netflix, TikTok, Pinterest and Apple all continue to provide value when explicit personalization is skipped.

**Spin Out implication:** the game must continue, `Not now` must remain real, and question completion must never become a hidden gate.

### 4. Explicit input should visibly change something

Spotify updates Home. Strava generates fresh workouts. WHOOP produces behavior-impact insights. Monzo changes future categorization.

**Spin Out implication:** when a person gives an answer, Spin Out should create a reasonable opportunity for that answer to affect the current or next relevant experience. Do not ask for information that has no visible job.

### 5. More input is invited after value, not demanded before value

Spotify says `Tell us more`. Strava asks optional details after the high-level focus. WHOOP builds insight over repeated logs.

**Spin Out implication:** do not run all unanswered questions as an uninterrupted sequence merely because the user answered the previous one.

### 6. Receptivity matters

JITAI research consistently warns that poorly timed or overly frequent asks increase intervention burden and fatigue. Ignored prompts are themselves evidence of low receptivity. Active self-report should be used more sparingly than passive signals.

**Spin Out implication:** `Not now`, ignored prompts, rapid play and high urge should change the question cadence.

## Evidence

### UX / form burden

- Baymard's large-scale form research finds that visible form-field count strongly affects perceived and actual complexity; unnecessary optional inputs cause hesitation, incorrect data and abandonment.
- Baymard's current guidance favors hiding uncommon optional inputs until relevant rather than exposing everything by default.
- Questionnaire-length research finds longer questionnaires generally reduce response rates, though content relevance matters in addition to raw length.

### Adaptive / behavioral intervention research

- JITAI design research defines good adaptation as providing the right amount of support at the right time while eliminating unnecessary intervention.
- Receptivity is dynamic; repeatedly prompting when a person is unreceptive can reduce engagement and increase intervention fatigue.
- Addiction-focused JITAI work specifically balances self-report frequency against burden, asking subsets of questions at different relevant times instead of every tailoring variable at every prompt.
- More recent digital-health work recommends adapting check-in frequency based on demonstrated engagement and using prior responses to make future prompts more relevant.

## Anti-patterns

Do not:

- move the remaining questions back before the game
- show a profile-completion meter
- show an `X left` counter
- auto-open the next optional question forever after every answer
- immediately re-show a question after `Not now`
- repeatedly ask when the user is in a high-urgency / low-receptivity state
- reward completion strongly enough to encourage guessed answers
- ask for information Spin Out can infer reliably
- use sensitive details merely because they exist
- claim that 100% completion is a success if answer accuracy, trust or retention deteriorates

## Spin Out decision

Move from a **question queue** to an **earned-ask system**.

The unanswered-question list remains the source of truth, but the product decides when to invite one question based on relevance and receptivity.

### Question routing

#### Early-run money context
High-value financial fields may be invited early because they materially improve the Reality Engine:
- next income timing
- available money
- obligation amount
- obligation due date

Only one is shown at a time.

After a person answers one early-run question, the dock should normally collapse and return focus to the game. The next financial question may become available after additional meaningful gameplay or when the user voluntarily reopens the dock.

#### Post-behavior / intervention questions
Ask a question when the preceding experience makes its purpose obvious.

Examples:
- `What are you trying to stop from happening again?` after a meaningful stopping/chasing moment or post-run reflection.
- money goal around Money Kept / Reality Receipt, where the alternative use of the money is already visible.
- difficult-times context after repeated timing/trigger evidence or from My Reality, rather than arbitrarily during the first minutes of a run.
- lender context only after the user has supplied enough financial context for borrowing/shortfall to be relevant, and never as a surprise immediately after a privacy-sensitive `Not now`.
- payday plan around Payday Shield / known income timing rather than as the final generic item in a run queue.

#### Returning sessions
Use known completion state and staleness to surface only what is missing or newly relevant.

### Receptivity rules

Treat these as low-receptivity signals:
- user taps `Not now`
- user starts/continues rapid gameplay instead of interacting with the dock
- a foreground intervention is active
- high-urgency behavior is currently escalating

A low-receptivity signal suppresses automatic resurfacing for the rest of the immediate interaction window. Manual `Make it more immersive` remains available.

### Payoff rule

A question should only be asked when the answer has one of these jobs:

1. improve a current/near-future Reality Ping or X-Ray
2. improve a current/near-future ambient money cue
3. improve a post-run Receipt / Money Kept explanation
4. improve a returning-session tool such as Payday Shield
5. improve My Reality in a way that the user can inspect and edit

If there is no clear job, do not ask yet.

## What Spin Out should not copy

- WHOOP-style daily logging volume. Spin Out's user is often in a higher-urgency state and the product goal is different.
- Duolingo-style streak pressure for personal disclosure.
- LinkedIn-style profile-completion gamification.
- TikTok/YouTube passive inference where the inferred information would be sensitive or financially consequential without user confirmation.
- Forced profile completion from products whose core function requires a complete profile.

## Success criteria before implementation

### Core flow protection

- exactly five mandatory first-run interactions remain
- no new pre-game question
- no additional gate before Start Reality Run
- `Not now` remains a real postponement
- no counts, percentages or completion bars

### Question cadence

- no automatic chain of more than one optional question without a return-to-game opportunity
- after an optional answer, the dock collapses by default unless the user explicitly chooses to keep answering
- a `Not now` response suppresses automatic resurfacing during the same immediate interaction window
- manual `Make it more immersive` remains available when unanswered relevant questions exist

### Relevance

- every optional question maps to a documented product job
- questions already answered reliably by existing state are not asked
- sensitive questions only appear when their context is relevant

### Payoff

- newly supplied context is saved before transition
- when a matching behavioral opportunity occurs, new context can affect the same run
- if no matching opportunity occurs, the product does not fabricate or force one merely to prove personalization

### Synthetic-panel gates

The 500-profile panel must report:
- pre-game abandonment no worse than the current verified baseline by more than 2 percentage points
- inaccurate/guessed optional answers do not increase
- irritation does not increase
- voluntary reopen rate does not decrease
- eventual relevant-question completion increases materially
- high-urge + low-patience users do not experience more required friction

For engaged users, report completion by:
- end of run 1
- end of run 2
- end of run 3
- end of run 5

The aspirational target is 100% eventual voluntary completion of every **relevant, answerable** question by engaged users. A valid `Not sure`, `No one`, or `Nothing specific` answer counts as completion when it is an honest supported response. A postponed `Not now` does not.

Do not claim success at 100% if the model reaches it by repeated prompting, guessed responses, increased irritation, or reduced retention.

## Sources inspected

### Current product / official sources
- Spotify Taste Profile, current support documentation, accessed 2026-09-19.
- Spotify Taste Profile launch announcement, 2026-03-13.
- Spotify Talk to Spotify announcement, 2026-07-14.
- Netflix recommendation-system help, current.
- Netflix title-rating help, current.
- YouTube recommendation controls, current.
- TikTok Manage Topics, current.
- Pinterest Refine Recommendations, current.
- WHOOP Journal overview, published 2026-03-20.
- Strava Focus setting, updated 2026-09-18.
- Apple Fitness Activity goals, current iOS 27 documentation.
- Apple Fitness+ Custom Plans, current.
- Uber Saved Places, current.
- Google Maps personalization/saved-place documentation, current.
- Reddit recommendation documentation, updated 2026.
- Monzo custom categories, current.

### UX / behavioral sources
- Baymard, current Checkout UX and form-field research.
- Baymard guideline on reducing visible form fields, updated 2026.
- Response Burden and Questionnaire Length meta-analysis.
- Nahum-Shani et al., JITAI design principles.
- Just-in-Time but Not Too Much: treatment timing and intervention budget.
- JITAI framework work on addictive behaviors and assessment burden.
- 2025 smoking-cessation JITAI work on trigger detection and minimizing intrusive data collection.
- 2026 framework for adapting digital-health check-ins to demonstrated engagement.
