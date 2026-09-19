# Spin Out production compliance matrix

Authoritative sources:
- `docs/MASTER_PRODUCT_PROMPT.md` — current 70-section production prompt supplied 2026-09-18.
- `docs/OWNER_OVERRIDES.md` — later owner decisions that supersede conflicting prompt requirements.
- `docs/GAME_CALIBRATION.md` — researched game-rule targets.

Status meanings:
- **PASS**: implemented and verified in current release-candidate code/CI or rendered screenshots.
- **PARTIAL / IN PROGRESS**: implementation exists but a required verification stage remains.
- **PENDING EXTERNAL**: requires a real third-party account/configuration/credential and is deliberately not fabricated.
- **SUPERSEDED**: later owner instruction replaces the original section.

| # | Requirement | Status | Evidence / remaining work |
|---:|---|---|---|
| 1 | PRIMARY CHAT GOAL | **IN PROGRESS** | Premium game hub, calibrated games, one-run Plus, RevenueCat layer and QA are implemented; Paddle sandbox and GitHub-native deployed verification remain. |
| 2 | STRICT VISUAL REFERENCES | **PASS** | Reference-driven homepage/sidebar composition is implemented and iterated through CI screenshots. |
| 3 | REFERENCE A — LIQUID GLASS SIDEBAR | **PASS** | Floating translucent sidebar, blur, internal highlights, active capsule/edge light and brown adaptation are rendered on desktop. |
| 4 | REFERENCE B — CHINESE CASINO VISUAL RICHNESS | **PASS** | Brown/oxblood/bronze adaptation retains dimensional ornamental game art rather than flattening the reference language. |
| 5 | CHINESE SYMBOL ACCURACY | **PASS** | Upright 福, square-holed Chinese cash coin, and sycee-inspired assets are deliberate original assets and checked in rendered homepage output. |
| 6 | ORIGINALITY DOES NOT MEAN LOWER QUALITY | **PASS** | Reference composition/material richness is adapted without copying proprietary artwork. |
| 7 | EVERY CASINO SYMBOL GETS THIS TREATMENT | **PASS — CURRENT INVENTORY** | Current primary inventory includes 7, BAR, cherry, lemon, plum, bell, gem, roulette, cards, sportsbook ticket, scratch ticket, coin, 福, and sycee; assets are custom SVGs. |
| 8 | SYMBOL VISUAL QUALITY | **PASS** | Primary symbols use layered fills, material highlights, outlines and shadows and remain legible at enlarged card scale. |
| 9 | SYMBOL STATES | **PARTIAL** | Result choreography exists per game; restrained symbol-level anticipation/win treatment exists mainly through reel/card/ticket result animation rather than bespoke states for every individual asset. |
| 10 | SPIN OUT COLOR SYSTEM | **PASS** | Espresso/dark chocolate/oxblood/cream/bronze/gold remain the core system; red is concentrated in interventions and selected gaming accents. |
| 11 | HOMEPAGE = MAIN GAME HUB | **PASS** | All six available Reality Run choices are visible and clickable directly on home. |
| 12 | HOMEPAGE BACKGROUND | **PASS** | QUIT appears at multiple scales/depths with controlled cropping rather than a plain gradient. |
| 13 | CASINO SYMBOLS IN THE BACKGROUND | **PASS** | Atmospheric symbol grid plus art-directed 7/coin/福/BAR depth layers sit behind the content. |
| 14 | RED HOMEPAGE PROMPTS | **PASS** | Distributed red-glass interventions are individually dismissible, animated, responsive and absent from active gameplay. |
| 15 | REMOVE SPORTS BETTING | **SUPERSEDED** | Owner explicitly retained Sportsbook on 2026-09-18 subject to realistic calibration. Sportsbook is now a fictional two-sided moneyline simulation with displayed odds and potential return. |
| 16 | EVERY GAME MUST LOOK LIKE A FINISHED CASINO GAME | **PASS — RC** | Slots, Sportsbook, Roulette, Video Poker and Scratch each have game-specific scene construction, controls, result choreography and audio. Screenshot loop materially enlarged/differentiated non-slot surfaces. |
| 17 | GAME LOGIC MUST CONTROL THE VISUALS | **PASS** | Game-specific engines compute the result first and pass the exact reel grid, wheel number/color, sports settlement, poker hand or scratch ticket to Phaser. |
| 18 | INDIVIDUAL GAME AUDIT | **PASS — LOCAL/CI** | QA opens each game separately, performs its actual interaction loop, checks console errors, screenshots mobile output and now tests rapid-input protection. |
| 19 | SOUND DESIGN | **PASS — SYNTHETIC ORIGINAL** | Reusable original Web Audio cues are game-specific for slots, roulette, sportsbook, poker, scratch and Reality Pings. |
| 20 | AUDIO ENGINE REQUIREMENTS | **PASS** | Shared engine, master mute, persistent preference, overlap control through action locking, gesture-triggered start and graceful no-asset dependency. |
| 21 | NEW USER 2-DAY TRIAL | **SUPERSEDED** | Owner replaced 48 hours with one full-Plus Reality Run capped by the existing 15-minute run maximum. |
| 22 | TRIAL SOURCE OF TRUTH | **PASS — OVERRIDE MODEL** | Supabase user_access stores claimed run ID/game/start/end/consumed timestamps server-side; paid access comes from RevenueCat premium. |
| 23 | TRIAL SECURITY | **PASS — OVERRIDE MODEL** | One-run trial is account/server bound; local storage, logout, browser changes and client clock do not create a new claim. |
| 24 | REVENUECAT IS REQUIRED | **IMPLEMENTED / CONFIG PENDING** | Current purchases-js SDK integrated; premium is the single canonical paid entitlement. Dashboard/provider config still needs real RevenueCat project values. |
| 25 | AUTHENTICATED REVENUECAT IDENTITY | **PASS IN CODE** | Supabase authenticated user ID is used as the RevenueCat App User ID. |
| 26 | REVENUECAT IS NOT THE CARD PROCESSOR | **PASS IN CODE / CONFIG PENDING** | Checkout is implemented through RevenueCat Web with Paddle Billing expected as the configured billing engine. |
| 27 | WHY THIS PAYMENT STACK IS BEING USED | **PASS** | Architecture keeps entitlement in RevenueCat and merchant/billing lifecycle in Paddle, with no legacy PayPal/Lemon provider code remaining. |
| 28 | PADDLE APPROVAL CONDITION | **PENDING EXTERNAL** | No approval is fabricated; production Paddle activation requires legitimate merchant approval for the actual product. |
| 29 | PADDLE SANDBOX FIRST | **PENDING EXTERNAL** | Code path is ready. Paddle sandbox account/product/price + RevenueCat Paddle config/import/offering/packages still require provider-dashboard setup. |
| 30 | PAYMENT SUCCESS TEST | **PENDING EXTERNAL** | Cannot claim until a real Paddle sandbox checkout activates RevenueCat premium for the authenticated test account. |
| 31 | CANCELLED PAYMENT TEST | **PENDING EXTERNAL** | UI handles RevenueCat UserCancelledError, but a real Paddle sandbox cancellation still must be observed. |
| 32 | FAILED PAYMENT TEST | **PENDING EXTERNAL** | Recoverable error UI exists; real Paddle sandbox failure flow still must be exercised. |
| 33 | REVENUECAT / PADDLE LIFECYCLE TESTING | **PENDING EXTERNAL** | Purchase/cancel/failure/persistence require configured sandbox provider accounts. |
| 34 | PAYMENT TRACKING | **PENDING EXTERNAL** | RevenueCat/Paddle dashboards are the intended operational source; real customer/subscription/revenue records begin only after sandbox/provider setup. |
| 35 | NEVER PUT SECRET PAYMENT CREDENTIALS IN THE CLIENT | **PASS** | Web SDK uses the intentionally public NEXT_PUBLIC_REVENUECAT_WEB_API_KEY; server REST lookup prefers REVENUECAT_SECRET_API_KEY. Secret selection is unit-tested and no secret is committed/client-exposed. |
| 36 | SERVER-SIDE ACCESS PROTECTION | **PASS** | Protected Plus and sync routes resolve server access; run sync requires paid premium or the exact claimed trial run ID. |
| 37 | HOMEPAGE TRIAL UI | **PASS — OVERRIDE MODEL** | Account/sidebar states show first run includes Plus, active trial minutes, paid Plus, or Core without deceptive urgency. |
| 38 | SUBSCRIPTION UX | **PASS IN CODE / PROVIDER CONFIG PENDING** | Branded modal states price/frequency/features/trial state and RevenueCat-Paddle checkout action. |
| 39 | GITHUB IS THE DEPLOYMENT SOURCE OF TRUTH | **PASS IN REPO / DEPLOY PENDING** | Release branch is canonical. No incomplete file-transfer deployment will be accepted. |
| 40 | DO NOT MERGE TO MAIN YET | **PASS** | main remains unmerged; release/final-production-pass is still the verification branch. |
| 41 | HOSTING PLATFORM | **PENDING EXTERNAL CONNECTION** | Owner-selected path is Netlify native GitHub integration. No Netlify account action is connected in this environment, so the release branch cannot be legitimately linked/deployed here and no Vercel path is considered. |
| 42 | DO NOT USE GITHUB PAGES FOR THE APP | **PASS** | No GitHub Pages deployment path is being used. |
| 43 | CUSTOM DOMAIN PATH | **READY / PURCHASE PENDING** | Code remains domain-configurable; final domain purchase/connection is intentionally not claimed. |
| 44 | CENTRALIZE SITE URL CONFIGURATION | **PASS** | NEXT_PUBLIC_SITE_URL and origin-derived return/callback paths are used instead of binding code to a preview hostname. |
| 45 | DEPLOYED SITE TESTING | **PENDING** | Local/CI browser matrix passes; full GitHub-native deployed URL testing, console and network inspection remain. |
| 46 | RESPONSIVE DESIGN | **PASS — CI** | 320/375/390/430/768/1024/1440 matrix plus the in-run mobile dock: <=140px open, <=46px collapsed, no 320px overflow, and desktop setup verified beside the game. |
| 47 | MOTION SYSTEM | **PASS** | Navigation/game/intervention/dismissal motion is differentiated; continuation setup uses the ~1s black-hole/three-droplet transition and reduced-motion substitutes a functional fade/scale path. |
| 48 | TYPOGRAPHY | **PASS** | Display, game labels, numeric/tabular values and interventions are separated; the compact setup dock uses a clean system-first stack with restrained 16–17px question / 14–15px answer / 11–12px secondary hierarchy. |
| 49 | LOADING STATES | **PASS** | Game loading, entitlement checking, checkout loading and premium access resolution avoid false paid/free flashes. |
| 50 | ERROR STATES | **PASS IN CODE / PAYMENT EXTERNAL PENDING** | Auth/game/network/payment fallbacks are recoverable; real Paddle sandbox errors still need provider verification. |
| 51 | ACCESSIBILITY | **PASS — CI** | Keyboard/focus, semantic controls, forced colors, responsive text, reduced motion and audio-independent messaging are tested. |
| 52 | PERFORMANCE | **PASS — CURRENT ASSET SET** | SVG game art, lazy Phaser import, lightweight generated audio and responsive rendering avoid heavy image bundles. |
| 53 | REMOVE “GENERATED APP” VISUAL TELLS | **PASS — SCREENSHOT REVIEW** | Homepage moved away from SaaS grid language; game cards use authored imagery/materials and varied desktop proportions. |
| 54 | VISUAL REFERENCE LOOP | **PASS — MULTIPLE ITERATIONS** | CI screenshots were inspected, compared, corrected, rerendered and inspected again for home and every game. |
| 55 | FUNCTIONAL TEST JOURNEY | **PARTIAL — EXTERNAL TAIL ONLY** | Core journey is automated including five-question entry, game-visible intro, one-question continuation, same-run personalization, every game and post-run flow. Authenticated deployed one-run Plus + real Paddle sandbox purchase still require external configuration. |
| 56 | FAILURE TEST JOURNEY | **PARTIAL — EXTERNAL TAIL ONLY** | LocalStorage bypass, stale/returning context, continuation persistence, intervention collapse, 320px dock, reduced motion, multi-tab lock, timeout, exhausted balance, presence failure and rapid input are covered; provider payment failures await sandbox. |
| 57 | PRODUCTION SECRETS | **PASS** | No production payment secrets are fabricated or committed. |
| 58 | FINAL IMPLEMENTATION ORDER | **IN PROGRESS — EXTERNAL STAGES** | Application code, onboarding rebuild, game calibration, trial/RevenueCat architecture and CI are green. Netlify native deployment, deployed auth, and provider sandbox lifecycle are the remaining stages. |
| 59 | HOMEPAGE ACCEPTANCE CRITERIA | **PASS — OWNER OVERRIDE APPLIED** | All games visible, Sports retained by override, premium symbols/background/prompts/sidebar and responsive views are implemented. |
| 60 | PER-GAME ACCEPTANCE CRITERIA | **PASS — CI RC** | Each current named game loads, resolves, animates, handles rapid input, mobile, sound, state and screenshots without console exceptions in latest green candidate. |
| 61 | TRIAL ACCEPTANCE CRITERIA | **PASS — OVERRIDE MODEL / AUTH LIVE TEST PENDING** | Schema and server resolver enforce one 15-minute first-run trial. A real authenticated test account still needs deployed end-to-end verification. |
| 62 | REVENUECAT ACCEPTANCE CRITERIA | **IMPLEMENTED / PROVIDER TEST PENDING** | SDK, stable user ID, premium abstraction and server checks are built. Real customer persistence requires RevenueCat config. |
| 63 | PADDLE ACCEPTANCE CRITERIA | **PENDING EXTERNAL** | Sandbox merchant/product/import/offering and successful/cancelled/failed checkouts are not yet legitimately configured/tested. |
| 64 | PAYMENT TRACKING ACCEPTANCE CRITERIA | **PENDING EXTERNAL** | Provider dashboards will expose the required operational lifecycle once Paddle/RevenueCat sandbox is connected. |
| 65 | AUDIO ACCEPTANCE CRITERIA | **PASS — CI** | Shared game-specific Web Audio, Reality Ping cue, master mute and persistent mute are implemented; persistence is in browser QA. |
| 66 | DEPLOYMENT ACCEPTANCE CRITERIA | **PENDING HOST CONNECTION** | GitHub branch/build is green. Native Git checkout, deployment env, real URL games/audio/mobile/console/network are outstanding. |
| 67 | DOMAIN ACCEPTANCE CRITERIA | **READY / CONNECTION PENDING** | Domain-sensitive code is configurable; temporary Git-native deployed URL and final DNS connection remain. |
| 68 | FINAL VISUAL QUESTIONS | **PASS — RELEASE CANDIDATE** | Latest inspected renders show the liquid-glass hub, differentiated games and compact in-run onboarding; mobile dock footprint and desktop beside-game placement are browser-verified in the green candidate. |
| 69 | FINAL COMPLETION REPORT | **CI REPORT CURRENT / PRODUCTION REPORT PENDING** | USER_TEST_FINAL_REPORT.md reflects the verified application-code SHA and CI results. Production completion still waits for Netlify deployed URL/auth and provider sandbox evidence. |
| 70 | FINAL DEFINITION OF DONE | **NOT YET** | Automated/local green is insufficient by design. Paddle sandbox + RevenueCat lifecycle + GitHub-native deployed verification remain mandatory. |

## Current release blockers

1. Connect the GitHub repository to Netlify through native Git integration and enable a branch deploy for `release/final-production-pass`.
2. Configure the Netlify candidate environment, including the public RevenueCat Web key and server-only `REVENUECAT_SECRET_API_KEY`.
3. Configure a real Paddle **sandbox** merchant/product/prices and connect it to a RevenueCat Paddle web config.
4. Create/import the monthly and annual products, attach them to the single `premium` entitlement, and expose them through the current offering.
5. Run successful, cancelled and failed sandbox checkout journeys against a real authenticated Spin Out account.
6. Exercise the deployed URL on desktop/mobile, verify the one-run Plus account flow, and inspect production console/network behavior.
7. Only then promote that exact verified commit to `main`.

No provider credential, merchant approval, deployed URL, or payment result is treated as successful until observed.
