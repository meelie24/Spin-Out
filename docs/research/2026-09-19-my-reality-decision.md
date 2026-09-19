# Research Decision — My Reality Summary-First UX

**Date:** 2026-09-19  
**Category:** Personal summary / editable personal data

## Problem
My Reality exposes too much of its editing model at once. It is useful, but reads as a profile form rather than answering: **What does Spin Out know about my situation?**

## User signal
The prior synthetic UI review repeatedly marked this surface as dense, small-text-heavy, and form-first.

## Relevant leaders inspected
Apple Fitness Summary and Health Insights; WHOOP Recovery/Healthspan/My Memory; Strava Progress/Training Log/Goals; Garmin Connect In Focus/At a Glance; Monzo Trends; Revolut analytics; Spotify Taste Profile; Google Maps You tab; Pinterest recommendation controls; Notion Home/My Tasks; Airbnb profile/inferred interests.

## Patterns that repeat
1. Summary first, details on demand.
2. Editing is secondary to understanding.
3. Strong summaries use human labels rather than field names.
4. Users can inspect and correct personal data.
5. Customization is selective, not a wall of settings.

Progressive-disclosure research supports showing primary information first and exposing specialized controls only when requested.

## Anti-patterns
Do not show every editable field at once, require scrolling through a form to understand current state, hide known data behind Edit, use tiny labels for sensitive data, add completion percentages, or present inferred sensitive data as confirmed.

## Spin Out decision
Rebuild My Reality as a **summary-first personal snapshot**. Initial state contains no active inputs. Show readable groups based on what the person actually supplied. Each group has a clear Edit action that opens only that group. Save returns to summary.

Missing information should not make the view look broken. Where useful, a subtle Add action can invite a missing item without turning the screen into a checklist.

Add a clear privacy/control explanation: this information makes Reality Runs more specific and can be changed or removed.

### One thing gets to be loud
**LOUD:** the person’s current real-life context.  
**SUPPORTING:** how Spin Out uses it.  
**QUIET:** edit controls and advanced details.

## Success criteria
- no editable input visible on initial open
- main known facts understandable within seconds
- edit one group without exposing all fields
- preserve all existing fields/sync
- no hidden Save at the bottom of a long form
- 320px-safe
- privacy/control clear
- current information verifiable without edit mode
- edit controls discoverable
- focus management/accessibility preserved

## Sources
Apple Fitness/Health, WHOOP, Strava, Garmin Connect, Monzo Trends, Revolut analytics, Spotify Taste Profile, Google Maps You, Pinterest recommendation controls, Notion mobile Home, Airbnb profile/inferred interests, Nielsen Norman Group progressive disclosure.
