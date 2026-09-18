# Spin Out Monetization Research

Last updated: 2026-09-18

## Scope

This research pass reviewed more than 250 returned sources and source pages across subscription benchmarks, digital-health willingness-to-pay, gambling-harm interventions, dark-pattern research, payment-provider policies, comparable consumer products, employer/payer behavioral-health models, and public-health/grant funding.

The research was used to choose a monetization model that can generate revenue without turning the Reality Run itself into a retention product.

## Executive decision

### 1. Keep the core Reality Run free

Do not paywall the moment when somebody is considering gambling. Do not place checkout inside setup, during a Reality Ping, after a severe simulated loss, or while the game is active.

This is both the product rule and the strongest long-term trust position.

### 2. Sell Spin Out+ after the run

Initial pricing remains:

- $4.99 monthly
- $29.99 yearly

The annual plan is the better default presentation because subscription benchmarks consistently show materially better annual retention than monthly retention. The yearly price also sits within the range users already see in consumer sobriety, gambling-blocking, and behavioral-health products.

Do not use fake countdowns, expiring offers, forced trials, pre-checked boxes, or cancellation friction.

### 3. What Plus should sell

Plus should monetize the value created across runs, not access to the immediate intervention:

- full Reality Run history
- Money Kept trends
- time-to-exit trends
- multiple obligations and goals
- deeper Reality Ping personalization
- advanced trigger patterns
- optional cross-device sync when real accounts exist
- weekly summaries only for paying users who explicitly opt in

Do not monetize more spins, longer sessions, casino themes, bonus credits, jackpots, streaks, or anything that creates a financial incentive for the product to keep someone gambling longer.

## Pricing evidence

### Subscription benchmarks

RevenueCat's State of Subscription Apps 2026 reports that yearly plans retain materially better than shorter plans across categories and shows Health & Fitness among the strongest yearly-retention categories.

Reference:
https://www.revenuecat.com/state-of-subscription-apps

RevenueCat and comparable app-subscription benchmarking sources consistently place consumer wellness subscription prices above Spin Out's proposed $4.99 monthly price, with annual prices commonly around the $30–$40 range or higher.

### Willingness to pay for eHealth

A systematic review and meta-analysis of 35 studies found substantial variation in willingness to pay for eHealth. Reported monthly willingness-to-pay values ranged from $5.25 to $45.64, and health-app modalities were valued more highly than several other eHealth modalities.

Reference:
https://pmc.ncbi.nlm.nih.gov/articles/PMC9520394/

The implication for Spin Out is not that every user will pay. It is that $4.99/month is defensible as a low-friction consumer price if the core product remains usable without payment.

### Comparable consumer products

Observed pricing during this research pass included:

- Gamban: approximately $6.99/month and $41.99/year
- RecoverMe: app-store variants around $4.49/month and $44.99/year
- I Am Sober: approximately $9.99/month with lower-priced annual options
- Sunnyside: annual plans equivalent to roughly $8–$9/month
- Reframe: materially higher monthly and annual pricing than Spin Out

These are comparison points, not evidence that Spin Out will convert at the same rate.

## Payment-provider decision

### Current implementation: RevenueCat + Paddle Billing

RevenueCat is now the canonical paid-entitlement layer for Spin Out+. The web application uses RevenueCat's `@revenuecat/purchases-js` SDK with the authenticated Supabase user ID as the stable App User ID and one entitlement named `premium`.

Paddle Billing is the first billing engine to configure and test with that RevenueCat web integration. RevenueCat's current Web SDK documentation explicitly supports Paddle Billing, and RevenueCat's Paddle guide states that Paddle remains the billing engine and merchant of record while RevenueCat maps the purchase to entitlements.

References:
https://www.revenuecat.com/docs/web/web-billing/web-sdk
https://www.revenuecat.com/docs/web/integrations/paddle
https://www.revenuecat.com/docs/web/overview

The required sandbox setup is:

1. Paddle sandbox account.
2. Monthly and annual subscription products/prices in Paddle.
3. RevenueCat Paddle web configuration connected to that sandbox account.
4. Paddle products imported into RevenueCat.
5. One RevenueCat entitlement: `premium`.
6. Current offering with monthly and annual packages.
7. RevenueCat Web SDK public key configured in Spin Out.
8. Real sandbox checkout tests using an authenticated Spin Out user.

RevenueCat's Paddle documentation specifically requires real sandbox purchases for lifecycle testing. Paddle's webhook simulator is ignored by RevenueCat for entitlement changes, so simulated webhook events must not be treated as purchase verification.

### Merchant-review condition

Spin Out does not accept real-money wagers, game deposits, prizes, withdrawals, or redeemable game credits. Subscription payment purchases access to software. The product nevertheless uses realistic simulated gambling interfaces, so the actual product must be submitted accurately to Paddle and merchant approval must be confirmed before production payment activation.

Do not misrepresent the product to obtain approval. If Paddle declines the product, preserve the RevenueCat/access abstraction and move to another legitimate supported billing engine rather than bypassing the decision.

### One-run Plus trial

The earlier 48-hour trial concept has been superseded by the owner.

An authenticated account's **first Reality Run** receives the complete Spin Out+ access layer for that one run, with the same 15-minute maximum as the Reality Run itself. The claim is server-bound to the first run ID and game. Once consumed, later runs use Core unless RevenueCat reports the `premium` entitlement active.

This is separate from a provider-managed subscription trial; no Paddle trial period is required for the one-run product trial.

## Subscription UX rules

Recurring billing must be transparent.

Research and regulator guidance repeatedly warn against negative-option dark patterns, unclear recurring terms, and cancellation friction.

References:
https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2023-01-unlawful-negative-option-marketing-practices/
https://www.consumerfinance.gov/ask-cfpb/how-do-i-stop-automatic-payments-from-my-bank-account-en-2023/
https://www.ftc.gov/legal-library/browse/rules/negative-option-rule

Spin Out therefore should:

- show exact monthly/yearly price before checkout
- clearly state recurring billing
- make Manage Subscription obvious after purchase
- never make cancellation harder than purchase
- avoid countdown timers, urgency, hidden renewals, and disguised trial conversions

## Why the product should not monetize gambling intensity

A large body of gambling research shows that casino feedback can alter perception and persistence.

Losses disguised as wins are particularly relevant. Studies show that net-loss outcomes paired with celebratory sights and sounds can be perceived and physiologically processed more like wins and can inflate perceived win frequency.

Representative references:
https://pubmed.ncbi.nlm.nih.gov/20712818/
https://pubmed.ncbi.nlm.nih.gov/24198088/
https://pubmed.ncbi.nlm.nih.gov/29730788/
https://pubmed.ncbi.nlm.nih.gov/30063273/
https://pubmed.ncbi.nlm.nih.gov/32889441/
https://pubmed.ncbi.nlm.nih.gov/36609723/
https://pubmed.ncbi.nlm.nih.gov/38169673/
https://pubmed.ncbi.nlm.nih.gov/38385660/
https://pubmed.ncbi.nlm.nih.gov/28421402/
https://pubmed.ncbi.nlm.nih.gov/32965629/

Product implication:

- a net loss must look and sound like a loss
- do not sell “better” win animations
- do not use near-miss manipulation
- do not optimize revenue against number of spins or time spent in the Reality Run

## Digital-intervention evidence

The research base does not support claiming Spin Out is a clinically proven treatment.

Relevant evidence does support careful experimentation with:
- personalized feedback
- self-appraisal prompts
- short digital interventions
- interruption of automatic behavior
- personalized financial context
- self-monitoring and progress feedback

Representative sources:
https://pubmed.ncbi.nlm.nih.gov/39630514/
https://pubmed.ncbi.nlm.nih.gov/39738910/
https://pubmed.ncbi.nlm.nih.gov/34366941/
https://pubmed.ncbi.nlm.nih.gov/26275785/
https://pubmed.ncbi.nlm.nih.gov/27804002/
https://pubmed.ncbi.nlm.nih.gov/37794916/
https://pubmed.ncbi.nlm.nih.gov/32348255/
https://pubmed.ncbi.nlm.nih.gov/34637651/
https://pubmed.ncbi.nlm.nih.gov/39316431/

These sources shape feature design. They do not prove Spin Out itself works.

## Second revenue lane: B2B and public-health pilots

Consumer Plus should not be the only long-term revenue path.

A stronger second lane is paid licensing or funded pilots with organizations that have a reason to reduce gambling harm without earning revenue from gambling activity itself:

- employers and employee-assistance programs
- health plans
- universities
- public-health bodies
- nonprofits and treatment/support organizations
- research partners
- municipalities and prevention programs

The product can be sold as prevention/support infrastructure with:
- anonymous aggregate program reporting
- configurable support resources
- organization-specific onboarding
- outcome studies
- private deployment or SSO later

Do not sell individual gambling-behavior data.

## Grant and commissioned-funding lane

The UK statutory gambling levy has created substantial prevention, research, and treatment funding.

Current public references include:
https://www.gov.uk/government/publications/statutory-gambling-levy
https://www.gov.uk/government/publications/preventing-gambling-harms-vcse-funding-2026-to-2028
https://www.gov.uk/government/publications/preventing-gambling-harms-vcse-funding-2026-to-2028/vcse-sector-gambling-harms-prevention-and-resilience-funding-2026-to-2028
https://www.gov.uk/government/publications/preventing-gambling-harms-local-council-funding-2026-to-2027

This suggests a credible future route through prevention pilots and partnerships. Eligibility depends on jurisdiction, organizational structure, independence requirements, and specific grant terms.

## Metrics that should drive monetization

Track business metrics separately from Reality Run engagement:

Consumer:
- completed runs
- post-run Plus impressions
- checkout starts
- verified subscriptions
- monthly vs yearly mix
- renewal
- cancellation
- refund
- Plus feature use
- subscriber retention

Product-safety:
- voluntary-exit rate
- time-to-voluntary-exit trend
- urge before/after
- Money Kept
- support-resource openings
- Reality Ping type and what happens after it

Never treat these as success metrics:
- longest session
- most spins
- highest simulated balance
- sessions per day
- total simulated winnings

## Launch recommendation

### Consumer offer

Free:
- complete Reality Setup
- complete Reality Run
- Reality Pings
- post-run urge and real-world outcome
- current-run Money Kept result

Spin Out+:
- $4.99/month
- $29.99/year
- full history
- longitudinal Money Kept
- time-to-exit trends
- deeper personalization
- expanded obligations/goals
- advanced summaries

Default presentation can emphasize annual value, but monthly must remain equally understandable and available.

### Business offer later

Do not put business pricing on the consumer home page.

Start with pilot conversations and quote based on:
- population size
- reporting requirements
- support/resource customization
- account/SSO requirements
- research design
- deployment requirements

## What still requires an external account

The repository can implement the integration without pretending provider setup exists.

Live/sandbox Plus checkout still requires:

- Paddle sandbox merchant account
- $4.99 monthly Paddle price
- $29.99 yearly Paddle price
- RevenueCat project and Paddle web configuration
- Paddle products imported into RevenueCat
- `premium` entitlement
- current offering with monthly and annual packages
- RevenueCat Web SDK public key
- server-side RevenueCat secret API key
- successful, cancelled, and failed real sandbox purchase tests
- Paddle production review/approval and live credentials before accepting live payments

Deployment also requires a full-stack host connected directly to the GitHub repository plus final control of the chosen custom-domain DNS.

Until the sandbox/provider configuration is connected, the application must present the integration as unavailable rather than inventing a successful subscription.
