# Spin Out :  linked behavior and explanation research addendum

Research observed on **2026-09-19**. Repository: `meelie24/Spin-Out`; working branch supplied by the coordinating agent: `release/final-production-pass`. This is a read-only research contribution, prepared for the existing implementation and the original research-first brief. It does not certify a release or retrospectively prove that earlier code changes followed the research gate.

## Evidence boundaries and counts

**Public-page observation** means fetched text from the current official public page. **Documented flow** means current official instructions describing what a user sees and does. Neither means that this researcher completed an authenticated or installed-app session. Research findings below come from the original publication, official standard, or its authors' paper; expert guidance is identified separately from experiments. Older material is foundational evidence, not proof of a product's current behavior. Undated documentation was observed on the date above; a current copyright is not treated as a publication date.

| Brief category | Linked coverage here | What remains unverified |
|---|---|---|
| Run 10,000 | 10 distinct consumer analytics experiences, A01–A10; 10 distinct visualization/statistical/explanation sources, V01–V10 | Hands-on comparison of those installed/account flows; Spin Out human comprehension |
| CTA | 15 distinct consumer brands, C01–C15, with exact short labels; 8 distinct copy/HCI/experimentation sources, T01–T08 | Conversion effects of the labels; authenticated CTA flows beyond official instructions |
| Pings | 16 distinct research publications, P01–P16, including gambling, attention, and behavior change; 3 documented current information-delivery examples | Spin Out real-world intervention efficacy, recall, or long-term gambling outcomes |
| High urge / low patience | 10 distinct task experiences, U01–U10, across transport, delivery, translation, music, utility, emergency access, finance and travel; 11 research/guidance sources, H01–H11 | These are task-entry benchmarks, not ten completed first-install onboarding studies; observed abandonment and time-to-value in Spin Out |

Sources reused for a genuinely different question are explicitly cross-referenced. Counts are within each category, not a claim that every citation in the document is globally unique. Apple Clock, Shazam and Emergency SOS are distinct task experiences, not three independent companies. Notion and Dropbox serve personal and organizational users; only their public self-service consumer entry actions are included. No product is declared a universal leader or a proven conversion winner merely because it appears here.

The numerical documentary source minima are met. The brief's stronger request to inspect complete current interactions is **only partly satisfied**: public entry surfaces and official documented interactions were inspected; third-party session recordings and authenticated end-to-end interaction measurements were not produced. That gap must remain visible in any final release report.

## A. Run 10,000 :  ten consumer analytics experiences

| ID / primary source and freshness | What the documented user sees and does; effort and payoff | Transfer to Spin Out; limit |
|---|---|---|
| A01 [Copilot Cash Flow](https://help.copilot.money/en/articles/9682232-cash-flow-tab-overview), updated 2026-02-20 | Opens income, spending and net-income summaries; changes date range; taps chart bars or View More to inspect categories/transactions. Historical totals exclude future unpaid recurring transactions. | Separate observed history from projected events; compare equivalent periods. A visible detail control is more discoverable than copying its additional double-tap gesture. |
| A02 [Apple Health data and trends](https://support.apple.com/guide/iphone/view-your-health-data-iphe3d379c32/ios), current guide, undated | Summary contains highlights and detected trends; tap a graph for detail, or browse a category and choose weekly/monthly/yearly views. Trend information identifies magnitude and duration. | Give the takeaway before detail, with an explicit comparison window. A health trend is not a guarantee about the next observation. |
| A03 [Google Fit activity](https://support.google.com/fit/answer/6090183?hl=en), current help, undated | Home provides activity summaries; a metric opens day/week/month detail. Calories are explicitly estimates using activity, profile variables and basal metabolism. | Label estimates and inputs close to the number. Do not present a modeled amount as a measured personal fact. |
| A04 [Tesla Model 3 Energy](https://www.tesla.com/ownersmanual/model3/en_us/GUID-4AC32116-979A-4146-A935-F41F8551AFE6.html), current manual, undated | Energy → Drive compares colored actual consumption with a gray prediction; switches Trip/other reference comparisons. Range projections can use 10/100/200-mile consumption windows. | Actual, predicted and reference values need separate names and encoding. State the model's conditions; do not copy a vehicle-specific averaging interval. |
| A05 [YouTube Analytics](https://support.google.com/youtube/answer/9002587?hl=en), current help includes July 2026 rollout notice | Overview supplies key performance and comparison reports; Advanced Mode supports deeper comparison/export. Estimated revenue is distinguished from finalized earnings. | Distinguish sample output, expectation and settled/observed totals. Do not imply that every report is available on every device. |
| A06 [Apple Weather forecasts](https://support.apple.com/guide/iphone/check-the-weather-iph1ac0b35f/ios), current guide, undated | Current conditions precede hourly and ten-day forecasts; tap forecast for condition detail; Averages compares today with history. Location/units can be changed. | Distinguish present observation, future forecast and historical reference. Do not copy horizontal-only access for essential answers. |
| A07 [Oura Readiness](https://ouraring.com/blog/readiness-score/), published 2026-05-07 | A single score opens an explanation of contributors and longer-term patterns; the article advises attending to trends rather than isolated daily values. | A prominent summary earns its place through explainable inputs and context. Do not invent a clinically meaningful Spin Out score or copy a 0–100 scale to imply precision. |
| A08 [Monarch Forecasting](https://help.monarch.com/hc/en-us/articles/48344305092244-Forecasting-in-Monarch), updated 2026-09-01 | Build a forecast → review household/income/account assumptions → inspect future cash-flow/net-worth scenarios and edit assumptions. It requires more setup than a basic report. | A scenario is conditional on inputs; expose assumptions without making every reader edit them first. Do not import a retirement-planning intake into a short simulation. |
| A09 [Strava Performance Predictions](https://support.strava.com/en-us/articles/15401591-performance-predictions), updated “this week” when observed; model change dated 2025-09-23 | Progress shows predicted race times and 1/3/6-month history. Eligibility requires sufficient run history; predictions assume flat terrain and can remain unchanged when recent data is insufficient. | Show data sufficiency, model scope and stale results honestly. Do not present unavailable personal data as zero or silently treat cached values as fresh. |
| A10 [RescueTime Dashboard](https://help.rescuetime.com/article/30-dashboard), updated 2026-06-12 | Recorded time, productivity score and categories appear first; day/week/month/year and work/all-hours controls change the comparison; detail explains patterns and calculations. | Keep recorded activity distinct from a derived score, with visible period and denominator. A simulation summary is not a bank balance. |

These examples repeatedly separate the headline, its reference period and a route to explanation. They do **not** establish that one specific layout causes comprehension or that every product renders uncertainty well.

### Visualization and statistical communication: ten sources

| ID / source | Evidence and decision supported | Limits |
|---|---|---|
| V01 [Hullman, Resnick & Adar, 2015, hypothetical outcome plots](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0142444) | Controlled visualization studies found advantages for showing sampled outcomes on particular multivariable comparison tasks. A sample should be presented as one possible draw from variability. | Task-specific; does not require autoplay, animated charts, or claim that a single path estimates the whole distribution. |
| V02 [ONS: uncertainty and measurement](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/uncertaintyandhowwemeasureit) | Official statistical explanation distinguishes sampling variation, confidence intervals and other error. State what an interval actually describes. | A survey-estimate confidence interval is not an individual gambler's future-outcome range. |
| V03 [UK Analysis Function: charts](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/), published 2022-05-19 | Official guidance connects chart choice to the question, meaningful labeling and accessible alternatives. | General communication guidance, not evidence of gambling behavior change. |
| V04 [W3C: complex images](https://www.w3.org/WAI/tutorials/images/complex/) | A complex chart needs identification plus an accessible account of essential values, relationships and trends. | An accessible name such as “chart” alone does not provide the information. |
| V05 [NIST: four principles of explainable AI](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=933399), 2021 | Explanation should be understandable to its audience, faithful to the process and explicit about knowledge limits. | Used by analogy for a finite simulation; this is not evidence that Spin Out uses AI or that a disclaimer makes a model correct. |
| V06 [CDC Clear Communication Index user guide](https://www.cdc.gov/ccindex/pdf/clear-communication-user-guide.pdf), 2019 | Explain numerical meaning, use familiar units, calculate for the reader and keep denominators consistent; pretest with the intended audience. | A checklist score is not a comprehension test or a product-quality score. |
| V07 [NIST TN 1297, reporting uncertainty](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-7-reporting-uncertainty), 1994; archived guidance | Reporting an uncertainty interval requires explaining its basis and method. | Foundational metrology guidance; do not attach “95%” to an arbitrary band or one run. |
| V08 [Segel & Heer, 2010, narrative visualization](https://idl.uw.edu/papers/narrative) | Original visualization analysis describes the balance between an authored explanation and reader exploration. | Taxonomy/design analysis; not an experiment proving Spin Out's preferred order. |
| V09 [Heer & Bostock, 2010, graphical perception](https://idl.uw.edu/papers/crowdsourcing-graphical-perception) | Original experiments study how visual encodings and display choices affect judgments. Treat chart readability as a task outcome, not decoration. | Results do not certify an unseen mobile chart or a particular palette. |
| V10 [Kay, Kola, Hullman & Munson, 2016, uncertain bus arrival](https://www.mjskay.com/papers/chi_2016_uncertain_bus.pdf) | Original small-screen uncertainty work distinguishes prediction intervals from uncertainty in estimates and studies discrete outcome representations. | Bus-arrival tasks differ from gambling; a quantile-dot redesign would need its own justification and testing. |

### Decision record: explanation and its existing dialog

**Problem / user signal:** The user asks for immediately understandable long-run information and a verified product. The current source snapshot shows a user-triggered `Run 10,000` action that calls `simulateLongRun` with game, stake, decision and seed, then opens `LongRunExperience`. This research does not itself establish that its existing chart is misunderstood. Any such claim must cite the coordinating agent's rendered review or actual study.

**Current behavior:** A separate result overlay is opened from an active run. Other questions receive a foreground-open flag. The source is enough to identify model inputs and the need to preserve the game state; it is not enough to validate every displayed statistic.

**Relevant leaders / repeated pattern:** A04 separates actual and predicted; A08 exposes assumptions; A09 explains model boundaries; A01 and A05 distinguish recorded/finalized data from future/estimated values. V01–V10 support precise labels, appropriate visual encoding and accessible explanation.

**Decision:** Keep the existing feature and casino identity. Prioritize a plain-language takeaway; explicitly distinguish the displayed sample from model expectation; state the play count and fixed stake; make assumptions and fuller explanation reachable. Audit and repair the existing dialog's keyboard behavior. This is not a request to add new forecast types.

**Do not copy:** A single opaque score; a guaranteed-loss or guaranteed-return headline; a confidence band without a calculation; invisible gestures as the sole route to explanation; a financial-planning questionnaire.

**Acceptance criteria:**

1. The presented sample and expected/model result use different labels. The count, unit, stake and sign of gain/loss agree across headline, chart and detail. A sampled path is never described as the user's predicted personal future.
2. Fixed-seed result checks validate displayed arithmetic. A 10,000-play model must disclose any assumptions about continued staking rather than imply a finite starting balance could fund every path.
3. Unknown personal context is absent or explicitly unknown. It is never coerced to a real zero. Forecast and practice values never appear as actual funds saved or paid.
4. Essential information has a text equivalent; color and animation are supplementary. Reduced-motion mode retains the same takeaway.
5. The modal follows [W3C's dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): appropriate initial focus, contained Tab/Shift+Tab, inert background, visible close, Escape closure and logical focus restoration. A rerender must not repeatedly steal focus from the user's selected control. Large content can start with focus on a static heading to preserve reading order.
6. At 320px and the supplied reference widths, the takeaway, labels and close control remain readable and reachable without horizontal page overflow. A real rendered before/after comparison is required; the papers do not supply it.

## B. CTA :  fifteen current consumer brands

The short strings below are exact text observed on current official public pages on 2026-09-19. Region is US unless the page redirected as noted. They describe observable wording, not a conversion result. Purchase means purchase-flow entry, not a verified completed transaction. Task entry is kept separate from an in-product mutation.

| ID / brand and source | Exact observed labels | Category and context | Spin Out lesson / limit |
|---|---|---|---|
| C01 [Apple](https://www.apple.com/iphone/) | “Buy”; “Learn more” | Purchase entry; navigation, beside a product | The surrounding object makes a short verb specific. Do not make a practice exit sound like a real payout. |
| C02 [Spotify](https://www.spotify.com/us/premium/) | “Try 3 months for $0”; “Get Premium Duo” | Acquisition/trial; paid-plan entry | Trial wording relies on nearby eligibility and renewal terms. Do not copy a temporary offer or hide terms. |
| C03 [Netflix](https://www.netflix.com/) | “Get Started”; “Sign In” | Acquisition, following an email field; account | A generic acquisition verb can rely on page context; it does not justify vague in-game decisions. |
| C04 [Airbnb](https://www.airbnb.com/) | “Log in or sign up”; “Become a host” | Account; acquisition for a distinct role | Name different tasks clearly; do not merge optional personalization with authentication. |
| C05 [Uber](https://www.uber.com/us/en/) | “See prices” | Quote/navigation after pickup and destination fields | Describe the next result; a price quote is not the same commitment as booking. |
| C06 [DoorDash](https://www.doordash.com/) | “Find restaurants”; “Get DashPass” | Discovery/navigation; subscription entry | Separate the user's immediate task from subscription acquisition. |
| C07 [Headspace](https://www.headspace.com/) | “Try for free”; “Log in” | Trial/acquisition; account | Free-entry language is a commercial promise that requires real terms; it is not an intervention efficacy claim. |
| C08 [Strava](https://www.strava.com/) | “Join Us Now”; “Log In” | Acquisition; account | Community invitation and account access have different jobs. Do not import urgency into a voluntary question. |
| C09 [Canva](https://www.canva.com/) | “Start designing”; “Log in” | Product-benefit acquisition entry; account | Entry copy can name the desired activity. The observed design-entry link leads toward signup, so this is not evidence of an immediate editor action. |
| C10 [Notion](https://www.notion.com/) | “Get Notion free”; “Log in” | Self-service acquisition; account | Separate acquisition from established-user access; B2B demo wording was excluded. |
| C11 [Dropbox](https://www.dropbox.com/) | “Try Dropbox free” | Self-service acquisition | A trial CTA is not interchangeable with Save, Close or a gameplay action. |
| C12 [PayPal](https://www.paypal.com/us/home) | “Send Money”; “Get Paid”; “Get the app” | Task-entry links; acquisition | Opposite directions of a transaction need distinct verbs. These public links do not prove money was sent. |
| C13 [Wise](https://wise.com/us/) | “Send money”; “Sign up”; “Log in” | Transfer-task entry after a quote; account creation; account access | Make the intended action and amount/context understandable before commitment. |
| C14 [Nike UK](https://www.nike.com/gb/) | “Join Us”; “Sign In” | Membership acquisition; account | Localized public page; do not present this as a verified US variant. |
| C15 [IKEA USA](https://www.ikea.com/us/en/) | “Shop new arrivals”; “Discover all the new products” | Shopping/discovery navigation | An object clarifies navigation. A shop link does not itself buy anything. |

**In-product category:** Apple's current [Clock instructions](https://support.apple.com/guide/iphone/set-timers-iph8241d6b2a/ios) document “Start” after the duration, then “Pause” and “Resume” for an existing timer. These are state-changing in-product actions, unlike the marketing entry links above. Apple remains one brand in the fifteen-brand count. This extra documentation prevents treating all homepage CTAs as if they had the same function as Spin Out controls.

### Eight copy, HCI and experimentation sources

| ID / source | Type and usable finding | Limit |
|---|---|---|
| T01 [GOV.UK buttons](https://design-system.service.gov.uk/components/button/) | Official writing/design guidance: describe the action, use sentence case, establish a clear primary action. | Not a claim that a certain word or button color improves conversion by a fixed amount. |
| T02 [Microsoft text formatting](https://learn.microsoft.com/en-us/style-guide/text-formatting/formatting-common-text-elements), updated 2025-03-26 | Official copy guidance: consistent sentence-style capitalization for interface text. | Consistency guidance, not an A/B test; intentional title treatments can have a separate typographic role. |
| T03 [W3C link purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html) | Accessibility explanation: purpose must be understandable from link text or its programmatic context. | Does not require an essay on every button or validate an arbitrary accessible name. |
| T04 [Nielsen, button naming and order](https://www.nngroup.com/articles/ok-cancel-or-cancel-ok/), 2008-05-26 | Original expert HCI guidance: meaningful action names and platform consistency matter more than a universal left/right rule. | Expert guidance, not a controlled Spin Out experiment. |
| T05 [Kohavi, Henne & Sommerfield, controlled web experiments](https://exp-platform.com/Documents/GuideControlledExperiments.pdf), 2007 | Original experimentation methods: randomized comparisons, clear outcome definitions, sufficient power and disciplined interpretation. | Supports testing; does not supply a universally winning first-person CTA. |
| T06 [CDC communication guide](https://www.cdc.gov/ccindex/pdf/clear-communication-user-guide.pdf), 2019 | Research-informed guidance: one main message and a clear action, with audience pretesting. | A checklist cannot substitute for the intended audience's comprehension. |
| T07 [W3C cognitive usability](https://www.w3.org/TR/2021/NOTE-coga-usable-20210429/), 2021 | Supplemental Working Group Note/work in progress: clear words, visible control purposes, short critical paths, and limited interruptions. | Not a normative WCAG success criterion and not a conversion experiment. |
| T08 [Microsoft button guidance](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons) | Official interaction guidance: concise, specific action labels; allow sufficient room for translated/longer text. | Desktop sizing examples are not universal mobile constraints. |

### Decision record: labels that describe the actual action

**Problem / signal:** The user explicitly requires modern, clear copy and separation of action types. The inspected `Landing.tsx` has game-specific titles linked to `/play?game=…`, an “Enter Reality Run” label, “My reality”, and distinct subscription/help links. `RealityRun.tsx` has game-dependent action and exit labels, sound-state labels and “Run 10,000”. No source here establishes that changing every existing label would improve the product.

**Decision / repeated pattern:** Keep acquisition, account, navigation, simulation and edit/save actions distinct. Evaluate a label with the surrounding game title and the actual next screen. Preserve “MAKE IT MORE IMMERSIVE” and “NOT NOW” as required by the brief. Change a label only when its observable result contradicts the promise or the rendered treatment hides its purpose.

**Anti-patterns / do not copy:** Trial sales tactics in a therapeutic-adjacent choice; vague “Continue” when two different outcomes are possible; fake urgency; first-person wording justified by a famous A/B anecdote; “Cash out” that implies redeemable funds.

**Acceptance criteria:** All visible CTAs map to a documented result; accessible names include the action and necessary object; visually identical primary controls do not compete within a single decision; copy remains readable at 320px and 200% text zoom; disabled actions are understandable; saved edits, unsaved dismissal and temporary postponement are different states. Track task success, mistaken taps, abandonment, trust and understanding before declaring a conversion win. Synthetic reviewers may flag copy risks but cannot establish consumer conversion rates.

## C. Pings :  gambling, attention and behavior-change evidence

These sixteen publications were reviewed as original sources. They support bounded design choices and expose uncertainty; none validates Spin Out as a treatment.

| ID / source and design | Finding relevant to the existing intervention | What it does not establish |
|---|---|---|
| P01 [Bjørseth et al., 2021 systematic review/meta-analysis](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2020.601800/full), 18 studies | Pop-up interventions showed aggregate short-term cognitive/behavioral effects, with substantial variation across designs and contexts. | Uniform efficacy, durable behavior change, or the optimal Spin Out message. |
| P02 [Auer & Griffiths, 2015 enhanced pop-ups](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00339/full), operator data before/after | Enhanced messages combined several components; session stopping after the threshold was still uncommon. | A clean randomized effect of personalization alone. Sessions are not distinct participants; the design is quasi-experimental. |
| P03 [Wohl et al., 2013 limit reminders/animation](https://link.springer.com/article/10.1007/s10899-012-9340-y), 72 participants, simulated gambling | Reminder and educational-animation conditions supported preset-limit adherence; combining them did not add benefit in that experiment. | That more simultaneous interventions are better or that effects generalize unchanged to live gambling. |
| P04 [Gallagher et al., 2011 VLT messages](https://link.springer.com/article/10.1007/s11469-009-9259-4), online 2009, 54 participants | A small field intervention reported changes in self-reported gambling and faulty beliefs. | Precise general-population effects or objective long-term expenditure reduction. |
| P05 [Auer & Griffiths, 2013 voluntary limits](https://link.springer.com/article/10.1007/s10899-012-9332-y), observational operator data | Voluntary limit setting was associated with subsequent behavior, with differences across gambling types. | Causation free of self-selection; one limit or timing rule suitable for every game. |
| P06 [Rodda et al., 2019 planning trial](https://link.springer.com/article/10.1007/s10899-019-09873-w), exploratory RCT, 184 participants | A brief planning intervention did not improve overall adherence at post-test or follow-up; subgroup findings were narrower. | A defensible claim that an extra planning step necessarily improves the main outcome. |
| P07 [Byrne & Russell, 2020, informative EGM interfaces](https://link.springer.com/article/10.1007/s10899-019-09889-2), online 2019, 213 participants, simulated EGM | Informative displays/pop-ups improved some estimates; total spending and dissociation did not differ. | That clearer monetary information automatically reduces gambling expenditure. |
| P08 [Santos et al., 2025 expenditure estimation](https://link.springer.com/article/10.1007/s10899-025-10405-y), 187 customers, survey linked to records | Past/future expenditure estimates were inaccurate; relationships with impulsivity and gambling risk motivate clearer concrete amounts and time periods. | A causal trial of personalized Pings or a clinical diagnosis from a user's tapping behavior. |
| P09 [Broda et al., 2008 deposit limits](https://link.springer.com/article/10.1186/1477-7517-5-27), two years of 47,000 sports-betting accounts | Exceeding operator deposit limits marked a small, distinctive high-intensity group; outcomes were mixed. | That displaying a limit, without enforcement or context, prevents harm. |
| P10 [Nahum-Shani et al., JITAI design principles](https://link.springer.com/article/10.1007/s12160-016-9830-8), online 2016 / journal 2018 | Framework connects intervention type, amount and timing to changing need and receptivity. | An empirically optimal timing threshold for Spin Out; a framework is not an efficacy trial. |
| P11 [Mark, Gudith & Klocke, 2008 interruption cost](https://interruptions.net/literature/Mark-CHI08.pdf), controlled task study | Participants compensated through faster work while reporting more stress, frustration, effort and time pressure. | A universal recovery duration or that every interruption reduces output speed. |
| P12 [Altmann, Trafton & Hambrick, 2014 momentary interruptions](https://interruptions.net/literature/Altmann-JExpPsycholGen14.pdf), online 2013, sequential-task experiments | Even brief interruptions increased sequence errors in the tested procedural task. | A fixed error multiplier in gambling or a rule that all brief messages must be removed. |
| P13 [Bailey & Konstan, 2006 attention-aware systems](https://interruptions.net/literature/Bailey-CHB06_1.pdf), controlled experiment, 50 participants | Presenting peripheral material during tasks was more disruptive than at boundaries, across performance and affect measures. | A universal timing delay or direct proof of gambling cessation. |
| P14 [Adamczyk & Bailey, 2004 interruption timing](https://interruptions.net/literature/Adamczyk-CHI04-p271-adamczyk.pdf), controlled HCI study | Different interruption moments affected burden; task boundaries can be better opportunities. | That an optional question is harmless merely because a timer has elapsed. |
| P15 [Michie, van Stralen & West, 2011 behavior-change wheel](https://link.springer.com/article/10.1186/1748-5908-6-42), framework development | Capability, opportunity and motivation all constrain action. An actionable exit must be available, understandable and feasible. | A trial showing that information alone changes behavior. |
| P16 [Bahir, Parmet & Tractinsky, 2019 notification receptivity](https://interruptions.net/literature/Bahir-CHIEA19.pdf), CHI extended abstract, logs from 6,866 users | Visual elements, action buttons and delivery timing related to click response in the studied productivity service. | Click-through is not remembered meaning, trust, well-being or reduced gambling; a short field paper is not universal causal proof. |

### Three current high-salience product examples

| Current source | Trigger → information → control/payoff | Transfer and boundary |
|---|---|---|
| [Apple Health trends](https://support.apple.com/guide/iphone/view-your-health-data-iphe3d379c32/ios) | Detected change → magnitude/duration in Summary → tap graph; trend notifications can be enabled through Notifications. | Concrete evidence plus details and notification control. Do not invent a health-like significance claim. |
| [Tesla energy/range](https://www.tesla.com/ownersmanual/model3/en_us/GUID-4AC32116-979A-4146-A935-F41F8551AFE6.html) | Range/route context → predicted arrival energy or charging information → choose a feasible route/charging action. | A timely fact has a related action and stated model context. Vehicle safety constraints are not a license for coercive onboarding. |
| [Apple Weather](https://support.apple.com/guide/iphone/check-the-weather-iph1ac0b35f/ios) | Local conditions → relevant severe-weather/air-quality information and forecast detail → configurable weather notifications. | Relevance is tied to location/time and feature availability. Do not generalize a severe-weather interruption's urgency to every optional question. |

### Concrete personalized information versus generic observations

| Form | Proper use in Spin Out | Required guard |
|---|---|---|
| A factual practice-session amount or sequence | Make a specific recent action legible, using the actual simulation ledger. | Identify practice context, time window and monetary definition; do not count returned stake as profit. |
| A user-supplied obligation/income comparison | Show a meaningful consequence tied to voluntarily supplied context. | Correct units, freshness and source; preserve unknowns; allow correction; avoid presenting hypothetical losses as actual unpaid bills. |
| A generic reflective question | Invite reflection where no accurate personal fact exists. | Do not imply privileged knowledge of the user's motives; make dismissal clear. |
| A diagnostic or normative claim | No basis established here for a new claim. | Do not invent peer behavior, infer addiction, or shame the user from a short simulated pattern. |

P07 and P08 support making monetary information intelligible, but do not prove that personalized Pings outperform generic messages in every situation. P02 bundles multiple components, so it cannot isolate that comparison. This remains a hypothesis requiring a suitably designed comparison, with comprehension, trust and behavior measured separately.

### Decision record: existing Ping hierarchy and timing

**Problem / signal:** The brief requires interventions people understand and remember while preserving premium presentation. In the inspected `RealityRun.tsx`, candidates are built from the profile and run, grouped by family, selected with stored learning, and presented through Reality Ping or X-Ray; the optional setup receives a foreground-open signal. Freshness checks already gate some financial scenery. Those are existing mechanisms to preserve and verify, not proof that users remember the result.

**Decision / repeated pattern:** A single intervention should own attention at a meaningful boundary. Keep the strongest correct fact and an immediately usable action prominent; treat optional question requests as subordinate. Audit monetary definitions, missing/stale inputs and the route back to the user's task before changing the intervention strategy.

**Do not copy:** Multiple overlays competing for attention; fabricated comparative norms; guilt from a lender's name; an automatic time-based question while cards/reels require a decision; measuring success only as clicks or question completion.

**Acceptance criteria:** The triggered message matches the underlying ledger and context; same-moment prompts do not overlap; ordinary reflection and explicit decision moments retain their intended different behavior; dismissal restores the task and does not silently answer a question; an exit remains clear; return-to-play and exit actions do what their labels promise. Test high/low stakes, wins after losses, unknown context and stale context. Report model-generated recall scores as **synthetic predictions**, not observed memory or clinical outcomes.

## D. High-urge / low-patience entry :  ten current task experiences

These are current documented or public task-entry examples. Transport and emergency access provide urgency analogies; music, utility and commerce provide low-patience entry patterns. None is assumed to reproduce a gambling urge, and none establishes that Spin Out must reduce its agreed minimum setup below what its model needs.

| ID / official source | Visible/documented first task, inputs and payoff | Effort lesson and evidence limit |
|---|---|---|
| U01 [Uber public ride entry](https://www.uber.com/us/en/) | Pickup and destination fields precede See prices; pricing is the immediate promised result. | Ask for data directly necessary to the next useful result. Booking/account completion was not tested. |
| U02 [DoorDash public entry](https://www.doordash.com/) | Food discovery has a Find restaurants action distinct from DashPass and driver acquisition. | Keep the immediate consumer task distinct from commercial alternatives. Delivery address, sign-in and checkout sequence were not completed. |
| U03 [Google Maps directions](https://support.google.com/maps/answer/144339?hl=en) | Directions → start/destination → travel mode; routes and estimated duration appear with alternatives. | Gather task-specific inputs and return a usable result. Source instructions include computer steps; this is not a mobile gesture audit. |
| U04 [Google Translate](https://support.google.com/translate/answer/6142478?hl=en) | Open app, select languages and enter text; view the translation, with listening/detail after. | Deliver the narrow purpose before unrelated setup. Android documented flow, not an install-to-first-use stopwatch study. |
| U05 [Spotify Search](https://support.spotify.com/us/article/search/) | Enter a song/artist term; lyrics can help when the exact title is unknown; advanced search remains optional. | Support imperfect user knowledge and keep advanced input optional. The source assumes access to Spotify; account onboarding was not inspected. |
| U06 [Shazam recognition](https://support.apple.com/en-euro/guide/shazam/dev9748744b6/web) | Open Shazam and tap its main recognition button; grant relevant permission when first required; result opens and is saved. | One dominant task; permission relates to the requested capability. Exact permission experience varies by platform. |
| U07 [Apple Clock timer](https://support.apple.com/guide/iphone/set-timers-iph8241d6b2a/ios) | Timers → duration → Start; label/sound customization is separate; a recent timer can start again directly. | Reuse known settings for returning tasks. Do not copy hidden horizontal presets as the only access to essential options. |
| U08 [iPhone Emergency SOS](https://support.apple.com/guide/iphone/contact-emergency-services-iph3c99374c/ios) | Hardware shortcut or locked-screen emergency entry reaches help; countdown and regional variations are documented. | Critical access should not depend on unrelated profile completion. Documentation only: no emergency action was executed. This is an urgency analogy, not a consumer-onboarding efficacy study. |
| U09 [Wise quote](https://wise.com/us/) | Public amount/currency inputs show recipient amount, cost and timing context before transfer entry. | A meaningful preview explains why inputs matter. No transfer was initiated; financial compliance steps are not optional personalization. |
| U10 [Airbnb search](https://www.airbnb.com/) | Destination, dates and guests define the search task; login/host actions are separate. | Preserve the user's already chosen intent and return relevant options. Booking, personalized ranking and signup were not tested. |

### Eleven research and HCI sources for this decision

| ID / linked source | Specific contribution to low-attention entry | Evidence status / limitation |
|---|---|---|
| H01 [Mark et al., 2008](https://interruptions.net/literature/Mark-CHI08.pdf) | Interruption can increase experienced pressure even if people compensate with speed. | Original controlled task study; see P11. |
| H02 [Altmann et al., 2014](https://interruptions.net/literature/Altmann-JExpPsycholGen14.pdf) | Preserve place in a short sequence across interruption. | Original sequential-task experiments; see P12. |
| H03 [Bailey & Konstan, 2006](https://interruptions.net/literature/Bailey-CHB06_1.pdf) | Prefer task boundaries for optional requests. | Original controlled experiment; see P13. |
| H04 [Adamczyk & Bailey, 2004](https://interruptions.net/literature/Adamczyk-CHI04-p271-adamczyk.pdf) | Timing must reflect the user's task, not only elapsed time. | Original HCI experiment; see P14. |
| H05 [Nahum-Shani et al., 2016/2018](https://link.springer.com/article/10.1007/s12160-016-9830-8) | Consider receptivity and burden when deciding whether to ask now. | Intervention-design framework; see P10. |
| H06 [Santos et al., 2025](https://link.springer.com/article/10.1007/s10899-025-10405-y) | Impulsivity/risk and poor expenditure estimates caution against treating a quick guessed answer as successful completion. | Original observational study, not evidence that an onboarding variant causes abandonment. |
| H07 [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Establish why each question is needed; make optional status clear and structure questions accessibly. | Official design guidance, not a mandate to copy government visual styling. |
| H08 [W3C cognitive usability, 2021](https://www.w3.org/TR/2021/NOTE-coga-usable-20210429/) | Short critical paths, understandable controls, limited distractions and support after mistakes. | Supplemental work-in-progress guidance; see T07. |
| H09 [Nielsen, progressive disclosure, 2006](https://www.nngroup.com/articles/progressive-disclosure/) | Present the core task first; reveal specialized options when requested. | Original expert HCI guidance, not a measured Spin Out conversion effect. |
| H10 [Nielsen, response-time limits, 1993](https://www.nngroup.com/articles/response-times-3-important-limits/) | Provide timely response and honest progress feedback when waiting is necessary. | Foundational heuristics; its time ranges are not an observed abandonment curve for Spin Out. |
| H11 [Bahir et al., 2019](https://interruptions.net/literature/Bahir-CHIEA19.pdf) | Notification timing and visual treatment interact with receptivity. | Field research/extended abstract; clicks cannot stand in for useful completed onboarding. |

### Decision record: preserve intent and earn later questions

**Problem / signal:** The brief identifies a prior synthetic failure where hidden answer choices led to inaccurate selections, and forbids improving completion by blocking play or making postponement fake. This is a synthetic user signal, not a newly observed human study. The inspected landing links already carry game intent in the query string; the run contains an in-game personalization component.

**Current behavior:** Existing source has a selected-game path and an in-run setup surface. This research did not independently time the complete first-use or returning flow; the final branch's onboarding tests and browser evidence must establish the actual step count.

**Decision / repeated pattern:** Retain game intent and already supplied information. Keep the agreed minimum pre-game questions focused on what the simulation actually needs. Ask remaining useful questions in the existing context at a receptive moment, with immediate payoff and reversible postponement. Preserve answers across back navigation; do not repeat questions solely because the user changed route.

**Do not copy:** Emergency-level urgency for an ordinary request; signup requirements from commerce; abandoning useful consent to reduce taps; an arbitrary completion percentage; hidden swipe-only answers; more prompts justified only by increased clicks.

**Acceptance criteria:**

1. A chosen game survives the route into setup/play; required question count matches the agreed product requirement, and returning users do not repeat already valid information without cause.
2. “NOT NOW” collapses and preserves the current unanswered question. Reopening shows that question. It does not save null, zero or completion. Dismissal does not immediately trigger another ask in the same task moment.
3. Every answer is discoverable by visible controls without horizontal-gesture knowledge. The original brief's explicit limits remain: ordinary mobile dock ≤140px, collapsed rail ≤46px, and no page overflow at 320px.
4. When the user begins a game action or a stronger intervention owns the foreground, the optional request yields. Only one useful question is foregrounded.
5. Record time to playable action, pre-game exits, incorrect/guessed answers, correction frequency, optional completion, irritation/trust and intervention recall separately. No improvement claim is accepted solely from a higher answer count.
6. Before/after checks use the same retained synthetic panel identities and scenarios if available. Synthetic scores describe that simulation only. No real abandonment rate, sustainable voluntary-completion ceiling or remembered intervention rate can be claimed from this documentary research.

## Focused decisions for the current correction pass

1. **Preserve existing behavior unless a concrete defect is demonstrated.** The reference-image correction does not justify adding new onboarding, pings, forecast modes or commercial steps.
2. **Repair modal interaction as a discrete verified change.** Use the W3C criteria above for the existing explanation and edit surfaces, including typing without focus loss and restoring focus after closure.
3. **Preserve missing-data meaning.** A blank voluntary amount remains unanswered until explicitly supplied; zero is a real answer. Do not display a factual consequence from absent or stale inputs.
4. **Keep the money semantics precise.** Practice ledger amounts, user-entered obligations, expected model values and sampled results must remain distinguishable.
5. **Keep premium visual identity while protecting the reading order.** These sources support legibility and hierarchy, not removal of artwork, motion or differentiated game design.
6. **Keep proof categories separate in the release report.** Exact reference fidelity requires rendered comparison; functional reliability requires branch-specific tests; bibliography verifies sources; synthetic panels model reactions; human usability and clinical efficacy remain separate claims.

No 100/100 match, empirical voluntary-completion target, clinical benefit, conversion uplift, or real-user validation is asserted by this addendum.
