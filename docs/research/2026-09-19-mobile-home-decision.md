# Research Decision — Mobile Homepage Information Architecture

**Date:** 2026-09-19  
**Baseline:** main at `a9fbf0e4d364c9ca0517ca55200420ef4e196397`  
**Category:** Mobile homepage / information architecture

## Problem
The mobile homepage is visually strong but asks the first screen to explain Spin Out, sell Reality Run, display a decorative machine, surface a Reality Ping preview, and only later reveal the six game choices. The primary task is choosing a game, yet several supporting elements compete before it.

## User signal
The 300-reviewer synthetic UI panel repeatedly flagged mobile-home density/hierarchy, while lower-attention product users took longer to identify what to do first.

## Current Spin Out behavior
Mobile order is hero → CTA → hero machine → prompt preview → optional Payday Shield → Reality Runs heading → prompt → first three rich game cards → prompt → remaining three cards → prompt/safety note.

## Relevant leaders inspected
Spotify Home/DJ/Taste Profile; Netflix Home; YouTube Home; Pinterest Home; Monzo Home; Revolut analytics; Strava Progress; Duolingo Home path; Airbnb search; Uber Home; Notion mobile Home; Linear Mobile; Apple Fitness Summary; Garmin Connect Home; WHOOP overview.

## Patterns that repeat
1. Core job is exposed immediately.
2. Rich interfaces still use strong hierarchy.
3. Top-level choices work better when visible instead of buried.
4. Home prioritizes recent/relevant activity rather than presenting a static catalog at equal weight.
5. Good mobile products recompose around mobile jobs instead of stacking desktop vertically.

Baymard’s mobile-home research finds that users commonly scan the homepage to answer “what is this?”, “what can I do here?” and “what should I expect to find?”. Current mobile-navigation research also favors visible top-level categories and manageable chunks.

## Anti-patterns
Do not flatten the casino identity, hide game categories behind a menu, depend on hidden horizontal scrolling, place all six large cards above the fold, or let decorative art outrank the task.

## Spin Out decision
On mobile, the early composition must answer:
1. What is this?
2. What do I do now?

Keep the hero identity, but expose a compact six-game chooser very early. Keep the full premium cards lower as richer browsing/explanation. Reduce mobile Reality Ping previews to one strong example before the game catalog. Keep the hero machine as supporting brand art rather than the loudest object.

### One thing gets to be loud
**LOUD:** About to gamble? + choose the game you were about to open.  
**SUPPORTING:** one explanation sentence + premium game imagery.  
**QUIET:** prompt preview, practice-only note, secondary navigation.

## Success criteria
- real game choices appear in the first viewport or first natural scroll
- all six game types discoverable without hidden horizontal scrolling or a menu
- first composition clearly communicates what Spin Out is and what to do
- premium art remains
- no 320px horizontal overflow
- mobile scroll distance to first actionable game decreases materially
- only one primary focus dominates each viewport
- returning progress does not push game choice out of reach
- Get help remains easy to reach
- desktop identity is preserved

## Sources
Current/current-help flows inspected from Spotify, Netflix, YouTube, Pinterest, Monzo, Revolut, Strava, Duolingo, Airbnb, Uber, Notion, Linear, Apple Fitness, Garmin Connect, WHOOP; Baymard mobile homepage/navigation benchmarks; Nielsen Norman Group progressive disclosure.
