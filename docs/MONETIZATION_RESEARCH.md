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

### Current implementation: PayPal subscriptions

The codebase implements PayPal Subscriptions as the first production checkout path.

PayPal's current developer documentation supports fixed recurring subscription plans through its JavaScript SDK and Subscriptions API.

References:
https://developer.paypal.com/platforms/subscriptions/
https://developer.paypal.com/platforms/subscriptions/integrate/
https://developer.paypal.com/subscriptions/pricing-plan

The integration does not mark Plus active from a client-side callback alone. The server verifies the subscription ID, expected plan ID, and subscription status through PayPal before the browser stores premium state.

### Merchant-review warning

Spin Out does not accept wagers, deposits, prizes, or redeemable balances. Its “deposit” is explicitly simulated and no real money enters the Reality Run.

However, payment providers often use broad gambling-risk classifications. Because Spin Out intentionally presents casino-like simulation, merchant approval must be confirmed before live collection begins.

Do not describe provider approval as guaranteed.

### Providers not selected

Lemon Squeezy explicitly lists gambling among prohibited regulated products:
https://docs.lemonsqueezy.com/help/getting-started/prohibited-products

Paddle restricts gambling, lotteries, games of chance, and related categories:
https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle

FastSpring lists gambling services among prohibited sales:
https://developer.fastspring.com/docs/manage-your-products

Stripe treats gambling and gambling-like activity as restricted/high-risk and may require approval:
https://stripe.com/legal/restricted-businesses
https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs

Gumroad's current policy is nuanced: educational and record-keeping gambling products can be allowed, while casino-branded storefronts and products that drive wagers are prohibited. Spin Out's highly immersive casino-style interface creates unnecessary classification risk for that provider:
https://gumroad.com/prohibited

Payhip prohibits gambling activities involving monetary or material prizes, but its broader provider dependencies still make pre-approval prudent:
https://help.payhip.com/article/205-what-products-are-not-allowed-on-payhip

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

Code can be production-ready without pretending external merchant setup exists.

Live Plus checkout requires:

- approved PayPal Business merchant account
- PayPal product
- $4.99 monthly plan
- $29.99 yearly plan
- production client ID
- production secret
- monthly/yearly plan IDs
- provider review/approval for the actual Spin Out product

Deployment also requires a hosting account and control of the `spinitout.com` DNS.

Until those credentials are connected, the app deliberately shows pricing without a fake payment button.
