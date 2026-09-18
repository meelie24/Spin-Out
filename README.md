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
