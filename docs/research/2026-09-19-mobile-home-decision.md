# Research Decision — Mobile Homepage Information Architecture

**Date:** 2026-09-19  
**Baseline:** current verified Spin Out main/release UI  
**Category:** Mobile homepage information architecture

## Problem
The mobile homepage is visually strong but long and dense. The previous synthetic UI/UX panel repeatedly flagged simultaneous hierarchy, vertical burden, and the feeling that desktop content was being stacked onto a phone.

## User signal
- Mobile reviewers consistently identified homepage density as the largest remaining UI issue.
- Slow scanners took longer to reach a game.
- The casino identity itself was not the complaint; the amount of competing material was.

## Current Spin Out behavior
Mobile currently stacks:
1. header
2. full hero copy
3. large decorative game machine
4. hero Reality Ping
5. six full game cards split into two groups
6. additional Reality Ping cards between groups
7. safety note
8. footer

Every item is individually understandable, but too many items compete for attention.

## Current leading products inspected
Current 2025–2026 flows across:
- Netflix mobile
- Spotify
- Notion mobile
- Pinterest
- Strava
- WHOOP
- Nike
- Monzo
- Revolut
- Cash App
- Google Health / Fitbit
- Apple Health
- Headspace
- Linear mobile
- Airbnb
- Uber

## Repeating patterns
1. **Mobile gets its own information architecture.** Netflix's 2026 mobile redesign explicitly prioritizes mobile-first navigation and visual discovery. Notion's 2026 mobile Home creates a focused starting point instead of mirroring desktop structure.
2. **One dominant purpose per landing view.** Product homes make the next action obvious before secondary destinations.
3. **Rich products still compress supporting information.** Netflix keeps visual richness while using top filters and bottom navigation; Pinterest lets imagery dominate and moves tuning elsewhere.
4. **Separate "now" from "later".** Monzo's 2026 Grow-tab work explicitly moved long-term money away from the everyday Home surface to simplify Home.
5. **Mobile cards are allowed to carry less copy than desktop.** The product can preserve identity and options while shortening card descriptions on small screens.
6. **Secondary controls remain discoverable without being equally loud.**

## Anti-patterns
Do not:
- remove game categories
- hide important games behind gesture-only horizontal scrolling
- flatten the casino identity
- turn the homepage into a generic utility dashboard
- make multiple Reality Ping previews compete with the game-selection task
- require long reading before a user can choose a game

## Spin Out decision
On mobile only:
- keep the hero promise and one clear **Choose a game** action
- retain the hero machine, but reduce its vertical dominance
- show all six games in a compact two-column grid so no game is hidden
- reduce each mobile game card to the information needed to choose: game name, key visual identity, and one short purpose line
- remove repeated descriptive paragraph text from mobile cards while keeping it on tablet/desktop
- reduce homepage Reality Ping previews to one primary prompt before/around game selection; later prompts should not interrupt the six-game scan
- preserve all six games in the initial games area
- keep safety language present but visually quiet

## Success criteria
- first viewport communicates **what Spin Out is** and **Choose a game**
- all six games discoverable without horizontal scrolling
- all six game names visible within materially less vertical distance than baseline
- no game category loses its visual identity
- one dominant action at a time
- no horizontal page overflow at 320px
- mobile game-card tap targets remain practical
- desktop layout remains materially unchanged
- synthetic first-view comprehension improves without lowering game discoverability
- homepage reviewer density findings fall materially in the 300-reviewer rerun

## Sources
Official/current product sources inspected 2026-09-19 include Netflix's 2026 mobile redesign/help, Notion's May 2026 mobile Home release, Pinterest Home feed documentation, Strava current Progress/Join experiences, WHOOP 2026 product/support pages, Nike App, Monzo 2026 app/Trends/Grow documentation, Revolut analytics help, Cash App, Apple Health 2026, Google Health/Fitbit, Airbnb, Uber, Linear mobile, and Spotify 2026 personalization/product announcements. UX evidence includes Baymard account/mobile findings and current information-hierarchy/progressive-disclosure guidance.
