# Spin Out In-Game Onboarding Spec

## Locked goal

Reduce mandatory onboarding to five high-value interactions, then let the user begin a Reality Run while the remaining context is collected one question at a time.

Exact sequence:

**Five essential questions → actual game screen visible → liquid-glass explanation → Start Reality Run → gameplay begins + one-question continuation onboarding appears.**

The continuation onboarding is never a full form, drawer, accordion, questionnaire page, or multi-question panel.

## Five-question gate

The first five interactions must be enough for a meaningful Reality Run even if the user never completes the rest.

1. **How much were you about to put in?**
2. Ask **What were you about to play?** only when the game is unknown. If the game is already known from the homepage card, use the freed interaction for **How bad do you want to play right now?**
3. **What were you hoping would happen?** Natural choices: Win some money; Win back what I lost; Kill some time; Feel something; Shut my brain off for a bit; Honestly, it's just habit; Something else.
4. **Realistically, what is this money for? If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?** Natural choices map to the existing obligation types. Amount and due date are deferred.
5. **Before you start, where do you want to stop?** 5 rounds; 10 rounds; 5 minutes; 10 minutes; I'll decide when I'm done.

When the game is unknown, the game-selection interaction replaces the starting-urge interaction so the total stays at five.

## Pre-run explanation

After question five, show the actual game screen behind a lightweight liquid-glass explanation. Gameplay is still inactive.

Heading: **That's enough to start.**

Desktop copy:
**The rest of your setup will stay beside the game. Answer these whenever you want throughout the gameplay. The more context you add, the more immersive your experience will be.**

Mobile copy:
**The rest of your setup will stay with you while you play. Answer these whenever you want. The more context you add, the more immersive your experience will be.**

One primary action: **Start Reality Run**.

The old FakeDeposit/deposit confirmation must not remain as another gate.

## Desktop continuation onboarding

After Start Reality Run, the game becomes active and the first remaining question appears beside it in a compact liquid-glass card.

Only one question is visible at a time.

Collapsed state is a thin liquid-glass **Finish your setup · N left** tab. Reopening restores only the current question.

No percentages and no generic progress bar.

## Mobile continuation onboarding

Mobile does not use a squashed desktop side card.

Use a compact liquid-glass **bottom dock** attached to the game viewport.

- Standard open height target: **110–140px maximum** for ordinary multiple-choice questions.
- Collapsed rail target: **42–46px**.
- Never become a large bottom sheet for ordinary questions.
- Keep gameplay visually dominant.
- Use compact answer chips, two-column choices, or horizontal scrolling before increasing height. Horizontal scrolling must have a deliberate edge fade so the next option reads as discoverable rather than accidentally clipped.
- Minimum practical touch target remains about 44px even when the visual control looks slim.
- Typography is system-first and sleek: about **16–17px semibold** question text, **14–15px** answer text, **11–12px** secondary labels.
- No decorative casino display font inside the dock.
- On the user's first meaningful game action, gently collapse the dock unless the user is interacting with it.
- Reality Ping, X-Ray, and other foreground interventions automatically collapse the dock first. Do not auto-reopen it afterward.

## Question completion motion

A completed continuation question disappears through a stylized 2D black hole in about one second:

1. save the answer first;
2. make it available to the active Reality Profile;
3. a dark circular distortion forms at the bottom-center of the question;
4. the card is pulled/compressed into it;
5. the hole pinches shut;
6. exactly three small liquid/glass droplets emerge;
7. the droplets fall and bounce against an invisible horizontal floor;
8. the next question appears immediately.

The three droplets should vary slightly in angle, timing, bounce height, and landing point. The result must feel premium, quick, strange, and controlled, not cartoony.

Reduced-motion users get a short fade/scale replacement with the same save/next behavior.

## Continuation questions

Use existing profile fields and conversational copy. Order should respond to prior answers.

Useful context includes:

- **When's more money coming in?**
- **About how much do you have to work with until then?**
- If an obligation exists: **You said the car payment. How much is it?**
- **When does it have to be paid?**
- **What are you trying to stop from happening again?**
- **Is there something you'd rather this money still be there for?**
- **When does gambling usually get harder to ignore?**
- **If you came up short, who would you probably call?**
- Conditional lender follow-ups only when relevant.
- Payday-plan context where useful.

“Not sure”, “Nothing specific”, and skips are valid answers and must count as completed so the product does not nag the user again.

## Data and behavior

Add explicit completion markers to the profile for continuation questions so a deliberate null/not-sure response is distinguishable from unanswered data. These markers must live inside the existing JSON profile so no Supabase schema change is required.

Every completed continuation answer must update local storage immediately and sync through the existing signed-in profile sync path.

The parent profile state used by RealityRun must update immediately so later Reality Pings, background context, and intervention logic can use newly added context in the same run.

Do not overuse personal information. Existing intervention cooldowns, suppression, intentional silence, and one-foreground-surface rules remain authoritative.

Returning users see only missing or genuinely stale continuation context.

## Copy rules

Use natural conversational American English. Contractions are preferred where natural.

Avoid clinical, corporate, therapeutic, financial-form, and AI-sounding language.

Do not use “No limit”; use **I'll decide when I'm done**.

## Verification

Primary comparison personas remain:
- genuinely trying to stop
- skeptical
- low patience
- returning
- mobile

These are simulated browser/persona journeys unless recruited humans are actually used.

Verify:
- time/clicks to gameplay;
- five-question gate only;
- no hidden deposit gate;
- intro clarity;
- voluntary continuation-onboarding use;
- same-run personalization;
- mobile dock height and game visibility;
- collapse/reopen;
- intervention priority;
- black-hole/droplet sequence;
- reduced motion;
- refresh/restore;
- signed-in profile sync path;
- all games;
- full QA, typecheck, lint, and production build.

Do not merge main as part of this feature. Continue the existing Netlify release path only after the feature candidate is fully verified.
