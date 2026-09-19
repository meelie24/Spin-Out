# Research Decision — High-Urge / Low-Patience First Run

**Date:** 2026-09-19  
**Category:** High urgency / first-use friction

## Problem
The five mandatory questions provide necessary first-run anchors, but synthetic users with urge 8–10 and very low patience remain the highest-abandonment segment.

## Evidence
Recent gambling meta-analysis/review evidence continues to associate gambling disorder with deficits in inhibitory control, delay discounting, cognitive flexibility and some decision-making tasks. High-urge states therefore should not be designed like ordinary calm onboarding.

Current successful products commonly:
- keep necessary first steps one-action-per-screen
- prefill or infer known information
- make input controls obvious
- use short transitions
- defer optional detail until after value
- tell users what will happen next when effort is nontrivial

Examples inspected include Netflix signup, Airbnb guided setup, Monzo's "few questions" account flow, Uber destination-first ride flow, Strava signup, Spotify conversational steering, and Cash App setup.

Gambling JITAI work also favors brief, targeted interactions rather than lengthy tasks during high-risk moments.

## Spin Out decision
Keep the five mandatory interactions.

Do not add:
- progress counts
- extra explanation between questions
- review screen
- confirmation screen
- deposit/load gate

Improve perceived speed by:
- keeping all core answers one-tap when possible
- preserving known-game skip
- keeping the long money question visually split into headline + support
- reducing transition latency where it does not serve comprehension
- keeping selection feedback immediate
- making the next question arrive without dead time
- avoiding animation that delays a high-urge user's path to the game

## Success criteria
- exactly five mandatory interactions for known game
- no additional tap between fifth answer and game-visible intro beyond Start Reality Run
- each ordinary multiple-choice answer advances automatically
- no transition delay over 180ms between mandatory questions
- no hidden horizontal choices
- no forced text input on the known-game default path
- high-urge synthetic segment abandonment improves or holds without lower answer accuracy
- time-to-game does not worsen
- first-run intervention quality remains useful because five anchors are preserved

## Sources
Current Netflix, Airbnb, Monzo, Uber, Strava, Spotify and Cash App onboarding/setup flows; 2026 systematic review/meta-analysis of gambling-related executive control and decision-making; earlier gambling impulsivity meta-analysis; GamblingLess JITAI protocol emphasizing brief, context-specific interventions.
