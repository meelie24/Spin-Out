# Research Decision — My Reality Summary-First Design

**Date:** 2026-09-19  
**Category:** Personal summary / editable sensitive context

## Problem
My Reality currently opens as an editor. It asks the user to parse fields before it helps them understand what Spin Out already knows.

## User signal
The 300-reviewer synthetic UI/UX panel identified My Reality as one of the weakest surfaces for density, typography, mobile ergonomics, and form-first presentation.

## Relevant current products inspected
- Apple Health Summary / Trends / 2026 Insights
- Google Health / Fitbit Key Metrics
- Oura Trends, Readiness contributors, reports and current goal
- WHOOP Recovery / Recovery Impacts
- Strava Progress, Focus and goals
- Monzo Trends
- Revolut Analytics
- Cash App Savings goals
- Headspace Profile / Progress
- Todoist Productivity
- Spotify Taste Profile
- Notion account/profile/settings patterns

## Repeating patterns
1. **Summary first, drill-down second.** Apple Health, Oura, Monzo, Revolut, Strava and WHOOP show the user's current state before exposing configuration.
2. **A few meaningful categories beat a wall of fields.**
3. **Edits happen from the thing being viewed.** Revolut edits categories from the relevant analytics/category context. Strava edits Focus from the Progress display.
4. **Sensitive data should remain inspectable and correctable.** Spotify Taste Profile makes the model's interpretation visible so the user can steer it.
5. **Mobile can intentionally expose fewer controls.** Notion explicitly slims settings on mobile.
6. **Icons can improve scanability when paired with text.** Baymard's account-dashboard testing found icon + text more scannable than long text-link lists.

## Anti-patterns
Do not:
- hide what Spin Out knows
- make editing hard to find
- present sensitive information as decorative trivia
- show a giant completion meter
- use unlabeled icons
- force users to open edit mode merely to verify current values

## Spin Out decision
Default My Reality to **summary mode**.

Summary groups should be derived from existing profile data and use plain human labels, for example:
- Money coming in
- What this money is for
- What I'm trying to keep it for
- When gambling gets harder to ignore
- Who I might call
- Payday plan

Each group:
- shows the current value in a scannable card/row
- shows **Not set** when missing without shaming
- provides a clear edit affordance

Editing:
- remains available from the summary
- may use the existing form controls
- should open only when the user chooses to edit
- Save returns to summary mode with the updated value visible

## Success criteria
- opening My Reality shows current information before inputs
- no wall of editable controls on initial open
- a user can identify the major current context within seconds
- every displayed item has a discoverable edit path
- missing values are obvious without creating completion pressure
- mobile typography remains readable
- privacy-sensitive fields are not over-emphasized
- existing profile sync and Save behavior remain intact
- keyboard/focus trapping remains correct
- 300-reviewer density and scanability findings improve materially

## Sources
Current 2026 product/help sources: Apple Health Summary/Trends/Insights, Google Health Key Metrics, Oura Trends/Reports, WHOOP Recovery Impacts, Strava Progress/Focus, Monzo Trends, Revolut Analytics, Cash App Savings goals, Headspace Profile, Todoist Productivity, Spotify Taste Profile, Notion account/profile settings. Baymard 2026 Accounts & Self-Service research and account-dashboard scanability findings were used as independent UX evidence.
