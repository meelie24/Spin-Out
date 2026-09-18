# Spin Out — Netlify Release Runbook

## Release source of truth

- Repository: `meelie24/Spin-Out`
- Verification branch: `release/final-production-pass`
- Do **not** merge `main` just to obtain a deployment.
- Netlify must import/clone the GitHub repository through its native Git integration.
- Do not use a drag-and-drop/static export/manual file-upload deployment for release verification.
- Do not use Vercel for Spin Out.
- Deploy the exact verified release-branch commit and record its SHA before final promotion.

## Why this path

Spin Out is a full-stack Next.js application. It uses:
- App Router routes
- server route handlers under `app/api/**`
- Supabase Auth/cookies
- server-side access checks
- server-side presence and sync routes

The release candidate therefore needs a full repository build/deploy, not a static copy of rendered files.

## Step 1 — Connect the GitHub repository

In Netlify:

1. Add a new project from an existing repository.
2. Choose GitHub.
3. Authorize the repository if Netlify has not been granted access yet.
4. Select `meelie24/Spin-Out`.
5. Let Netlify detect the Next.js framework/build settings.
6. Keep the repository root as the project root.
7. Do not add a custom Next.js adapter package unless a real build failure proves it is needed.

The repository's normal production build is:

```bash
npm run build
```

## Step 2 — Keep `main` out of the test

Before using the candidate:

1. Open **Project configuration → Developer settings → Continuous deployment → Branches and deploy contexts**.
2. Enable a branch deploy specifically for:
   `release/final-production-pass`
3. Use the resulting Netlify branch-deploy URL as the release-candidate URL.
4. Record the deployed Git SHA from the Netlify deploy details.

The candidate is only valid if the deployed SHA matches the release branch SHA being verified.

## Step 3 — Environment variables

Set secrets in Netlify's environment-variable settings. Do not commit them to GitHub.

Required by the current application:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_REVENUECAT_WEB_API_KEY
```

For the release-branch deploy:

- `NEXT_PUBLIC_SITE_URL` must equal the actual HTTPS branch-deploy origin being tested.
- Supabase public URL/publishable key may be exposed to the browser by design.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never use a `NEXT_PUBLIC_` prefix.
- `NEXT_PUBLIC_REVENUECAT_WEB_API_KEY` is the RevenueCat Web SDK public key.

The repository README also reserves `REVENUECAT_SECRET_API_KEY` for server-only RevenueCat configuration. Do not invent or expose a secret key. Only add it when the corresponding production/provider flow actually uses it.

If an environment variable changes, create a new deploy before treating the change as tested.

## Step 4 — Supabase Auth URL configuration

Before testing sign-in on the branch deploy, add the Netlify candidate origin/callback to the allowed Supabase Auth URLs.

Required callback shape:

```text
https://<actual-netlify-candidate-host>/auth/callback
```

Also keep the eventual production callback ready:

```text
https://spinitout.com/auth/callback
```

Do not point the release candidate at the production domain until the candidate itself passes verification.

## Step 5 — Candidate deployment verification

After Netlify reports a successful branch deployment, test the deployed URL itself.

### Basic production behavior

- home page loads without an error overlay
- no unexpected console errors
- no failed first-party requests that break product behavior
- metadata/manifest/icons load
- `/help`, `/research`, `/privacy`, and `/terms` load
- direct navigation and refresh work on app routes

### Responsive product journey

Verify at minimum:
- 390px mobile
- 768px tablet
- desktop

Check:
- no horizontal overflow
- game cards remain usable
- My Reality Save remains reachable
- Reality Ping/X-Ray dialogs fit and take focus
- Run 10,000 conclusion remains readable
- exit receipt and post-run screens fit
- reduced-motion path remains usable

### Every game

Run:
- Slots
- Sportsbook
- Roulette
- Video Poker
- Scratch

For each:
- visible result matches the game engine result
- action locking prevents rapid-input corruption
- audio does not block the interaction
- leaving works at any point
- refresh/restore does not create a second conflicting active run

### Reality Engine

Exercise:
- ordinary Reality Ping
- strong chosen-limit intervention
- stake-escalation X-Ray
- chase/rapid-play behavior
- one-foreground-only overload behavior
- same-visit homepage prompt dismissal
- Payday Shield only outside active gameplay
- Reality Receipt
- Run 10,000, including a sample that happens to finish ahead

The long-run view must distinguish the finite sample from the calibrated model expectation and must never instruct the user to continue gambling.

## Step 6 — Real account / one-run Plus verification

Create a real test user only after the branch-deploy Auth callback is allowed.

Verify:

1. New account is eligible for one full Plus Reality Run.
2. The first selected game/run claims the trial server-side.
3. Reloading does not mint another trial.
4. Logging out and back in does not mint another trial.
5. A second browser does not mint another trial.
6. Finishing/consuming the first run moves the account back to Core unless `premium` is active.
7. Plus/sync routes reject an account that has neither the exact trial run nor paid premium access.

Record database state in `user_access` for the test account as evidence.

## Step 7 — Paddle + RevenueCat sandbox

This remains an external release gate.

Before calling payments verified:

- configure the real Paddle sandbox merchant/product/prices
- connect Paddle to the intended RevenueCat web app
- attach monthly/annual products to the single `premium` entitlement
- expose them through the current offering/packages
- use a real authenticated Spin Out test account

Then test on the Netlify candidate:

- successful sandbox checkout
- cancelled checkout
- failed/recoverable checkout
- entitlement becomes active after success
- paid access survives reload
- paid access survives logout/login
- paid access resolves in a second browser
- management/cancellation state resolves correctly
- no secret payment credential appears in browser bundles, page source, URLs, or analytics

No mocked or locally forced entitlement counts as payment verification.

## Step 8 — Promotion

Only after all candidate checks pass:

1. Record the exact verified Git SHA.
2. Promote/merge that same candidate to `main`.
3. Confirm Netlify production deploy is built from that exact promoted code.
4. Set production environment values.
5. Add `https://spinitout.com/auth/callback` to Supabase Auth if not already present.
6. Connect the final custom domain in Netlify/the registrar.
7. Run the critical production journey again on `spinitout.com`.
8. Inspect production console/network/function behavior again.

If promotion changes the code, the verification is invalid and must be rerun.

## Release evidence to retain

Keep:
- Git SHA
- GitHub CI run URL/number
- Netlify deploy ID and branch-deploy URL
- deployed SHA shown by Netlify
- screenshots for mobile/desktop critical states
- browser QA output
- console/network findings
- Supabase test-account trial state
- RevenueCat/Paddle sandbox evidence for success/cancel/failure

## Current gates

The application may be a verified CI release candidate before these steps, but it is not production-verified until:

1. the exact candidate is deployed through Netlify's native GitHub integration,
2. the deployed product passes browser/mobile/auth verification,
3. real Paddle/RevenueCat sandbox lifecycle testing passes,
4. the exact verified candidate is promoted and retested on the production domain.
