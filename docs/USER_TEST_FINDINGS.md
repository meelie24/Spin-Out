# Spin Out — User Test Findings

**Baseline tested:** Reality Engine expansion release candidate on `release/final-production-pass`, CI/browser artifact from the post-expansion candidate around `24a3936fb0f01f5423c3548ef41941ee5d34b4be`.

**Important limitation:** this is the exact CI-built browser candidate, not a Git-native deployed production URL. The hosting connector still has no accessible project, and Paddle/RevenueCat sandbox is not configured. Those are recorded as release blockers instead of being treated as successful tests.

## Likely first-time reaction

### First 5 seconds
> “Okay, this looks like a casino, but ‘About to gamble?’ makes me think it’s doing something different.”

The anti-gambling purpose now registers quickly, especially because the hero says Spin Out pays attention to how the person plays and calls out what keeps them going. The premium casino treatment is strong enough that a person may briefly read it as a casino before the copy lands.

### First 30 seconds
> “Oh okay, I get what they’re doing. I pick the game I was about to use and it watches how I play.”

The game cards help because each one explains what that simulation is meant to expose. The scattered Reality Ping questions reinforce the purpose without turning the page into a warning page.

### First full session
> “The part where it calls out something I literally just did is the useful bit. I wish I got into the game faster.”

The Reality Pings/X-Ray moments feel materially more useful than generic responsible-gambling copy. The weak point is how many setup decisions a new user must make before the first game actually begins.

## User perspectives

### Someone who genuinely wants to stop
Most likely reaction:
> “Yeah, I actually do that.”

Strongest moments:
- chosen-limit callout
- stake increase after a loss
- quick/accelerating replay
- Life Ledger translation
- Reality Receipt
- shorter-exit/within-limit observations

Weakness:
- setup can feel like work before the useful part arrives

### Skeptical user
Most likely reaction:
> “This is less bullshit than I expected because it’s calling out what I just did, not giving me quotes.”

The product now proves its purpose inside the game. X-Ray is especially important here.

Risk:
- if Run 10,000 hides the actual final conclusion on mobile, it looks like spectacle instead of evidence

### Low-patience user
Most likely reaction:
> “Just let me try it.”

The homepage is easy to act on. The setup flow is the main friction point.

### Returning user
Most likely reaction:
> “It remembers what I do, and the patterns are actually about me.”

Return value is now credible through:
- Money Kept
- exit trends
- Trigger Fingerprint
- within-limit progress
- Life Ledger
- Payday Shield
- saved Reality Run history

### Mobile user
The main game interfaces are usable and polished on a 390px viewport. Reality Pings and X-Ray fit well. The long-run panel currently fails its core communication goal on mobile because the final numbers are clipped.

## Findings before fixes

| Finding | What happened | Likely user thought | Severity | Root cause | Fix |
|---|---|---|---|---|---|
| First-run setup is too long | A game chosen from home still leads through wager, trigger, quit reason, cash-until-income, income timing, obligation, obligation detail, lender, goal, urge, then optional limit before play | “I thought I was about to try the game.” | **HIGH** | Too much personalization is front-loaded instead of earned progressively | Reduce first-run setup to the minimum useful context. Move lender and secondary finance context into My Reality/progressive personalization. Combine related Life Ledger questions where practical. |
| Run 10,000 final lesson is clipped on mobile | The 390px screenshot shows the 10,000-run grid but not the final net/stat explanation | “So… what am I supposed to take from this?” | **HIGH** | Fixed in-frame panel height + overflow hides the educational conclusion | Recompose the mobile panel so the final net/result is always above the fold; shrink/condense the stream once phase 4 starts and allow safe vertical scrolling if necessary. Add visual regression assertion for final metrics. |
| X-Ray has duplicate exit affordances | Stake-escalation X-Ray shows the normal top-right “I’m done” plus another “I’m done” inside X-Ray | “Which one am I supposed to press?” | **MEDIUM** | Cashout visibility rule only hides the external exit for strong Pings, not X-Ray | Hide the frame-level exit while X-Ray is open. Keep the X-Ray action as the single exit affordance for that moment. |
| Run 10,000 button is easy to miss | The feature is a tiny underlined text control below the main controls | “I didn’t know that did anything.” | **MEDIUM** | It was intentionally made quiet, but became visually too low-priority | Keep it secondary, but use a small clear pill/button treatment with a short “See the long run” cue. |
| Ordinary limit Ping copy is slightly awkward | “That’s the 3 you chose. Are you still done here?” reads less naturally than the stronger over-limit copy | “That sentence sounds weird.” | **LOW** | Authored copy family did not get the same polish as the strong intervention | Rewrite to natural speech, e.g. “That’s the 3 you chose. Still stopping here?” |
| My Reality is useful but form-heavy on mobile | The drawer contains Ledger, hard-time triggers, Payday plan and quit reason in one internally scrolling surface | “I’ll deal with this later.” | **MEDIUM** | Optional context was consolidated correctly, but every edit group is expanded at once | Keep one drawer but collapse secondary sections by default and surface the currently relevant section first. |
| Mobile homepage is long | Six large game cards plus atmospheric Pings create a long vertical page | “This is polished, but there’s a lot here.” | **LOW** | All games are intentionally visible on home | Keep all games visible. Reduce dead vertical spacing and keep intervention cards compact; do not hide games behind another page. |
| Purpose is clear, but visual first impression is still casino-heavy | Premium casino visuals dominate before the explanatory copy is read | “Is this actually gambling?” for the first couple of seconds | **LOW** | Intentional visual tension between casino realism and anti-gambling purpose | Do not redesign. Keep the strong hero sentence and game-purpose copy; user testing suggests the meaning lands within the first 30 seconds. |
| Reality Pings/X-Ray generally land well | Limit, stake escalation and behavior-specific messages appear at the relevant moment and use the event that just happened | “Yeah, I actually do that.” | **LOW / POSITIVE** | Shared director + real behavior telemetry | Protect with director unit tests, overload QA and copy-family tests. |
| Games no longer feel like one generic simulation | Slots, Sportsbook, Roulette, Video Poker and Scratch have separate mechanics, interaction loops and visuals | “These actually feel like the thing I use.” | **LOW / POSITIVE** | Game-specific engines and scene construction | Keep per-game browser QA, rapid-input tests and logic → animation assertions. |
| Payment/trial cannot be fully user-tested yet | RevenueCat/Paddle provider sandbox is not connected | “Can I actually pay for this?” cannot be answered from the current build | **BLOCKER** | External provider configuration is still missing | Configure real Paddle sandbox + RevenueCat offering/entitlement, then test success/cancel/failure/logout/login/second browser. Do not fake this. |
| Actual deployed product cannot be retested yet | CI candidate is green, but there is no accessible Git-native hosted project | Production behavior remains unverified | **BLOCKER** | Hosting account/project connection is not available through the connected Vercel scope | Import/connect the GitHub repo to a full-stack host, deploy exact release SHA, then rerun the full journey and console/network checks. |

## What is already working well enough to preserve

- The homepage now explains the product without a giant disclaimer.
- Every game has a clear behavioral purpose.
- Reality Pings are tied to real behavior instead of quote rotation.
- The Intervention Director prevents stacking.
- Strong interventions earn the interruption.
- X-Ray feels like an interpretation layer, not a lecture.
- Payday Shield is quiet and stays out of active gameplay.
- Trigger Fingerprint waits for repeated evidence.
- Recovery Progress rewards shorter/more controlled use, not longer sessions.
- Reality Receipt reinforces leaving.
- Game result logic controls visual results.
- Rapid clicking is protected at the logic level.
- Refresh/restore behavior is covered.
- Personal financial values were removed from analytics event payloads.

## Fix order

1. First-run friction.
2. Run 10,000 mobile conclusion.
3. Duplicate X-Ray exit action.
4. Run 10,000 discoverability.
5. My Reality progressive disclosure.
6. Copy polish.
7. Rerun complete browser/user journeys.
8. Leave payment/deployment blockers explicitly open until real external systems exist.


## Retest findings discovered after the first fix pass

| Finding | What happened | Likely user thought | Severity | Root cause | Fix |
|---|---|---|---|---|---|
| A 10,000-run sample can finish ahead and visually contradict the lesson | The fixed mobile panel correctly revealed the slot sample, but that sample ended +$9,178 | “Wait, doesn’t this prove I can come out ahead?” | **HIGH** | One finite sample can legitimately beat expectation because of variance, but the UI presented the sample net without the calibrated game model’s expected return | Show **sample result** and **model expectation** separately. Never rewrite the sample to force a loss. The expectation must be calculated from the actual calibrated rules. |
| My Reality save action can fall below the visible modal area | Collapsing optional sections improved the form, but the save control can still sit below the initial mobile viewport | “Did this save automatically?” | **MEDIUM** | Long editable drawer with non-sticky final action | Make the Save action sticky inside the drawer and keep it visible while scrolling. |
