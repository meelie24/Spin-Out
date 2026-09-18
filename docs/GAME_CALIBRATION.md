# Spin Out game calibration specification

This file records the external game-model research and the implementation target for each Reality Run. The goal is category realism: each game follows the recognizable rules, state transitions, payout math, and result choreography of the game it represents.

## Slots

### Research target
- Real slot software determines the reel stops/result from RNG state, then animates the reels to those positions.
- Multi-line payouts are determined from the visible symbol arrangement and a paytable.
- Visual reel motion must never independently invent a result.

### Spin Out model
- 5 reels × 3 visible rows.
- 5 fixed paylines: top, middle, bottom, V, inverted V.
- 24-stop weighted virtual reel strip per reel.
- Six symbols: lemon, cherry, plum, bell, gem, seven.
- The engine selects all five stops first, derives the 3×5 grid, evaluates the paylines, computes the payout, then sends that exact grid to Phaser.
- Current paytable calibration is approximately mid-90% long-run return under independent random play. The automated Monte Carlo test accepts 90–99% to catch material drift.
- Slot animation must stop on the exact grid that produced the balance result.

### References reviewed
- Wizard of Odds: slot machine mechanics / reel-stop and paytable explanations.
- Commercial 5-reel slot gameplay video references used to compare reel timing, framing, and result cadence.

## Sportsbook

### Research target
- A moneyline bet selects the outright winner.
- Decimal odds show the total return including stake.
- A bet slip/selection should make the chosen side, odds, risk, and potential return understandable before settlement.

### Spin Out model
- Fictional events only.
- Three two-sided moneyline markets.
- Both sides are selectable.
- Displayed decimal odds drive the payout.
- Settlement probability is derived from normalized implied probabilities of the displayed two-way market, keeping the displayed price and simulated result model coherent.
- Current fictional markets carry a small sportsbook-style overround.
- A winning bet returns `stake × decimal odds`; a losing bet loses the stake.

### References reviewed
- FanDuel Sports Betting 101 and official Sportsbook walkthrough.
- Pinnacle current decimal-odds documentation.

## Roulette

### Research target
- European roulette uses a single-zero 37-pocket wheel.
- Red and Black each cover 18 numbers.
- Zero is green.
- Red/Black are even-money bets.
- Standard single-zero house edge on these bets is 1/37 ≈ 2.70%.

### Spin Out model
- Full 0–36 European wheel order.
- User chooses Red or Black.
- RNG selects one of 37 numbers uniformly.
- Red/Black win pays +1 stake net; opposite color or zero loses the stake.
- The wheel animation resolves to the exact number/color already selected by the engine.

### References reviewed
- Wizard of Odds: Roulette Basics.
- Live European roulette gameplay video references.

## Video Poker

### Research target
Standard video poker flow:
1. wager;
2. deal five cards from a 52-card deck;
3. choose individual cards to hold;
4. replace all unheld cards from the remaining deck;
5. evaluate the final five-card hand against the posted paytable.

### Spin Out model
- Jacks or Better.
- 52-card deck, no jokers.
- Two-stage Deal → Hold → Draw interaction.
- Each of the five cards can be held independently.
- In-progress hand, remaining deck, held flags, original wager, and balance-before-deal persist in the active-run state so refresh cannot create a new hand.
- 9/6 full-pay hand multipliers:
  - Royal Flush 800
  - Straight Flush 50
  - Four of a Kind 25
  - Full House 9
  - Flush 6
  - Straight 4
  - Three of a Kind 3
  - Two Pair 2
  - Jacks or Better 1
- With optimal strategy, published 9/6 Jacks or Better return is about 99.54%; user decisions can produce a different realized return.

### References reviewed
- Wizard of Odds: Video Poker Basics.
- Wizard of Odds: 9/6 Jacks or Better return table.
- Jacks or Better deal/hold/draw gameplay tutorials.

## Scratch / Instant Win

### Research target
- Digital scratch outcomes are determined before the visual reveal; revealing panels does not change the result.
- A common digital format reveals prize amounts and wins by matching three identical amounts.

### Spin Out model
- 9-panel Match 3 ticket.
- Ticket outcome is generated before the reveal animation.
- Losing tickets are explicitly constructed so no prize amount appears three times.
- Winning tickets contain exactly a valid match-three prize group plus non-winning filler panels.
- Reference win frequency is aligned to the Irish National Lottery Digital All Cash example (published win odds 1 in 3.75).
- The current prize mix is calibrated to roughly two-thirds long-run return; automated Monte Carlo bounds catch major drift.
- Phaser only reveals the already-generated ticket.

### References reviewed
- Irish National Lottery Digital All Cash.
- Irish National Lottery instant-win pages that explicitly state the result is set when the game is bought.
- Digital scratch gameplay references.

## Other

`other` is not presented as a sixth invented casino game. It uses the slot-style Reality Run when the person's real gambling product is not represented by the five calibrated categories above.

## Release rule

A game cannot be marked PASS only because it renders. Each game must pass:
- game-specific rules;
- state and balance math;
- logic → animation agreement;
- rapid-input protection;
- refresh/restore handling;
- exit/navigation handling;
- mobile layout;
- synchronized audio;
- browser-console checks.
