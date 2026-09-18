# SPIN OUT — FINAL PRODUCTION MASTER PROMPT

## READ THIS FIRST

Continue directly from the existing Spin Out repository and all work already completed.

DO NOT restart the project.

DO NOT recreate the application from scratch.

DO NOT create a simplified replacement because an existing implementation is difficult to understand.

DO NOT remove working systems merely because rewriting them would be easier.

The GitHub repository is the canonical source of truth.

The objective of this chat is to take the current Spin Out build through its **final production pass**.

The custom domain itself may remain unpurchased for now. Everything required to support that domain should be prepared correctly before this work is considered finished.

The final standard is:

**implemented → rendered → inspected → compared → tested → corrected → deployed from GitHub → tested again.**

Do not treat any feature as complete merely because code exists.

---

# 1. PRIMARY CHAT GOAL

By the end of this chat, Spin Out should be a fully functional, visually premium web product with:

- A homepage that serves as the main game-selection hub.
  - **Example:** A new visitor should immediately see the available games instead of needing to navigate through another menu to discover them.
- Every game visible and selectable directly from the homepage.
  - **Example:** Slots should have its own large visual card showing actual premium game artwork rather than a text-only button saying “Slots.”
- Casino-level game visuals.
  - **Example:** Reels, symbols, lighting, controls, result states and backgrounds should feel authored like a real gaming product rather than a coded demonstration.
- The supplied Dribbble designs used as strict visual references.
  - **Example:** The liquid-glass sidebar should influence the actual construction, translucency, depth and active-state treatment of our sidebar instead of merely inspiring a blur effect.
- Spin Out’s existing premium brown visual identity preserved.
  - **Example:** Adapt reference-quality red/gold/green casino visuals into espresso, oxblood, bronze, warm cream, charcoal brown and controlled gold.
- Rich and accurate casino symbolism throughout the product.
  - **Example:** Cherries, BARs, bells, 7s, coins, gems and culturally specific symbols should be actual designed assets, not emojis or generic icons.
- Accurate Chinese symbols and cultural motifs where they fit the chosen casino visual language.
  - **Example:** A real Chinese character must remain linguistically correct after being redrawn into Spin Out’s visual style.
- Red intervention prompts distributed across the homepage.
  - **Example:** One may appear beside the game library while another appears lower in the page rather than six alerts being stacked together.
- No homepage intervention prompts sitting over an active game.
  - **Example:** Entering Slots removes the homepage prompt layer from the gameplay view.
- Sports betting completely removed.
  - **Example:** No sportsbook card, sports route, sports icon, sports copy or hidden abandoned `/sports` experience remains.
- New users receiving a real 48-hour trial.
  - **Example:** A trial created at 2:14 PM Monday expires at 2:14 PM Wednesday based on server time.
- RevenueCat used for subscription entitlement management.
  - **Example:** Paid access is determined from the authenticated RevenueCat customer rather than `localStorage`.
- Paddle used as the first billing provider to implement/test with RevenueCat, subject to merchant approval.
  - **Example:** A sandbox Paddle purchase becomes a RevenueCat paid entitlement for the same authenticated Spin Out account.
- Payment and subscription data trackable.
  - **Example:** Revenue, subscriptions, cancellations and customer status should be visible through the billing/RevenueCat systems and structured so Spin Out can later surface selected metrics internally.
- GitHub-native deployment.
  - **Example:** The production host clones the complete repository instead of receiving 79 project files through a limited file-upload action.
- A clean official-domain path.
  - **Example:** The deployed app can run temporarily on the host’s supplied URL and later switch to `spinitout.com` or another purchased domain through configuration rather than code rewrites.

---

# 2. STRICT VISUAL REFERENCES

Use these references throughout the implementation.

### REFERENCE A

Liquid Glass Effect Sidebar UI
[https://dribbble.com/shots/26138509--Liquid-Glass-Effect-Sidebar-UI](https://dribbble.com/shots/26138509--Liquid-Glass-Effect-Sidebar-UI)

### REFERENCE B

Casino Website Design in Chinese Style
[https://dribbble.com/shots/26710647-Casino-Website-Design-in-Chinese-Style](https://dribbble.com/shots/26710647-Casino-Website-Design-in-Chinese-Style)

### REFERENCE C

Casino Website | Gambling
[https://dribbble.com/shots/26768357-Casino-Website-Gambling](https://dribbble.com/shots/26768357-Casino-Website-Gambling)

These are not casual inspiration.

Study them closely.

For each major visual section:

1. Inspect the reference.
2. Identify what gives it its visual quality.
3. Reproduce those principles in Spin Out.
4. Preserve Spin Out’s identity.
5. Render the result.
6. Compare it visually.
7. Identify the largest remaining visual gap.
8. Correct that gap.
9. Repeat.

Do not stop after one pass.

---

# 3. REFERENCE A — LIQUID GLASS SIDEBAR

Use Reference A specifically for the navigation system.

## Floating construction

The sidebar should feel like a floating object.

- **Example:** Leave controlled space between the panel and the browser edge rather than attaching a flat rectangle directly to the viewport.

## Continuous glass body

Use one intentional glass surface.

- **Example:** Navigation items can sit within a large translucent brown-glass panel instead of each destination becoming a separate unrelated glass card.

## Transparency

The environment should remain faintly visible through the panel.

- **Example:** Background `QUIT` typography or lighting may subtly bleed through the sidebar without reducing navigation readability.

## Blur

Use proper backdrop separation.

- **Example:** Content behind the sidebar should soften through the glass rather than remain perfectly sharp.

## Edge lighting

Give the panel a delicate premium edge.

- **Example:** A faint warm-cream/bronze highlight can run along the edge where virtual light catches the glass.

## Depth

It should appear elevated.

- **Example:** Use layered shadows, ambient light and internal highlights rather than a single generic `box-shadow`.

## Active navigation

The selected destination should appear integrated into the glass.

- **Example:** HOME can sit inside a brighter internal glass capsule with increased opacity and subtle internal illumination.

## Navigation icons

All icons need consistent visual weight.

- **Bad example:** One thin Lucide icon beside a thick custom SVG beside an emoji.
- **Correct example:** One coherent icon system with matching dimensions, stroke weight and rendering quality.

## Motion

Navigation state should move fluidly.

- **Example:** The active glass highlight can glide between destinations rather than abruptly disappear and reappear.

## Brown adaptation

Do not reproduce the reference’s exact green palette.

- **Spin Out example:** Smoked espresso glass + bronze highlights + warm cream typography + oxblood accent state.

---

# 4. REFERENCE B — CHINESE CASINO VISUAL RICHNESS

KEEP THE CHINESE VISUAL LANGUAGE.

Do not strip it out.

Do not respond to originality concerns by flattening the design.

Do not turn rich cultural/casino artwork into minimal line icons.

Reference B is useful precisely because it is:

- rich
- dramatic
- ornamental
- dimensional
- layered
- visually dense
- premium

Spin Out should retain that level of visual ambition.

The artwork itself must become original Spin Out artwork.

---

# 5. CHINESE SYMBOL ACCURACY

Every Chinese character or culturally specific element used in Spin Out must be accurate.

Before implementing one:

1. Identify exactly what it is.
2. Identify its meaning.
3. Verify the actual character/object.
4. Verify orientation.
5. Verify the component has not been distorted into another character.
6. Create the original Spin Out artwork.
7. Check it again at final rendered size.

### Never create fake pseudo-Chinese writing

- **Bad example:** Drawing random strokes that “look Chinese.”
- **Bad example:** Generating an ornamental glyph and assuming it means luck.
- **Correct example:** Identify a legitimate character found in the reference or selected deliberately, verify its meaning, then redraw it faithfully.

### Character redesign

The underlying character must remain correct.

Its presentation may change.

- **Example:** A correctly drawn fortune-related character could receive:
  - an oxblood lacquer surface
  - raised bronze framing
  - carved internal texture
  - warm edge illumination
  - different ornamental geometry
  - original Spin Out animation

The character remains linguistically correct.

The artwork becomes visually original.

### Cultural objects

Verify objects too.

- **Example:** If using a traditional Chinese cash coin, preserve its defining structural characteristics rather than drawing a generic gold circle with random writing.
- **Example:** If using an ingot-inspired object, understand what it actually looks like before stylizing it.

Accuracy applies to:

- characters
- coins
- ingots
- ornamental patterns
- culturally specific luck/fortune imagery
- any other identifiable cultural symbol introduced into the interface.

---

# 6. ORIGINALITY DOES NOT MEAN LOWER QUALITY

The references should be followed closely for:

- composition
- visual density
- level of polish
- layering
- lighting
- material treatment
- interaction quality
- navigation structure
- card richness

Do not literally reproduce proprietary artwork asset-for-asset.

Instead:

**REFERENCE QUALITY → ORIGINAL SPIN OUT ART AT THE SAME QUALITY LEVEL.**

### Example

Reference:

rich red-and-gold fortune emblem.

Wrong adaptation:

small flat red SVG.

Correct adaptation:

- same general visual importance
- equally detailed
- equally dimensional
- equally polished
- different silhouette
- different frame
- different ornament
- different material combination
- Spin Out brown/oxblood palette
- correctly represented underlying symbol

Originality should come from the art direction.

It should not come from making things worse.

---

# 7. EVERY CASINO SYMBOL GETS THIS TREATMENT

This requirement applies to **every symbol**, not only Chinese imagery.

Create a full symbol inventory from:

- supplied references
- current homepage
- current game cards
- active games
- backgrounds
- decorative assets
- reel sets
- win animations
- intervention environments

Potential symbols include, where appropriate:

- 7
- 77
- 777
- BAR
- double BAR
- triple BAR
- cherries
- lemons
- oranges
- grapes
- watermelon
- bell
- diamond
- ruby
- other gems
- star
- horseshoe
- crown
- coins
- stacked coins
- card suits
- cards
- dice
- jackpot marks
- reel frames
- roulette-related imagery where applicable
- traditional Chinese coin imagery
- ingot-inspired imagery
- verified Chinese fortune/luck imagery
- lantern-inspired decorative forms where appropriate
- any additional symbol visible in our chosen references
- any additional symbol already used by a current Spin Out game

Do not force every symbol into every game.

Create the inventory first, then use symbols intentionally.

---

# 8. SYMBOL VISUAL QUALITY

Every primary symbol should survive being enlarged.

Ask:

**Would this still look professionally illustrated at 300% scale?**

If enlargement reveals:

- emoji
- text pretending to be artwork
- generic icon
- primitive gradient
- low-effort SVG
- blurry source image
- obvious generated artifact
- flat silhouette with no intended styling

then replace it.

## 7

- **Bad example:** Red text saying `7`.
- **Correct example:** A ruby-enamel dimensional 7 with a bronze backing, bevel, highlight and controlled shadow.

## BAR

- **Bad example:** Plain text in a rectangle.
- **Correct example:** Black lacquer plate, raised warm typography, metallic edge and small material reflections.

## Cherry

- **Bad example:** 🍒
- **Correct example:** Original illustrated fruit with dimensional skin, individual stems, highlight and controlled shadow.

## Diamond

- **Bad example:** Generic outline icon.
- **Correct example:** Faceted jewel with deliberate facet geometry, internal reflections and restrained light movement.

## Bell

- **Bad example:** Navigation bell icon reused as reel artwork.
- **Correct example:** Custom slot-style bell with proper material, depth, clapper, rim and reflection.

## Coin

- **Bad example:** Gold circle.
- **Correct example:** Physical thickness, engraved face, edge detail, varying perspective and believable stacking.

## Chinese symbol

- **Bad example:** Fake red glyph.
- **Correct example:** Verified underlying character surrounded by original dimensional Spin Out framing.

---

# 9. SYMBOL STATES

Important symbols should not behave like static stickers.

Where applicable provide states such as:

### Normal

- **Example:** Diamond shows restrained reflections.

### Anticipation

- **Example:** Subtle internal light becomes slightly stronger when the final reel could create a matching result.

### Win

- **Example:** A brief controlled specular sweep crosses the matching symbols.

### Disabled/inactive

- **Example:** Reduce luminance and emphasis without making the symbol unreadable.

Do not make everything pulse permanently.

Constant glowing destroys hierarchy.

---

# 10. SPIN OUT COLOR SYSTEM

The brown identity stays.

## Main colors

Use variations of:

- espresso
- dark chocolate
- charcoal brown
- oxblood
- warm cream
- muted bronze
- aged gold
- dark lacquer
- near-black warm brown

## Red

Use red deliberately.

Main uses:

- intervention prompts
- psychological interruption
- important warnings
- destructive action
- selected game accents where composition requires it
- **Example:** A Reality Prompt can use a deep red glass surface that intentionally breaks the otherwise warm-brown casino environment.

Do not make the whole application red.

## Gold/bronze

Use for:

- frame edges
- premium detail
- illuminated boundaries
- symbol materials
- select highlights
- **Example:** A reel frame may use dark bronze with slight aged variation rather than bright yellow gold.

## Cream

Use for primary readable text.

- **Example:** Major heading typography should feel warmer than pure `#FFFFFF`.

---

# 11. HOMEPAGE = MAIN GAME HUB

The homepage must show the games.

Do not hide them behind another page.

## All games visible

Every intended playable game should appear on the homepage.

- **Example:** A user should be able to move from homepage → selected game with one clear selection.

## Cards communicate the game visually

A user should understand the type of game before reading its title.

- **Example:** A slot card visibly contains reel machinery/symbols rather than only the word “Slots.”

## Card hierarchy

Do not force every game into the exact same rectangle.

- **Example:** A primary/featured game may receive a larger composition while secondary games form a supporting grid.

## Card depth

Use:

- environment
- foreground
- midground
- lighting
- framing
- masking
- typography
- motion
- **Example:** A foreground coin may extend slightly past the reel artwork while the background fades naturally into the card frame.

## Hover state

- **Example:** On desktop, artwork can move several pixels toward the viewer, lighting can rise slightly and PLAY can become more prominent.

## Pressed state

- **Example:** Tapping a game card should provide immediate tactile feedback before route transition.

## Mobile

- **Example:** Game cards reorganize into an intentionally designed mobile library instead of shrinking desktop cards until text becomes tiny.

---

# 12. HOMEPAGE BACKGROUND

The homepage should feel like a designed environment.

Do not use a plain brown gradient.

The background must include:

## QUIT

Use `QUIT` repeatedly throughout the environmental composition.

Do not create simple wallpaper.

### Far depth example

One oversized partially cropped:

**QUIT**

sitting behind a major section at very low contrast.

### Mid-depth example

A smaller angled `QUIT` partially disappearing behind a game-card grouping.

### Texture example

Fragments of the word can become part of larger environmental typography.

Vary:

- scale
- rotation
- cropping
- opacity
- depth
- position

---

# 13. CASINO SYMBOLS IN THE BACKGROUND

Use the full visual vocabulary.

Possible background elements include:

- 7
- BAR
- bell
- cherry
- diamond
- coins
- cards
- reel fragments
- Chinese symbols
- Chinese-style coin
- ingot-inspired forms
- decorative fortune/casino motifs
- game-specific iconography

### Far layer

- **Example:** Giant blurred 7 almost disappearing into the environment.

### Mid layer

- **Example:** Dimensional coin behind the game-library section.

### Near decorative layer

- **Example:** Partial bronze reel housing cropped by the viewport edge.

### Important

Do not use emoji.

Do not create repeating rows like:

`7 🍒 💎 7 🍒 💎`

It should look art-directed.

---

# 14. RED HOMEPAGE PROMPTS

Keep the red prompt concept.

They should appear in different areas around the homepage.

They should feel slightly disruptive on purpose.

## Distribution

- **Example:** One beside a featured game.
- **Example:** Another between game sections.
- **Example:** Another near the right edge of a later homepage area.

Do not stack them all inside one notification tray.

## Do not cover games

- **Example:** A prompt cannot cover PLAY, a game title or another interaction because an absolute coordinate happened to place it there.

## Do not appear over active gameplay

Once a game opens:

remove the homepage scattered prompt layer.

## Individually dismissible

Each prompt gets its own dismissal.

- **Example:** Clicking X animates only that prompt out.

## Exit motion

Do not immediately use `display:none`.

- **Example:** Short opacity + scale + translation motion.

## Style

They must belong to Spin Out.

- **Example:** Deep-red translucent panel, warm red border, controlled internal glow, premium typography and an integrated close control.

Do not use browser-alert styling.

## Responsive behavior

Recompose them on smaller screens.

- **Example:** A floating desktop prompt may become an intentional inline interruption between two mobile game cards.

---

# 15. REMOVE SPORTS BETTING

Sports betting no longer belongs in Spin Out.

Remove it everywhere.

Audit:

- homepage
- game cards
- navigation
- sidebar
- routes
- metadata
- onboarding
- descriptions
- search copy
- images
- assets
- seed data
- API endpoints
- tests
- internal links
- abandoned components

### Route example

If `/sports` still renders a functional abandoned sportsbook after its navigation link was removed:

the removal is incomplete.

### Layout example

If deleting Sports leaves a blank hole in the homepage grid:

recompose the section.

Do not leave evidence of deleted functionality.

---

# 16. EVERY GAME MUST LOOK LIKE A FINISHED CASINO GAME

Do not accept “functional web mini-game” visuals.

Every game needs:

- authored environment
- dimensional controls
- real symbols/artwork
- lighting
- game-specific composition
- animation
- result choreography
- sound
- responsive layout
- polished entry/exit states

## Game frame

- **Bad example:** `<div>` with three columns and SPIN.
- **Correct example:** Designed reel housing, inset display region, deliberate material hierarchy and integrated controls.

## Lighting

- **Example:** Primary interaction area receives warmer focused lighting while secondary information recedes.

## Materials

Use believable visual material families such as:

- dark lacquer
- glass
- bronze
- enamel
- polished gem
- illuminated plastic
- textured metal

## Background

- **Example:** Slots may use a deep-brown chamber with blurred reel imagery and warm machine illumination.

## Result state

- **Example:** Winning symbols illuminate in synchronization with the actual determined result.

## Loss state

- **Example:** Lighting settles, balance changes correctly and the experience transitions naturally into the next state/intervention.

---

# 17. GAME LOGIC MUST CONTROL THE VISUALS

Never let the animation invent the outcome.

Correct flow:

**calculate/receive result → animation resolves to that result → balance updates consistently.**

### Example

If result engine returns:

Cherry / BAR / 7

the rendered reels must stop on:

Cherry / BAR / 7.

Not:

7 / 7 / 7

because the animation randomly stopped somewhere else.

---

# 18. INDIVIDUAL GAME AUDIT

For EVERY current game, create a dedicated checklist.

Do not say “games tested” collectively.

Test each separately.

For each game verify:

### Loads

- **Example:** Opens from the actual homepage card without missing assets or console exceptions.

### Initial state

- **Example:** Displayed starting balance matches authoritative session state.

### Primary action

- **Example:** One click generates one game action.

### Rapid clicking

- **Example:** Ten rapid clicks cannot create ten simultaneous wagers/actions.

### Outcome

- **Example:** Logic resolves deterministically according to the game rules.

### Balance

- **Example:** Starting at 300 credits, spending 20 and receiving 0 correctly results in 280.

### Animation

- **Example:** Visible result matches logic result.

### Audio

- **Example:** Win sound cannot play for a loss.

### Refresh

- **Example:** Refresh cannot magically restore spent credits.

### Navigation away

- **Example:** Leaving during animation cannot leave unresolved contradictory state.

### Return

- **Example:** Re-entering correctly restores whatever state is designed to persist.

### Mobile

- **Example:** Primary control remains comfortably tappable at narrow viewport sizes.

### Failure

- **Example:** Server failure produces a recoverable state rather than a frozen game.

---

# 19. SOUND DESIGN

Games need excellent sound.

The objective is a convincing, tactile and immersive simulated casino environment that makes interactions feel physical and polished.

Because Spin Out is a gambling-intervention product, use this realism to support the intervention experience. Do not optimize audio around keeping users gambling indefinitely.

Create a reusable audio system.

## Button

- **Example:** Short premium tactile click.

## Game start

- **Example:** Subtle mechanical activation cue.

## Reel movement

- **Example:** Movement sound synchronized to animation rather than unrelated looping audio.

## Reel stop

- **Example:** Each reel receives a short physical stop sound.

## Anticipation

- **Example:** If the final reel could complete a match, introduce a restrained rising cue.

## Small win

- **Example:** Short satisfying confirmation.

## Larger simulated win

- **Example:** Richer layered sound matched with a stronger visual result.

## Loss

- **Example:** Shorter lower-energy resolution sound.

## Balance movement

- **Example:** Controlled count sound without playing 200 overlapping coin samples.

## Intervention / Reality Ping

This needs a clearly different sonic identity.

- **Example:** Casino sound abruptly gives way to a distinct restrained Reality Ping cue.

That contrast matters.

## Dismissal

- **Example:** Soft short exit sound.

## Transition

- **Example:** Entering a game gets a subtle environmental transition rather than silence followed by sudden audio.

---

# 20. AUDIO ENGINE REQUIREMENTS

Do not scatter individual audio tags through random components.

Build a reusable system.

It must include:

- master mute
- master volume
- persistent preference
- audio category handling where useful
- overlap control
- asset preloading where appropriate
- mobile/browser gesture compliance
- graceful asset failure

### Persistence example

User mutes audio → refreshes → audio remains muted.

### Overlap example

Rapid SPIN clicks cannot trigger ten copies of the same sound.

### Browser example

Do not attempt loud autoplay before the browser has received a valid user gesture.

### Failure example

Missing one optional sound file does not crash gameplay.

Use original or properly licensed audio.

Do not rip sounds from existing casino games.

---

# 21. NEW USER 2-DAY TRIAL

Every eligible new account receives a real:

**48-HOUR TRIAL**

Do not interpret “2 days” as “until midnight two days later.”

Use an exact server-side timestamp.

### Example

Account created:

September 18 at 1:15 PM

Trial expires:

September 20 at 1:15 PM.

---

# 22. TRIAL SOURCE OF TRUTH
Do not put trial authority in:

- localStorage
- sessionStorage
- frontend cookie alone
- client clock

Store trial information server-side.

A clean architecture is:

`trial_started_at`
`trial_ends_at`

associated with the authenticated user.

Access resolver:

`trialActive OR paidEntitlementActive`

### Example

User has:

trial\_ends\_at = future
RevenueCat premium = false

Result:

premium access during trial.

### Example

User has:

trial\_ends\_at = past
RevenueCat premium = true

Result:

premium access continues because they paid.

### Example

User has:

trial\_ends\_at = past
RevenueCat premium = false

Result:

premium access denied.

---

# 23. TRIAL SECURITY

Clearing browser data cannot reset trial.

Logging out cannot reset trial.

Changing browsers cannot reset trial.

Changing computer clock cannot reset trial.

### Example

User starts trial on Chrome.

They log into the same account from Safari.

The server returns the same expiration.

Do not automatically give another 48 hours.

---

# 24. REVENUECAT IS REQUIRED

RevenueCat should become the canonical paid-subscription entitlement layer.

Use the currently supported RevenueCat web integration.

Current RevenueCat Web uses:

`@revenuecat/purchases-js`

Do not merely install it.

Actually integrate it.

Use one canonical entitlement name, such as:

`premium`

Do not create competing names such as:

- Plus
- Pro
- subscriber
- paid
- member
- premiumUser

throughout unrelated code.

Map everything through one entitlement abstraction.

---

# 25. AUTHENTICATED REVENUECAT IDENTITY

RevenueCat identity must correspond to the authenticated Spin Out user.

### Example

Supabase/auth user ID:

`abc123`

RevenueCat App User ID:

`abc123`

or another stable server-controlled mapping.

The mapping must remain consistent across sessions.

### Example

User pays on desktop.

They log into Spin Out on another browser.

RevenueCat resolves the same account and returns the same active entitlement.

Do not identify subscriptions by an easily changed email alone if a stable authenticated ID exists.

---

# 26. REVENUECAT IS NOT THE CARD PROCESSOR

RevenueCat manages subscription information and entitlements.

A billing engine actually charges the customer.

For Spin Out, implement/test:

**RevenueCat + Paddle Billing**

first, subject to merchant approval for the product.

Architecture:

**User**
↓
**Spin Out**
↓
**RevenueCat Web**
↓
**Paddle Billing**
↓
**Payment**
↓
**RevenueCat entitlement**
↓
**Spin Out access**

Paddle acts as the billing engine/merchant of record in this configuration.

Do not implement unsupported combinations because another provider happens to be installed.

---

# 27. WHY THIS PAYMENT STACK IS BEING USED

The launch requirement is:

- no monthly payment-platform bill before revenue
- real card payments
- subscription management
- revenue tracking
- customer tracking
- entitlement tracking
- proper payment lifecycle
- international-friendly merchant setup where approved

Paddle currently uses pay-as-you-go transaction pricing rather than a monthly platform fee.

RevenueCat can be started without a monthly charge at the initial revenue level.

The exact current pricing is not hardcoded into customer-facing application logic.

Verify current provider terms during setup.

---

# 28. PADDLE APPROVAL CONDITION

Spin Out is NOT a real-money casino.

Represent it accurately.

Product characteristics:

- simulated casino-style interactions
- no real-money wagering
- no deposits for gambling
- no withdrawal of simulated credits
- no cash prizes from the games
- no redeemable credits
- subscription payment purchases access to software
- intervention/behavior-awareness purpose

Do not falsely describe Spin Out as something else to obtain approval.

Do not falsely describe it as real-money gambling either.

Before production activation:

submit/confirm the actual product with Paddle under its real use case.

If Paddle rejects the product:

do not circumvent the rejection.

Keep the billing abstraction clean enough that another legitimate provider can replace it.

---

# 29. PADDLE SANDBOX FIRST

Before production credentials exist:

fully integrate Paddle sandbox with RevenueCat.

Configure:

1. Paddle sandbox merchant.
2. Subscription product.
3. Price.
4. RevenueCat Paddle configuration.
5. Product import.
6. RevenueCat entitlement.
7. RevenueCat offering/package.
8. RevenueCat Web SDK.
9. Authenticated user identity.
10. Checkout.
11. Result/entitlement synchronization.

Do not fake successful purchase state.

---

# 30. PAYMENT SUCCESS TEST

Test the real sandbox journey:

new account
→ trial starts
→ subscribe
→ checkout
→ successful sandbox payment
→ RevenueCat customer updates
→ `premium` entitlement active
→ premium access remains
→ refresh
→ access remains
→ sign out
→ sign back in
→ access remains.

Document the observed result.

---

# 31. CANCELLED PAYMENT TEST

Test:

checkout
→ cancel
→ return.

Expected:

- no false paid entitlement
- account stays trial/free as appropriate
- application remains usable
- user can retry

---

# 32. FAILED PAYMENT TEST

Use legitimate Paddle sandbox/test failure behavior.

Expected:

- transaction fails
- RevenueCat does not incorrectly grant premium
- user receives clear recoverable feedback
- no broken loading state
- retry remains available

---

# 33. REVENUECAT / PADDLE LIFECYCLE TESTING

Test actual supported sandbox subscription behavior.

Do not fake webhook events if the provider/integration does not treat simulated events as real subscription changes.

Test real sandbox flows where required.

Verify:

- purchase
- entitlement activation
- customer mapping
- cancellation behavior
- expiration behavior where testable
- payment failure
- persistent entitlement

---

# 34. PAYMENT TRACKING

I need to be able to track money.

At minimum make sure the stack exposes:

- customer
- subscription
- plan/product
- status
- start date
- trial state
- renewal status
- cancellations
- successful payment
- failed payment
- refunds where applicable
- gross revenue
- transaction history

Paddle/RevenueCat dashboards remain the initial operational dashboards.

Structure the integration so selected metrics can later be surfaced inside a Spin Out admin dashboard.

### Example

Do not hardwire the homepage UI directly to Paddle API calls.

Use a proper server-side billing service/module that could later power:

`/admin/revenue`

without exposing private credentials.

---

# 35. NEVER PUT SECRET PAYMENT CREDENTIALS IN THE CLIENT

Public keys may go where officially intended.

Secret keys must remain server-side/environment-controlled.

Never commit:

- Paddle secrets
- webhook secrets
- Supabase service-role secret
- private RevenueCat keys
- production tokens

to GitHub.

### Example

Correct:

host environment secret.

Incorrect:

`const PADDLE_SECRET = "live_secret..."`

inside the repository.

---

# 36. SERVER-SIDE ACCESS PROTECTION

Do not rely on frontend hiding.

### Bad

`if (!premium) hide button`

while premium API route remains public.

### Correct

Both:

- UI reflects access
- backend/protected route verifies access.

Protected functionality should resolve:

`trialActive || RevenueCatPremiumActive`

from trusted sources.

---

# 37. HOMEPAGE TRIAL UI

Trial information should exist without dominating the product.

### Example

Account area:

`Trial • 37 hours left`

or an appropriately human-readable equivalent.

Do not place a giant countdown on every screen.

Near expiration:

increase clarity.

- **Example:** “Your trial ends tomorrow” may appear in the account/paywall area.

Do not use deceptive urgency.

---

# 38. SUBSCRIPTION UX

The upgrade experience should look like Spin Out.

Do not dump a default unstyled billing widget into the middle of a premium interface if customization is possible.

Paywall should clearly explain:

- what the subscription unlocks
- price
- billing frequency
- trial/current entitlement
- cancellation expectations
- primary action

### Example

The checkout button should use the same premium material/typographic system as the rest of Spin Out while still remaining clearly identifiable.

Do not obscure the actual price.

---

# 39. GITHUB IS THE DEPLOYMENT SOURCE OF TRUTH

The previous deployment limitation was caused by attempting a file-based deployment path that could not atomically ingest the complete repository tree.

Do not repeat that architecture.

Production deployment must connect directly to GitHub.

Correct:

GitHub repository
→ hosting provider’s native Git integration
→ full clone
→ install
→ build
→ deploy.

Incorrect:

GitHub
→ manually collect some files
→ send them through a limited action
→ deploy incomplete approximation.

The full repository must be built.

---

# 40. DO NOT MERGE TO MAIN YET

Do not merge the release branch into `main` simply to test production.

Use the release candidate first.

Flow:

release branch
→ GitHub
→ preview/staging deployment
→ visual tests
→ functional tests
→ payment sandbox tests
→ auth tests
→ mobile tests
→ console/network checks
→ PASS
→ merge exact verified commit to `main`.

The commit tested should be the commit promoted.

Do not test one implementation and deploy a materially different one.

---

# 41. HOSTING PLATFORM

The host does NOT have to be Vercel.

The requirement is:

- direct GitHub integration
- complete repository checkout
- framework compatibility
- environment variables
- server-side application support
- custom domains
- HTTPS
- preview/staging deployment
- production deployment

Evaluate:

### First: Netlify

Netlify can connect directly to GitHub and supports custom domains.

Use it if the repository’s actual architecture is compatible.

### Second: existing Vercel project using native GitHub integration

This is different from the failed file-based deployment path.

If native Git integration solves the complete-repository issue cleanly, Vercel remains valid.

### Other legitimate options

Where technical compatibility requires it, evaluate:

- Cloudflare's current full-stack deployment path
- Render
- another appropriate Git-connected production platform

Do not choose based on brand preference.

Choose based on the actual repository.

---

# 42. DO NOT USE GITHUB PAGES FOR THE APP

GitHub should remain source control.

Do not force the dynamic Spin Out application onto static GitHub Pages just because the source code is stored on GitHub.

Spin Out needs dynamic behavior including:

- authentication
- database access
- trial resolution
- RevenueCat
- payment lifecycle
- protected access
- server-side actions/API behavior

Use an appropriate full-stack host.

---

# 43. CUSTOM DOMAIN PATH

I will purchase the final domain soon.

Prepare everything now.

Possible flow:

GitHub
→ Netlify/Vercel/compatible host
→ temporary host URL
→ final custom domain.

If using Netlify, its domain management can connect an existing domain or purchase one.

I may also buy the domain through a registrar and connect DNS later.

Do not couple the code to one registrar.

---

# 44. CENTRALIZE SITE URL CONFIGURATION

Do not hardcode the current preview URL across the repository.

Centralize domain-sensitive configuration.

Audit:

- canonical URL
- auth callback URL
- Supabase redirect URLs
- payment success/cancel URL
- RevenueCat/Paddle URLs where applicable
- email links
- OpenGraph URLs
- CORS origins
- metadata
- CSP where applicable

### Example

Preview:

`https://spin-out-example.netlify.app`

Later:

`https://spinitout.com`

That change should primarily be an environment/configuration update.

---

# 45. DEPLOYED SITE TESTING

Do not test only localhost.

Once the full release candidate is deployed from GitHub, test the actual URL.

Test:

## Homepage

- renders
- game artwork loads
- background loads
- prompts behave
- sidebar works

## Auth

- signup
- sign-in
- sign-out
- session persistence

## Trial

- creation
- access
- server-side state

## Games

EVERY game individually.

## Audio

- user-gesture startup
- sounds
- mute
- persistence

## Payments

- sandbox checkout
- cancellation
- successful purchase
- failed purchase
- entitlement update

## Access

- trial
- free/expired
- paid

## Mobile

- actual narrow viewport

## Console

- meaningful errors resolved.

## Network

- broken requests resolved.
- duplicate critical requests resolved.

---

# 46. RESPONSIVE DESIGN

Do not treat mobile as a smaller desktop.

## Desktop

- floating glass sidebar
- broad game compositions
- environmental prompts
- deep background

## Tablet

- restructure before cards become cramped.

## Mobile

- navigation changes form appropriately
- prompts become intentional inline/floating mobile elements
- games remain visually rich
- controls remain large enough
- artwork is cropped intentionally
- no horizontal overflow

### Example

A giant background `QUIT` can extend beyond the viewport through controlled clipping.

It must not create a horizontal scrollbar.

---

# 47. MOTION SYSTEM

Use one coherent motion language.

## Navigation

Subtle.

- **Example:** 160–250ms style interaction class where appropriate.

## Game artwork

More expressive.

- **Example:** layered reel/card movement or cinematic transitions.

## Intervention

Distinct.

- **Example:** Reality Prompt grows in quickly enough to interrupt attention but remains readable.

## Dismissal

Fast and controlled.

## Background

Do not animate everything constantly.

- **Bad example:** Every symbol endlessly floating independently.

Use motion where it provides hierarchy or feedback.

Respect reduced-motion preferences.

---

# 48. TYPOGRAPHY

Typography must feel intentional.

Define:

- display typography
- game typography
- body typography
- numerical typography
- labels
- intervention typography

## Numbers

Where balances update repeatedly, use stable-width/tabular numerals if appropriate.

- **Example:** `$300` changing to `$280` should not cause neighboring controls to jump.

## Hierarchy

If color were removed, hierarchy should still be understandable.

- **Example:** Game name > balance > secondary metadata.

---

# 49. LOADING STATES

Do not allow premium pages to become crude during loading.

## Homepage

- **Example:** Game-card skeletons resemble the actual card shapes.

## Entitlement

Prevent incorrect plan flashing.

- **Example:** Do not briefly show FREE while paid status is still loading.

## Game

Preload essential visual/audio assets where reasonable.

## Checkout

Disable repeated purchase action while initializing.

---

# 50. ERROR STATES

Design critical failures.

## Auth

Plain useful message.

## Game

Recoverable retry without duplicated transaction.

## Payment

Clear failure + retry.

## Audio

Fallback without breaking gameplay.

## Network

Avoid infinite spinner.

### Example

If a spin request fails after the click:

do not deduct twice when the player retries.

---

# 51. ACCESSIBILITY

Premium visuals still need to work.

Check:

- color contrast
- keyboard navigation
- focus states
- semantic buttons/links
- touch targets
- reduced motion
- audio-independent information

### Example

A red prompt cannot communicate something important only by playing a sound.

### Example

A clickable game card should not be a non-semantic `<div>` with no keyboard access.

---

# 52. PERFORMANCE

Do not trade functional performance for visual richness.

Optimize:

- game thumbnails
- SVG/vector assets
- image formats
- responsive images
- lazy loading
- asset caching
- background decorations
- audio loading
- animation performance

### Bad example

Eight 6MB PNG game cards loaded immediately on mobile.

### Correct example

Appropriately compressed responsive artwork with essential above-the-fold assets prioritized.

---

# 53. REMOVE “GENERATED APP” VISUAL TELLS

Audit for:

- generic Tailwind gradient cards
- every section using identical radius
- every component using same card shell
- excessive pills
- random glows
- mixed icon libraries
- huge empty hero space
- generic centered heading + grid
- default shadcn appearance left untouched
- icons replacing real game artwork
- form controls being used as game controls
- arbitrary purple/blue SaaS gradients
- repeated spacing values regardless of composition
- identical game-card layouts
- placeholder art

### Example

Bad:

dark rectangle

- Lucide cherry
- “Slots”
- generic button.

Correct:

illustrated reel composition

- custom symbols
- depth
- environmental lighting
- premium title treatment
- integrated PLAY interaction.

---

# 54. VISUAL REFERENCE LOOP

For each major page, use:

**reference → screenshot of ours → comparison → largest gap → fix → new screenshot.**

Specifically compare:

## Sidebar

Does it actually have liquid-glass depth?

## Homepage

Does it feel like a game destination?

## Cards

Do they resemble entertainment artwork rather than SaaS cards?

## Background

Does negative space contribute to atmosphere?

## Symbols

Are they all proper artwork?

## Chinese elements

Are they accurate AND polished?

## Brown adaptation

Did we preserve the richness of the reference instead of making everything dull?

## Mobile

Was it art-directed separately?

Repeat.

Do not stop because one screenshot “looks pretty good.”

---

# 55. FUNCTIONAL TEST JOURNEY

Test this complete journey:
new visitor
→ homepage
→ inspect games
→ signup
→ 48-hour trial created
→ choose game
→ play game
→ hear audio
→ receive applicable intervention
→ dismiss intervention
→ return home
→ choose another game
→ verify state
→ open subscription flow
→ Paddle sandbox checkout
→ successful payment
→ RevenueCat entitlement changes
→ refresh
→ access remains
→ sign out
→ sign in
→ paid access remains.

Do this against the deployed release candidate.

---

# 56. FAILURE TEST JOURNEY

Also test:

## Trial expired

- **Expected:** premium denied unless paid.

## Clear local storage

- **Expected:** trial/payment state remains authoritative.

## Change browser

- **Expected:** same authenticated entitlement.

## Checkout cancelled

- **Expected:** no paid access.

## Payment failed

- **Expected:** no paid access.

## Rapid game click

- **Expected:** no duplicate transaction.

## Network failure

- **Expected:** controlled recovery.

## Auth expires

- **Expected:** protected action denied safely.

## Missing audio asset

- **Expected:** gameplay continues.

---

# 57. PRODUCTION SECRETS

Never fabricate production success.

If production Paddle credentials are not available:

say:

**Sandbox verified. Production Paddle activation requires real approved production merchant credentials.**

If the final domain is not purchased:

say:

**Domain-ready. Final custom-domain activation remains pending user purchase/connection.**

Do not insert fake credentials merely to make a checklist green.

---

# 58. FINAL IMPLEMENTATION ORDER

Work in this order unless repository dependencies make a different local order clearly necessary.

## Stage 1 — Audit

Identify exact files/routes/components for:

- homepage
- sidebar
- prompts
- games
- game art
- game logic
- sound
- auth
- trial
- subscription
- payment
- RevenueCat
- Paddle
- deployment
- responsive shell

Do not repeatedly scan the entire repository for every small change.

## Stage 2 — Functional problems

Fix broken game/auth/payment architecture first.

## Stage 3 — Core visual system

Establish:

- palette
- glass
- materials
- typography
- card system
- motion
- symbol system

## Stage 4 — Homepage

Finish:

- sidebar
- game hub
- background
- QUIT
- symbols
- prompts
- responsiveness

## Stage 5 — Games

Finish and test EACH game separately.

## Stage 6 — Sound

Implement reusable audio system + game cues.

## Stage 7 — Trial

Implement server-authoritative 48 hours.

## Stage 8 — RevenueCat/Paddle

Integrate sandbox completely.

## Stage 9 — GitHub-native preview deployment

Deploy the entire repository.

## Stage 10 — Screenshot/reference comparison

Desktop + mobile.

## Stage 11 — Real user journeys

Happy + failure paths.

## Stage 12 — Fix defects

Do not merely document fixable defects.

## Stage 13 — Release verification

Only after verification should the release candidate be considered ready for `main`.

---

# 59. HOMEPAGE ACCEPTANCE CRITERIA

Homepage is not complete until:

[ ] All games are visible.

[ ] Every card visually communicates its game.

[ ] Cards use real artwork.

[ ] Homepage reflects the reference-level gaming density.

[ ] Sidebar reflects Reference A closely in quality.

[ ] Reference B richness survives the brown adaptation.

[ ] Chinese symbols remain where intended.

[ ] Every Chinese element has been verified.

[ ] Other casino symbols are also premium artwork.

[ ] `QUIT` is integrated into the background.

[ ] Background has multiple depths.

[ ] Red prompts appear in varied positions.

[ ] Red prompts are individually dismissible.

[ ] Prompts do not obstruct game controls.

[ ] Prompts disappear from active gameplay.

[ ] Sports betting is gone.

[ ] Desktop is polished.

[ ] Tablet is polished.

[ ] Mobile is polished.

---

# 60. PER-GAME ACCEPTANCE CRITERIA

Repeat this separately for each game by name.

[ ] Loads from homepage.

[ ] Instructions/primary interaction are clear.

[ ] Complete gameplay loop works.

[ ] Logic is correct.

[ ] Balance/state math is correct.

[ ] Animation matches logic.

[ ] Rapid input cannot break state.

[ ] Visuals meet casino-quality target.

[ ] Symbols use finished artwork.

[ ] Environment is finished.

[ ] Controls are finished.

[ ] Result presentation is finished.

[ ] Sounds are correct.

[ ] Sounds synchronize with events.

[ ] Mute works.

[ ] Mobile works.

[ ] Keyboard/basic accessibility works.

[ ] Refresh behaves safely.

[ ] Navigation away behaves safely.

[ ] Return behaves correctly.

[ ] Errors recover safely.

[ ] No placeholder art.

[ ] No dead interactions.

---

# 61. TRIAL ACCEPTANCE CRITERIA

[ ] Eligible new user receives exactly 48 hours.

[ ] Start/end stored server-side.

[ ] Client clock cannot manipulate trial.

[ ] Local storage cannot reset trial.

[ ] Sign-out cannot reset trial.

[ ] Different browser cannot reset trial.

[ ] Expired trial loses premium access.

[ ] Paid entitlement overrides expired trial.

[ ] UI communicates trial accurately.

[ ] Trial has been manually tested.

[ ] Trial resolver has automated coverage where practical.

---

# 62. REVENUECAT ACCEPTANCE CRITERIA

[ ] RevenueCat Web SDK properly integrated.

[ ] Stable authenticated App User ID.

[ ] One canonical premium entitlement.

[ ] Paid access resolves from RevenueCat.

[ ] Frontend cannot grant itself paid access.

[ ] Protected backend routes/actions verify access.

[ ] Customer status survives another session.

[ ] Trial and paid logic do not conflict.

---

# 63. PADDLE ACCEPTANCE CRITERIA

[ ] Paddle sandbox configured.

[ ] Subscription product created.

[ ] Price configured.

[ ] RevenueCat Paddle integration configured.

[ ] Product imported.

[ ] Offering/package configured.

[ ] Checkout launches.

[ ] Successful sandbox payment completed.

[ ] RevenueCat entitlement activates.

[ ] Cancelled checkout tested.

[ ] Failed payment tested.

[ ] Account remains correct after refresh.

[ ] Account remains correct after sign-in again.

[ ] Production secrets not committed.

[ ] Production activation not falsely claimed without merchant approval/credentials.

---

# 64. PAYMENT TRACKING ACCEPTANCE CRITERIA

Confirm the operational systems can show:

[ ] customer

[ ] active subscription

[ ] expired subscription

[ ] trial

[ ] payment

[ ] failed payment

[ ] cancellation

[ ] transaction history

[ ] revenue reporting

[ ] refunds where applicable

[ ] renewal state

[ ] product/plan

Do not build a second homemade billing database unless needed for application-specific state.

Use provider data intelligently.

---

# 65. AUDIO ACCEPTANCE CRITERIA

[ ] Shared audio system.

[ ] Game interaction sounds.

[ ] Reel/action sounds.

[ ] Result sounds.

[ ] Intervention sounds.

[ ] Transition sounds where useful.

[ ] Volume balanced.

[ ] Master mute.

[ ] Mute persists.

[ ] Rapid actions do not create uncontrolled overlap.

[ ] Browser autoplay rules respected.

[ ] Mobile works.

[ ] Missing optional sound does not crash application.

[ ] Assets are original or properly licensed.

---

# 66. DEPLOYMENT ACCEPTANCE CRITERIA

[ ] Entire repository remains on GitHub.

[ ] Release commit identified.

[ ] Host connected directly to GitHub.

[ ] Complete repo checked out by host.

[ ] No 79-file manual transfer workaround.

[ ] Build passes.

[ ] Preview/staging works.

[ ] Environment variables configured.

[ ] Supabase works.

[ ] RevenueCat works.

[ ] Paddle sandbox works.

[ ] Games work on deployed URL.

[ ] Audio works on deployed URL.

[ ] Mobile works.

[ ] Console inspected.

[ ] Network inspected.

[ ] Domain configuration ready.

[ ] `main` not merged prematurely.

---

# 67. DOMAIN ACCEPTANCE CRITERIA

Until purchased:

[ ] Temporary deployed URL works.

[ ] No important production URL is hardcoded.

[ ] Auth redirect configuration can accept final domain.

[ ] Payment return URLs can accept final domain.

[ ] Canonical URL is configurable.

[ ] HTTPS will be available through chosen host/domain configuration.

[ ] Final domain can be connected without repository redesign.

Once I purchase the domain, connecting it should be an infrastructure/configuration task rather than a development project.

---

# 68. FINAL VISUAL QUESTIONS

Before completion ask:

### Sidebar

Does it genuinely look like premium liquid glass?

If it looks like:

brown rectangle + blur

continue.

### Homepage

Does it genuinely feel like a premium gaming destination?

If it looks like:

heading + four Tailwind cards

continue.

### Chinese artwork

Is it accurate?

If uncertain:

verify it.

### Symbols

Would they still look intentional at 300%?

If not:

redesign them.

### Brown palette

Did the adaptation preserve the reference’s richness?

If it became dull/minimal:

continue.

### Game visuals

Could these plausibly sit beside commercially produced casino-style web-game visuals without immediately looking like a prototype?

If not:

continue.

### Mobile

Does it look deliberately designed?

If it looks like desktop simply stacked vertically:

continue.

---

# 69. FINAL COMPLETION REPORT

Do not finish with:

“Everything is done.”

Create a verification matrix:

| AreaWork completedHow testedResultRemaining issue |
| ------------------------------------------------- |

Include individually:

- Homepage
- Liquid-glass sidebar
- Background
- QUIT system
- Chinese symbols
- Other casino symbols
- Game cards
- Red prompts
- Sports removal
- EACH GAME BY NAME
- Audio
- Authentication
- 48-hour trial
- RevenueCat
- Paddle
- Successful sandbox payment
- Cancelled payment
- Failed payment
- Entitlements
- Payment tracking
- Desktop
- Tablet
- Mobile
- GitHub deployment
- Production-preview URL
- Console
- Network
- Domain readiness

### Example

`Slots | Rebuilt reel housing, symbol set, result choreography and audio | 20 manual rounds + responsive check + production-preview test | PASS | None`

Evidence matters.

Code existence does not equal PASS.

---

# 70. FINAL DEFINITION OF DONE

This work is finished only when all of the following are true:

### VISUALS

[ ] Spin Out keeps its premium brown identity.

[ ] The supplied references have been studied closely.

[ ] The visual gap has been reduced through multiple comparison passes.

[ ] The sidebar reaches the intended liquid-glass quality.

[ ] Homepage reaches premium casino-site richness.

[ ] All games are visible from the homepage.

[ ] Every game card has authored visual artwork.

[ ] `QUIT` exists throughout the environmental background.

[ ] Casino symbols exist throughout the environmental composition.

[ ] Chinese symbols remain part of the visual language where intended.

[ ] Chinese characters/objects have been verified for accuracy.

[ ] All other casino symbols receive the same quality treatment.

[ ] Originality did not cause flattening or visual downgrading.

[ ] Red prompts appear throughout the homepage.

[ ] Prompts can be individually dismissed.

[ ] Prompts do not cover active gameplay.

[ ] Mobile looks intentionally designed.

### GAMES

[ ] Sports betting is completely removed.

[ ] Every remaining game loads.

[ ] Every game works.

[ ] Every game resolves correctly.

[ ] Every game has premium artwork.

[ ] Every game has real symbol art.

[ ] Every game has finished animation.

[ ] Every game has synchronized audio.

[ ] Every game has safe state handling.

[ ] No dead controls remain.

[ ] No placeholder art remains.

### TRIAL

[ ] New users receive 48 hours.

[ ] Trial is server-controlled.

[ ] Trial cannot be reset through browser tricks.

[ ] Expired trial is enforced.

[ ] Paid subscription correctly overrides expiration.

### PAYMENTS

[ ] RevenueCat integrated.

[ ] RevenueCat identifies authenticated customers.

[ ] One canonical premium entitlement exists.

[ ] Paddle sandbox integrated.

[ ] Successful sandbox purchase tested.

[ ] Cancelled checkout tested.

[ ] Failed payment tested.

[ ] Paid access survives refresh.

[ ] Paid access survives a new authenticated session.

[ ] Revenue/subscription information is trackable.

[ ] No secret credentials committed.

[ ] Production payment is not falsely claimed before Paddle approval/live credentials.

### DEPLOYMENT

[ ] GitHub remains source of truth.

[ ] Host pulls full repository directly from GitHub.

[ ] No incomplete 79-file handoff is used.

[ ] Release candidate is tested before merge.

[ ] Deployed URL has been manually exercised.

[ ] Desktop has been inspected.

[ ] Mobile has been inspected.

[ ] Console has been inspected.

[ ] Network has been inspected.

[ ] Critical defects are fixed.

### DOMAIN

[ ] Current temporary production/preview host works.

[ ] Final domain is configurable.

[ ] Domain-sensitive URLs are centralized.

[ ] No architecture depends on Vercel specifically unless Vercel proves to be the best compatible GitHub-native host.

[ ] The remaining domain action, if any, is simply me purchasing/connecting the final domain.

Do not declare completion because the build compiles.

Do not declare completion because automated tests are green.

Do not declare completion because one desktop screenshot looks good.

Continue until the actual deployed product, its games, payment flow, trial behavior, visual quality and critical user journeys satisfy this specification.