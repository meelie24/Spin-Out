# Spin Out 69-section master-prompt compliance matrix

This is the release-candidate audit against `docs/MASTER_PRODUCT_PROMPT.md`, with later explicit owner directions treated as superseding earlier presentation requirements where they conflict.

**Audited branch:** `release/final-production-pass`  
**Current candidate before this documentation commit:** `bffa179a7ebd690d0eb24742264406e5b6e49dc9`  
**Rule:** “PASS” means the behavior exists in the release candidate and is covered by code and/or browser QA. “CONFIG REQUIRED” means the product code exists but a real external merchant/deployment credential is intentionally not fabricated.

| # | Master-prompt section | Status | Release-candidate evidence / note |
|---:|---|---|---|
| 1 | WHAT SPIN OUT IS | **PASS** | Browser-first pre-gambling Reality Run; real context feeds a finite simulated session and voluntary exit timing. |
| 2 | THE CORE EXPERIENCE | **PASS** | Setup → run → Pings → exit/timeout → urge check → real-world outcome → Money Kept is implemented. |
| 3 | DESIGN PHILOSOPHY | **PASS** | Premium, mature, cinematic brown/bronze product language; no therapy/PSA/SaaS treatment. |
| 4 | THE LANDING PAGE | **PASS — SUPERSEDED** | Owner’s 2026-09-18 direction intentionally replaces the old minimal Start-only landing with the premium game hub: liquid-glass sidebar, six visible game tiles, QUIT/symbol atmosphere, dismissible interventions. |
| 5 | FIRST-RUN REALITY SETUP | **PASS** | One-at-a-time setup collects the specified core context plus optional personalizers. |
| 6 | SETUP QUESTION 1 | **PASS** | Intended wager presets + custom amount. |
| 7 | SETUP QUESTION 2 | **PASS** | Gambling type selection exists; homepage game cards can preselect it and skip the redundant question. |
| 8 | SETUP QUESTION 3 | **PASS** | Trigger choices and optional custom reason. |
| 9 | SETUP QUESTION 4 | **PASS** | Available-until-income currency input + Not sure. |
| 10 | SETUP QUESTION 5 | **PASS** | Income timing quick choices + date. |
| 11 | SETUP QUESTION 6 | **PASS** | Primary obligation choices including no urgent obligation. |
| 12 | SETUP QUESTION 7 | **PASS** | Amount + due timing are handled in one progressive obligation surface. |
| 13 | OPTIONAL PERSONALIZER 1 | **PASS** | Optional first-name lender context and recent-help amount. |
| 14 | OPTIONAL PERSONALIZER 2 | **PASS** | Optional personal money goal with quick choices/custom path. |
| 15 | FINAL SETUP INTERACTION | **PASS** | Tactile 1–10 urge control transitions directly toward the run. |
| 16 | MAKE SETUP FEEL FAST | **PASS** | One decision at a time, auto-forwarding choices, no question-count progress bar. |
| 17 | MOTION SYSTEM | **PASS** | Short interaction transitions and larger scene transitions are implemented with reduced-motion fallback. |
| 18 | QUESTION ANIMATION | **PASS** | Selection commitment state compresses/locks the chosen card and recedes other options before advancing. |
| 19 | TRANSITION INTO THE REALITY RUN | **PASS** | Practice-deposit transition carries the intended amount into the game balance and retains real-life context. |
| 20 | REALITY RUN | **PASS** | Finite 900-second max, no visible countdown, no duration reward. |
| 21 | LEAVING THE RUN | **PASS** | Natural per-game exit is always available; voluntary exit ends immediately without confirmation. |
| 22 | PRIMARY BEHAVIORAL METRIC | **PASS** | Time to voluntary exit is stored and compared only against the same user. |
| 23 | ADDITIONAL ANALYTICS | **PASS** | Run timeline/events retain actions, stakes, balance/net changes, Ping timing/response, urge/outcome and exit data; internal run state also tracks losses/recoveries/largest loss. |
| 24 | GAME ENVIRONMENTS | **PASS** | Original slots, sports, casino, poker and lottery/scratch environments exist without cloning named operators. |
| 25 | IMPORTANT GAMEPLAY RULE | **PASS** | Finite practice economy; no prizes, redeemable currency, loot boxes, jackpots, daily rewards or endless retention loop. |
| 26 | TRIGGER PERSONALIZATION | **PASS** | Trigger-specific behavior/Ping families cover chase, win-money, boredom, rush, switch-off and habit. |
| 27 | REALITY ENGINE | **PASS** | Confirmed profile facts and computed financial consequences progressively enter the run. |
| 28 | REALITY PINGS | **PASS** | Distinct glass intervention surface, scale emphasis, game de-emphasis and immediate dismissal. |
| 29 | PING DISMISSAL | **PASS** | Whole Ping is one-click/tap dismissible, including during entry animation. |
| 30 | PING SOUND | **PASS** | Short distinct Web Audio cue plus mute; no casino jackpot/siren treatment. |
| 31 | REALITY PING VOICE | **PASS** | Short direct familiar language with contractions and non-corporate wording. |
| 32 | MESSAGE STRUCTURE | **PASS** | Fact/consequence/question structure is used where facts support it. |
| 33 | CAR EXAMPLES | **PASS** | Car-payment factual and recovery Ping paths are implemented. |
| 34 | RENT EXAMPLES | **PASS** | Rent/mortgage shortfall and recovery Ping paths are implemented. |
| 35 | CHILD / FAMILY EXAMPLES | **PASS** | Family/child-related goal and obligation context can enter Pings without inventing facts. |
| 36 | BORROWING EXAMPLES | **PASS** | Optional lender name/amount can drive factual lender Pings. |
| 37 | PAYDAY EXAMPLES | **PASS** | Income-date distance is calculated when fresh and used in payday context. |
| 38 | GROCERIES | **PASS** | Groceries can be an obligation/goal and is handled by the Reality Engine. |
| 39 | WORK | **PASS** | Work-hour style comparisons remain hypothetical rather than fabricated factual claims. |
| 40 | CHASING | **PASS** | Win-it-back path includes chasing/recovery/break-even logic. |
| 41 | RECOVERY MOMENTS | **PASS** | Break-even/recovery moments can trigger a stop-and-question Ping. |
| 42 | ESCALATION | **PASS** | Stake changes and escalation after Pings are tracked and can affect intervention logic. |
| 43 | REALITY PING FREQUENCY | **PASS** | Spacing, action-gap gating, severity and recent-category avoidance are implemented. |
| 44 | FINANCIAL ACCURACY | **PASS** | Money/shortfall math is centralized in tested engine functions; stale financial context is guarded. |
| 45 | HYPOTHETICAL COMPARISONS | **PASS** | Non-confirmed comparisons are phrased conditionally (for example, “could’ve”). |
| 46 | REALITY BACKGROUND | **PASS** | Obligation, goal, payday/shortfall context progressively appears behind the game. |
| 47 | BACKGROUND MOTION | **PASS** | Background prominence changes progressively without becoming the primary control surface. |
| 48 | PROGRESSIVE PERSONALIZATION | **PASS** | Returning/post-run data can add secondary goals and improve future Ping relevance. |
| 49 | RETURNING USERS | **PASS** | Profile reuse minimizes setup; stale/expired financial context is refreshed when needed. |
| 50 | ENDING A REALITY RUN | **PASS** | Voluntary, timeout and practice-balance endings resolve cleanly into post-run flow. |
| 51 | REAL-WORLD OUTCOME | **PASS** | No / Less than planned / Yes path records actual wager without shame language. |
| 52 | MONEY KEPT | **PASS** | Intended minus actual wager calculation, including factual overspend handling. |
| 53 | CONNECT MONEY KEPT TO REAL LIFE | **PASS** | Result can connect kept money to the user’s entered obligation/goal when mathematically relevant. |
| 54 | TIME-TO-EXIT PROGRESS | **PASS** | Recent exit average plus first-five vs recent-five Plus comparison use voluntary exits only. |
| 55 | RETURNING HOMEPAGE | **PASS — UPDATED** | New hub keeps returning-user Money Kept and recent-exit signal in the sidebar/hero while preserving game-first entry. |
| 56 | NO DAILY STREAK SYSTEM | **PASS** | No streaks, leaderboards, daily rewards or social competition. |
| 57 | PERSONALIZATION ENGINE | **PASS** | Profile, trigger, obligations, dates, lender/goal context and history feed deterministic personalization. |
| 58 | PING LEARNING | **PASS** | Local learning records shown/exits-after and post-Ping behavior; Plus exposes descriptive patterns without claiming causality. |
| 59 | MONETIZATION | **PASS — CONFIG REQUIRED** | Spin Out+ is $4.99/month or $29.99/year; core runs remain free. Current Plus delivers history, Money Kept/exit trends, trigger/Ping patterns, weekly readouts and cross-device history. Lemon Squeezy broad checkout + direct PayPal fallback are implemented; live merchant credentials/variants/webhooks are deployment configuration. |
| 60 | PAYWALL PLACEMENT | **PASS** | Paywall appears after help has been delivered or on Plus/history access; never inside an active run/Ping. |
| 61 | PRIVACY | **PASS** | Private context is not public/shared; local-first storage remains, with authenticated Supabase sync only for signed-in account use. |
| 62 | MOBILE EXPERIENCE | **PASS** | QA covers 320/375/390/430 widths; thumb-sized controls, responsive cards/Pings and playable run surface. |
| 63 | DESKTOP EXPERIENCE | **PASS** | Centered dominant run plus premium desktop game hub/sidebar; Pings overlay the simulation. |
| 64 | ACCESSIBILITY | **PASS** | Keyboard/focus handling, labels, mute, reduced motion, forced-colors QA and responsive text are covered. |
| 65 | REQUIRED PRODUCT STATES | **PASS** | Required free/premium/auth/setup/run/Ping/outcome/timeout/responsive states have explicit handling and CI coverage. |
| 66 | FAILURE / RELAPSE UX | **PASS** | Overspending/gambling is shown factually; progress is retained; no failure label or punishment. |
| 67 | FINAL REALITY PING CHECK | **PASS** | Ping candidates are fact-bound or explicitly hypothetical, short, de-duplicated and only shown at gated moments. |
| 68 | FINAL EXPERIENCE TEST | **PASS** | Automated mobile first-run QA executes the specified arc through setup, live run, exit, urge/outcome and Money Kept. |
| 69 | FINAL STANDARD | **PASS — RELEASE CANDIDATE** | Current release candidate passes core tests, typecheck, lint, production build, responsive/a11y browser QA, homepage prompt dismissal and game preselection. Production deployment verification is a separate release gate and is not claimed here. |

## Release gates outside the 69 product sections

- Latest functional candidate passed core tests, TypeScript, lint, production build and full browser QA before this documentation-only closeout.
- The temporary audit-bootstrap workflow is removed as part of closeout; the normal CI workflow remains.
- Live subscription charging is intentionally unavailable until real Lemon Squeezy and/or PayPal production credentials, product/variant IDs and signed webhook secrets are configured.
- Production Vercel deployment, production console/network inspection, and merge to `main` remain release gates. Do not mark those complete unless they are actually executed against the deployed artifact.
