# Spin Out — User Test Round 2 Findings

**Baseline under test:** `release/final-production-pass` after the first user-test/permanent-fix pass.

**Purpose of this pass:** challenge the corrected build rather than repeat the first test. This round focuses on repeat exposure, skeptical-user trust, keyboard behavior, intervention fatigue, returning-user friction, and whether any educational surface accidentally nudges the person to remain in simulated gambling.

## What stayed strong from round 1

- The shorter first-run flow still gets to the useful part much faster.
- Every game keeps a distinct interaction loop.
- Reality Pings and X-Ray remain tied to behavior that just happened.
- The Intervention Director still prevents stacked foreground interruptions.
- The chosen-limit intervention still references the user's actual limit.
- Run 10,000 now separates a finite sample from the calibrated model expectation.
- My Reality keeps secondary context collapsed and its Save action visible on mobile.
- Payday Shield remains outside active gameplay.
- The exit receipt stays compact.
- Rapid input and active-run restore protections remain in the main QA suite.

## New findings before fixes

| Finding | What happened | Likely user reaction | Severity | Root cause | Required fix |
|---|---|---|---|---|---|
| Run 10,000 tells the user "Keep going." during its build animation | The second animation phase uses a direct gambling-continuation phrase before revealing the long-run lesson | "Why is the quit-gambling app telling me to keep going?" | **HIGH** | Animation copy was written for momentum rather than the product's behavioral goal | Replace directive language with neutral progression copy. Add browser regression that rejects "keep going" inside Run 10,000. |
| Intervention dialogs do not explicitly take keyboard focus | Reality Ping, X-Ray and Run 10,000 appear visually, but focus can remain on the underlying game control | Keyboard/switch user may continue interacting with the wrong layer or not know an interruption appeared | **MEDIUM** | These surfaces have dialog semantics but no focus-on-open behavior | Move focus into each dialog on mount, make the container programmatically focusable and retain the existing single-foreground behavior. |
| My Reality does not explicitly take focus | The modal opens visually while keyboard focus can stay on the underlying homepage control | "The panel opened, but Tab starts somewhere weird." | **MEDIUM** | Modal semantics were added without matching focus management | Focus the My Reality dialog when it opens. |
| Dismissed homepage Reality Pings immediately return after refresh/navigation | Dismissal only lives in component state | "I just cleared that. Why is it back already?" | **MEDIUM** | No same-visit dismissal memory | Remember dismissed home prompts for the browser-tab session only. Do not turn this into permanent suppression. |
| Post-run obligation card says money is "PROTECTED" after a self-reported no-gambling outcome | The product knows the person reports that they did not spend the money, but it cannot know the money is protected from later gambling | "You don't actually know it's protected." | **MEDIUM** | Copy overstates what the stored outcome proves | Keep Money Kept, but label the obligation amount as **AVAILABLE** rather than protected. |
| Core intervention frequency still looks disciplined | Director cooldowns and family suppression remain in place; overloaded states still select one foreground message | "It noticed something without hammering me." | **POSITIVE** | Shared intervention director | Preserve. |
| Progress language remains based on stopping behavior | Shorter exits, within-limit runs and leaving after chase cues are the tracked improvements | "It's measuring whether I leave, not how much I play." | **POSITIVE** | Recovery metrics are exit/control based | Preserve and continue regression coverage. |

## Round 2 regression cases

The following cases are being added to CI before fixes are applied:

1. A dismissed homepage prompt remains dismissed after a same-tab refresh.
2. Run 10,000 never displays directive "Keep going" copy.
3. Run 10,000 takes keyboard focus when opened.
4. Reality Ping takes keyboard focus when shown.
5. X-Ray takes keyboard focus when shown.
6. My Reality takes keyboard focus when opened.
7. A self-reported "No" outcome may show Money Kept but must not call the money "PROTECTED"; it should use truthful availability language.

## Release rule

Do not close this round from code inspection alone. The new regression suite must first fail against the baseline for the intended reason, then pass after the smallest production fixes, followed by the existing full CI/browser suite.
