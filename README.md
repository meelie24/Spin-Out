# Spin Out

Spin Out is a browser-first pre-gambling Reality Run. It asks for enough real context to make a simulated gambling session personal, then lets the person leave at any moment and records how quickly they chose to leave.

## Stack

- Next.js + React + TypeScript for product flow and UI
- Phaser 4 + WebGL for the Reality Run game surface
- GSAP for setup/deposit transitions
- Web Audio API for reel, button, ambient and Reality Ping sound
- localStorage for private on-device profile, run history and learning
- ephemeral anonymous `/api/presence` heartbeat for the live “people are on this journey with you” counter

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test:core
npm run typecheck
npm run build
npx playwright install chromium
npm run qa
```

The master product prompt is kept at `docs/MASTER_PRODUCT_PROMPT.md`. The architecture spec and implementation plan live under `docs/superpowers/`.


## Production configuration

Canonical site URL: `https://spinitout.com`.

Spin Out+ uses a provider-agnostic subscription entitlement. Core Reality Runs do not require payment. Lemon Squeezy is the preferred broad checkout, with direct PayPal subscriptions retained as a fallback.

Required production environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://spinitout.com

# Lemon Squeezy: cards, Apple Pay, Google Pay and PayPal subscriptions
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_YEARLY_VARIANT_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_TEST_MODE=false

# Direct PayPal subscription fallback
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID=...
NEXT_PUBLIC_PAYPAL_YEARLY_PLAN_ID=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_ENV=live
```

Configure the Lemon Squeezy subscription variants and/or PayPal plans at **$4.99/month** and **$29.99/year**. Lemon Squeezy checkout can surface cards, Apple Pay, Google Pay and PayPal depending on the customer's device and location. Without a complete provider configuration, the product deliberately shows pricing without a checkout control rather than pretending billing works.

Before taking live payments, complete the selected merchant provider's production review and configure the signed subscription webhook. Spin Out must remain practice-only: no entry fee, wagering, prizes, redeemable balance, operator links, or sportsbook/casino affiliate revenue.
