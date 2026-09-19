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

5. **Mandatory onboarding is capped at five high-value interactions, then continues during gameplay.**
   - The required sequence is: five essential questions → actual game visible → liquid-glass explanation → **Start Reality Run** → live game with one continuation question at a time.
   - If the game is already known from the homepage, do not ask for it again; use the freed interaction for current urge.
   - The fourth core question is locked as: **“Realistically, what is this money for? If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?”**
   - There is no deposit/load screen after the five questions.
   - Desktop continuation setup is a compact liquid-glass card beside the game. It never expands into a full form.
   - Mobile continuation setup is a compact bottom dock: ordinary open state 110–140px maximum, collapsed rail 42–46px, sleek system typography, and gameplay remains visually dominant.
   - A completed continuation question is saved first, then consumed by the one-second 2D black-hole interaction with exactly three glass droplets bouncing on an invisible baseline.
   - The first meaningful game action and foreground interventions collapse the optional setup. It only reopens when the user chooses to reopen it.
   - Context added during the run must affect that same active Reality Run.
   - The primary user comparison remains the same five perspectives: genuinely trying to stop, skeptical, low patience, returning, and mobile. Deliberately harsher edge cases remain regression tests rather than the primary source of product-reaction conclusions.
