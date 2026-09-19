# Spin Out — User Test + Permanent Fix Final Report

**Verified application-code SHA:** `9c15fab317276fb3368a06f0db3538f4e0cb1e24`  
**Branch:** `release/final-production-pass`  
**GitHub CI run:** `35412505503`  
**Status:** verified CI release candidate; deployed/auth/payment release gates remain.

The code candidate passes core tests, TypeScript, lint, production build, responsive browser QA, accessibility checks, every game loop, intervention QA, rapid-input/restore QA, Run 10,000, and the rebuilt in-game onboarding journeys.

## Current first-run experience

The first-run structure is now:

**Five essential questions → game visible → “That’s enough to start” glass explanation → Start Reality Run → one optional continuation question at a time while the game is live.**

The old mandatory financial-detail sequence and separate deposit/load gate are gone from the path.

On desktop the continuation setup is a compact glass card beside the game. On mobile it becomes a 110–140px glass dock that collapses to 42–46px. The user never opens a large secondary onboarding form.

Each continuation answer is persisted before its completion motion, then the question is consumed by the one-second 2D black-hole effect with three glass droplets. The next question enters immediately. Reduced-motion users get the same functional progression without the black-hole/droplet motion.

## Permanent controls now in CI

| Area | Current control |
|---|---|
| Mandatory onboarding length | Known-game browser journey must reach the game after five high-value interactions. |
| Hidden extra gates | QA fails if the retired deposit terminal appears after the five questions. |
| Pre-run explanation | Actual game surface must be visible behind the one-CTA intro. |
| One-question setup | QA asserts exactly one continuation question at a time. |
| Mobile footprint | 390px/320px checks enforce <=140px open dock, <=46px collapsed rail and no page overflow. |
| Scroll affordance | Horizontal choices must expose a deliberate edge fade. |
| Gameplay priority | First meaningful action and foreground interventions collapse optional setup. |
| Same-run personalization | New bill context must appear in the current active run and active-run envelope. |
| Persistence | Completion markers distinguish unanswered from “Not sure”/skip and survive restore. |
| Returning users | Known legacy/current context is respected; completed users are not re-questioned. |
| Black-hole motion | Exactly three droplet elements are asserted; reduced-motion hides the effect and still advances. |
| Strong interventions | Strong Reality Ping uses neutral **Continue run**, not “Keep going.” |
| Accessibility | Reality Ping, X-Ray, Run 10,000 and My Reality take focus; reduced motion remains functional. |
| Truthful outcome copy | Self-reported unspent money is AVAILABLE, never claimed to be permanently protected. |
| RevenueCat server auth | Server lookup prefers `REVENUECAT_SECRET_API_KEY`; Web SDK continues to use the public web key. |

## Same-persona comparison

This remains simulated persona/journey testing rather than recruited-human interviews.

**Genuinely trying to stop:** the first five questions now provide enough immediate anchors for a useful run without demanding the entire financial/personal profile first. Adding more context during play changes the same run.

**Skeptical:** “more immersive” is supported by observable product behavior. Newly supplied context becomes part of the live run rather than disappearing into a profile form.

**Low patience:** the user reaches the actual game after five answers, sees that they have arrived, and has only one start action before gameplay. The optional dock collapses as soon as they start using the game.

**Returning:** the experience keeps known answers and asks only for missing/stale context.

**Mobile:** the game remains visually dominant. Optional setup is a thin control surface rather than a half-screen sheet, including at 320px.

## What remains outside CI

### Netlify

The owner-selected deployment route is Netlify native GitHub integration. The exact release candidate still needs to be connected and deployed as a branch deploy, then exercised on the real HTTPS candidate URL.

This environment does not have a connected Netlify account action, so no deployment URL or deploy result is being fabricated.

### Authentication / one-run Plus

A real account on the Netlify candidate must verify:
- first authenticated Reality Run gets the one-run Plus trial
- reload/logout/second browser do not mint another trial
- finishing the first trial returns later runs to Core unless paid premium is active
- protected sync/Plus routes enforce server access

### Paddle + RevenueCat

RevenueCat Web is the entitlement/purchase SDK and Paddle is the intended billing engine/merchant of record. The code now separates the public Web SDK key from the server-preferred secret REST key.

Real provider work still requires:
- Paddle sandbox account/product/prices
- RevenueCat Paddle web config
- imported products
- `premium` entitlement
- offering/packages
- successful sandbox checkout
- cancelled checkout
- failed/recoverable checkout
- paid entitlement persistence across reload/login/second browser

No mocked purchase counts as verification.

## Release conclusion

The application code has reached the verified CI release-candidate goal for this build, including the rebuilt onboarding requested after the earlier user test.

It is **not yet production-verified** because the remaining gates require external account state: Netlify native Git deployment and real Paddle/RevenueCat sandbox behavior. `main` remains untouched until those gates pass.
