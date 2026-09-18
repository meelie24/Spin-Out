# Spin Out

Spin Out is a browser-first pre-gambling Reality Run. It asks for enough real context to make a simulated gambling session personal, lets the person leave at any moment, and records how quickly they chose to leave.

## Stack

- Next.js + React + TypeScript for product flow and UI
- Phaser 4 + WebGL for the calibrated game surfaces
- GSAP for setup/deposit transitions
- Web Audio API for game and Reality Ping sound
- Supabase Auth + Postgres for identity, one-run Plus trial state, and Plus cross-device sync
- RevenueCat Web for the canonical `premium` subscription entitlement
- Paddle Billing as the first web billing engine configured through RevenueCat
- localStorage for private Core on-device profile, run history, and learning
- ephemeral anonymous `/api/presence` heartbeat for the live journey counter

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run test:core
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run qa
```

The production master prompt is kept at `docs/MASTER_PRODUCT_PROMPT.md`.

## Plus access model

Core Reality Runs remain usable without a subscription.

For an authenticated account that has never used the trial, the **first Reality Run** claims one full Spin Out+ session:

- the chosen first game gets the complete Plus access layer;
- the trial is bound server-side to that Reality Run ID and game;
- the access window ends when that run is consumed or after the same 15-minute maximum as the Reality Run;
- clearing browser data, logging out, or changing browsers does not create another first-run trial;
- a second Reality Run uses Core unless RevenueCat reports the `premium` entitlement active.

## Subscription architecture

RevenueCat is the canonical paid-entitlement source. The authenticated Supabase user ID is also the RevenueCat App User ID. Paddle Billing is the first web billing engine / merchant-of-record configuration.

Current plans:

- **$4.99/month**
- **$29.99/year**

Required production environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://spinitout.com

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# RevenueCat Web SDK: intentionally public
NEXT_PUBLIC_REVENUECAT_WEB_API_KEY=...

# RevenueCat REST entitlement lookup: server-only secret
REVENUECAT_SECRET_API_KEY=...
```

The Paddle sandbox product, prices, RevenueCat Paddle app, `premium` entitlement, offering, and monthly/annual packages must be configured in the provider dashboards before checkout can become live. The repository does not fabricate successful Paddle purchases or merchant approval.

Spin Out remains software with simulated balances: there are no real-money game deposits, cash prizes, redeemable game credits, or operator/affiliate wagering links.
