# Owner overrides to the Final Production Master Prompt

These instructions were explicitly given after the current master prompt and therefore supersede conflicting requirements in it.

## 2026-09-18

1. **Sportsbook remains in Spin Out.**
   - Do not remove Sports.
   - It must be rebuilt/calibrated so it behaves and looks like a credible sportsbook simulation.
   - Use fictional teams/events rather than copying a named operator's proprietary interface.

2. **The 48-hour Plus trial is replaced by one Plus Reality Run.**
   - The first authenticated Reality Run on an account gets the **full Spin Out+ feature set**.
   - It is bound to the first chosen game and Reality Run ID.
   - Its maximum window is the existing 15-minute Reality Run maximum.
   - Once that run is completed/consumed, a second Reality Run uses Core unless the account has the RevenueCat `premium` entitlement.
   - The first-run trial is server-authoritative and cannot be reset by local browser storage.

3. **Game realism is a required release criterion.**
   - Research each game category and compare against actual gameplay/walkthrough material.
   - Game logic must produce the visible result.
   - Do not reuse one generic outcome table for unrelated games.

4. **Netlify native GitHub integration is the release/deployment path.**
   - Do not use Vercel for Spin Out.
   - Connect the GitHub repository directly to Netlify and let Netlify clone, build and deploy the complete repository.
   - Verify the exact `release/final-production-pass` candidate on a Netlify branch deploy before promoting it.
   - Do not merge `main` merely to obtain a deployment.
   - After the release candidate passes deployed browser/auth/payment verification, promote that exact verified candidate and then connect the final custom domain through Netlify/the registrar.
   - Any older Vercel references in planning or implementation documents are stale and must not control release decisions.
