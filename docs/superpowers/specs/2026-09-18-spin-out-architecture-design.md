# Spin Out architecture design

Spin Out is a browser-first pre-gambling intervention. Next.js owns navigation, setup, persistence, post-run flow and informational pages. Phaser 4 owns the simulated gambling surface. React and Phaser communicate through a narrow bridge: React samples a fixed fake-money outcome, updates the authoritative run state, then instructs Phaser to animate that already-committed result. Phaser never decides money outcomes.

The first-run setup is one interaction per screen and collects the fields in the master prompt. Returning users reuse saved context and normally answer only intended wager, trigger and urge; an expired obligation inserts a quick update. The fake deposit is a deliberately simulated funding moment labelled “Practice deposit · no real money.” It transfers the intended wager visually into the Reality Run balance without collecting payment details.

The Reality Run has a hard 900-second maximum with no visible countdown. The exit action uses the gambling-type-appropriate label and ends immediately. A fixed distribution drives fake outcomes. Stake can move among three bounded amounts derived from the intended wager so loss chasing and stake changes can be observed without real money, autoplay or retention mechanics.

Reality Pings are React overlays, not Phaser UI. They use translucent liquid glass, backdrop blur and a short 220–320 ms scale/fade entrance. The whole overlay dismisses in one click/tap. Ping facts are generated only from confirmed setup data and exact calculations; hypothetical comparisons use “could’ve.” Ping selection is spaced out and uses a simple on-device relevance score from prior exits after ping categories.

User context, run history, ping-learning statistics, Money Kept and time-to-exit history remain in localStorage. There are no advertising trackers or public sharing. The app includes signed-in/signed-out and Plus state models, but no external account or billing provider is fabricated. Production UI labels those provider-dependent capabilities unavailable until configured rather than pretending a charge or cross-device sync happened.

Visual direction: sleek sans typography, warm ivory/cocoa surfaces around setup/results, and a darker royal casino-rug Reality Run. The WebGL canvas is framed by restrained warm bulbs and reflected light. The 5×3 slot uses original SVG symbols, genuine vertical reel motion and no engineered near misses. Sports, casino, poker and lottery choices use distinct original Phaser surfaces with the same finite, fake-money Reality Engine.

Audio uses Web Audio: click, reel motor/ticks, result cues, ambient room tone and one serious Reality Ping cue. Sound can be muted; the experience is understandable without it. Reduced motion removes dramatic scale and reel travel without changing results.

Success criteria are the master prompt plus the owner’s later approvals: fake deposit, liquid-blur Pings, high immersion, lights/casino environment, no AI-copy tells, responsive mobile, and a visually finished consumer product.
