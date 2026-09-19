# Research Decision — Mobile Homepage Information Architecture

**Date:** 2026-09-19  
**Working branch:** `release/final-production-pass`  
**Category:** Mobile homepage information architecture

## Problem

Spin Out's current mobile first viewport is strong. It quickly communicates:
- `About to gamble?`
- what Spin Out does
- one dominant `Choose a game` action
- a premium casino/reality-run visual
- practice-only/no-cash-value context

The weakness starts below that first viewport.

Mobile currently stacks:
- four separate Reality Ping prompt cards
- six full-detail game cards split into two groups
- repeated game descriptions and purpose lines
- safety/supporting content

The visual identity is not the problem. The problem is the amount of full-detail content presented at equal visual weight and the vertical distance required to scan all six game choices.

## User signal

The prior synthetic UI/UX panel most often flagged the mobile homepage for:
- density
- spacing
- mobile ergonomics
- typography/hierarchy

Slow-scanning and low-attention profiles also took longer to orient and reach a game even though the hero itself was understood.

## Current Spin Out behavior

### Keep

- clear first viewport
- premium espresso/oxblood/bronze/cream identity
- Chinese casino influence
- rich game art
- literal `Choose a game` CTA
- all six game categories
- safety/help access
- no-cash-value cue

### Current weakness

The mobile games section largely uses the desktop information model stacked vertically:

1. rich hero
2. Reality Ping
3. games heading + supporting paragraph
4. Reality Ping
5. three large cards
6. Reality Ping
7. three more large cards
8. another prompt + safety note

Each item makes sense alone. Together they make choosing a game feel farther away than it needs to.

## Current leading product flows inspected

### 1. Netflix mobile, 2026

Netflix's 2026 mobile redesign explicitly focuses on simplicity, mobile-native vertical discovery and streamlined navigation. Current mobile navigation separates Home, Clips, Search and My Netflix, while top shortcuts/filters expose major content scopes.

**Pattern:** rich visual content can remain rich when the user's scope is compact and obvious.

### 2. Airbnb, 2025–2026

The redesigned app makes its major product families explicit: Homes, Experiences and Services. The Explore homepage can then be visually rich within a clear category model.

**Pattern:** expose breadth as understandable top-level choices before deeper detail.

### 3. Spotify, 2025

Spotify places discovery near shortcuts and uses dedicated feeds/sections for deeper exploration.

**Pattern:** orient first, then recommend.

### 4. YouTube, 2026 experiments

YouTube has tested clearer top-level mobile feed navigation such as Home and Subscriptions while preserving other destinations.

**Pattern:** major content modes should be explicit rather than mixed into one undifferentiated stream.

### 5. TikTok, current

For You remains the dominant home job. Tuning controls such as Manage Topics live elsewhere.

**Pattern:** protect the core home action from secondary configuration.

### 6. Pinterest, current

Pinterest's home feed can be visually dense because the mental model is simple: browse ideas selected for you. Recommendation tuning lives separately.

**Pattern:** visual richness works when the home purpose is singular.

### 7. Instagram, 2025–2026

Instagram has been simplifying navigation around high-frequency spaces such as Reels and DMs while adding explicit scoped tabs such as Following/Friends/Latest where needed.

**Pattern:** separate major destinations from feed detail.

### 8. Notion mobile, 2026

Notion added a dedicated mobile Home so home, chats, meetings and inbox are one swipe away. Its Library work similarly keeps daily-use content prominent while deeper content lives in a dedicated organized space.

**Pattern:** privilege what matters now; don't make home carry every feature at full weight.

### 9. Google Maps, current

Google Maps exposes Explore, You and Contribute as clear top-level mobile scopes.

**Pattern:** stable category structure lets rich content live inside each mode.

### 10. Strava, current

The Home feed includes rich activity data, but feed cards selectively surface notable stats based on activity rather than every possible metric.

**Pattern:** summary level should be selective.

### 11. Monzo

Monzo's Home redesign was driven by product breadth outgrowing the old architecture. Its designers explicitly framed simplicity as bringing order to complexity while protecting users' main jobs/actions.

**Pattern:** simplify hierarchy, not capability.

### 12. Cash App, 2025

Cash App expanded substantially across banking, commerce and bitcoin while investing in navigation that reduces work as product breadth grows.

**Pattern:** more capability should lead to better routing, not an endlessly heavier home.

### 13. DoorDash, 2025

DoorDash combines rich discovery with universal search, explicit retail/category paths, personalized recommendations and contextual media.

**Pattern:** rich discovery still needs a direct path to the intended category.

### 14. Uber

Uber simplifies the immediate home task and moves broader offerings into Services, with past/upcoming activity in Activity Hub.

**Pattern:** the home can stay focused while the product remains broad.

### 15. Nike App, current

Nike combines product, stories and community but frames the app around a few clear user-facing jobs rather than making every content type an equally heavy home card.

**Pattern:** brand richness and selective hierarchy can coexist.

### 16. Headspace

The Today tab presents a curated daily path from morning to bedtime instead of exposing the entire library at equal weight.

**Pattern:** curation lowers navigation burden.

### 17. Duolingo

Duolingo replaced a broad skill tree with a guided path because users were unsure about the correct next action.

**Pattern:** home should reduce `what do I do next?` uncertainty.

## Independent UX / hierarchy evidence

### Baymard Homepage & Category Navigation UX 2025

Baymard's 2025 benchmark reports 67% of mobile sites have mediocre-to-poor homepage/category-navigation performance.

Relevant findings:
- mobile users can develop tunnel vision because the viewport gives little overview
- categories should be divided into manageable chunks
- visually dominant promotional content can make mobile homepages feel cluttered
- tappable destinations need obvious scope and hit areas

### Baymard mobile homepage scanning

About 70% of participants in Baymard's mobile homepage research scanned almost the whole home page to answer:
- what is this?
- what can I do?
- what should I expect to find?

**Spin Out implication:** show the complete game breadth compactly rather than requiring six full cards to establish breadth.

### Baymard product breadth on mobile, updated 2025

Users infer product scope from home content, particularly on mobile where persistent navigation is limited.

**Spin Out implication:** do not hide game categories behind a generic More destination.

### Baymard Mobile App UX Trends 2026

Current guidance emphasizes:
- clear top-level category paths
- full-scope labels
- fast-scanning users often miss supporting copy

**Spin Out implication:** the tappable game item itself needs the actual game name.

### Baymard information-architecture guidance

Focused navigation should not mix unrelated jobs inside one group, and architecture should anticipate product growth.

**Spin Out implication:** game selection, My Reality, Help, Research and Plus should remain distinct jobs.

### Nielsen Norman Group — progressive disclosure

The foundational principle remains useful for information-rich mobile products:
- core options first
- specialized detail on request

**Spin Out implication:** all six games are core; two descriptive paragraphs per game are not.

### WCAG 2.2 target size

WCAG 2.2 defines 24×24 CSS px as the AA minimum target criterion and 44×44 as the enhanced target-size criterion.

**Spin Out implication:** compact game choices still need practical touch targets.

### WCAG 2.2 dragging alternative

Functionality that requires dragging needs a single-pointer alternative.

**Spin Out implication:** do not solve game breadth with a swipe-only carousel.

### Current Baymard 2026 mobile benchmark collection

Current mobile benchmark work continues to identify orientation, category clarity and mobile hierarchy as high-impact issues.

## Patterns that repeat

1. **Strong homes separate top-level choice from detail.**
2. **Rich media does not require rich text everywhere.**
3. **Breadth stays visible without every option becoming a large card.**
4. **The primary job dominates the first viewport.**
5. **Mobile information architecture should be intentionally mobile, not desktop stacked vertically.**

## Anti-patterns

Do not:
- hide games in a hamburger/menu
- use swipe-only discovery for game categories
- show only 2–3 games and put the rest behind ambiguous `More`
- strip out game artwork
- turn the page into a generic utility dashboard
- use icon-only game choices
- move safety/help somewhere hard to find
- make the first viewport busier
- insert another modal before choosing a game
- keep several equally loud Reality Ping teasers interleaved through the mobile game list

## Spin Out decision

### Preserve the first viewport

Do not add new controls above `Choose a game`.

Keep:
- brand
- `About to gamble?`
- short explanation
- `Choose a game`
- practice/no-cash cue
- premium machine visual

### Make game selection the second loud thing

On mobile only, turn the six Reality Runs into one compact, complete selector immediately after the hero.

All six remain visible by name:
- Slots
- Sportsbook
- Roulette
- Video Poker
- Scratch
- Something else

Use a compact 2-column × 3-row grid or equivalent non-gesture-dependent layout.

Each tile must preserve:
- distinctive game art/symbol
- game name
- enough information to distinguish it
- one clear tap target

The full desktop description and purpose do not both need to remain visible at the mobile summary level.

### Stop fragmenting the game choices with prompts

On mobile:
- the six-game selector must be one uninterrupted block
- at most one Reality Ping teaser may compete in the initial games area
- other teaser ideas may rotate across visits or appear later, but cannot interrupt the six choices

Desktop may retain the richer composition if it remains visually strong.

### Preserve full scope

No game can be hidden behind:
- swipe
- carousel
- generic More
- secondary page

## What Spin Out should not copy

- Netflix/TikTok infinite feed behavior
- global bottom tabs for each game
- Uber-style separate Services page for only six games
- icon-only category grids
- promotional carousels
- generic minimalism

## Success criteria before implementation

### First-view comprehension

At 390×844:
- `About to gamble?` remains visible
- `Choose a game` remains visible without scrolling
- no new secondary action visually competes with the primary CTA

### Game breadth

- all six game names exist in one contiguous mobile selection block
- no horizontal scrolling/swipe required
- no game hidden behind More
- each game tile is one clear hit target
- target height >=44px
- no horizontal page overflow at 320px

### Density

- mobile selector is materially shorter than the current six full-size cards
- target: six game choices fit within <=720 CSS px total at 390px width, excluding section heading
- no Reality Ping interrupts those six choices

### Hierarchy

Visual review should agree on:
1. Loud: `About to gamble?` + `Choose a game`
2. Next loud: six-game selector
3. Supporting: one relevant Ping/safety/context item
4. Quiet: footer/research/support links

### Discoverability

- all six game names readable without opening another view
- `Something else` remains clear for unlisted gambling types
- names do not depend on tiny eyebrow text

### Desktop protection

- desktop composition does not materially change in this category
- desktop art/prompts/spacing remain intact

### Later synthetic-panel gates

500-profile panel:
- no worse pre-game abandonment
- lower modeled scroll distance/time to game selection for low-attention mobile profiles
- no decline in category discoverability
- no rise in wrong-game selection
- low-digital-fluency profiles recognize tiles as interactive

300-reviewer panel:
- repeated homepage-density findings materially decrease
- game breadth remains understandable
- brand distinctiveness does not fall
- first dominant action remains consistent

## Sources inspected

### Current / official product flows
1. Netflix mobile redesign/help, 2026.
2. Airbnb redesigned app/Explore, 2025–2026.
3. Spotify Home/discovery changes, 2025.
4. YouTube mobile feed-navigation experiments, 2026.
5. TikTok For You / Manage Topics, current.
6. Pinterest Home/Explore/refinement, current.
7. Instagram navigation/Reels/Friends changes, 2025–2026.
8. Notion mobile Home/Library, 2026.
9. Google Maps Explore/You/Contribute, current.
10. Strava Home feed/stat selection, current.
11. Monzo Home redesign/design rationale.
12. Cash App product/navigation expansion, 2025.
13. DoorDash consumer discovery/search, 2025.
14. Uber Home/Services/Activity Hub, current.
15. Nike App, current.
16. Headspace Today.
17. Duolingo guided Home path.

### UX / standards
- Baymard Homepage & Category Navigation UX 2025.
- Baymard Mobile Homepage benchmark/examples.
- Baymard Homepage Product Breadth research, updated 2025.
- Baymard Ecommerce Mobile App UX Trends 2026.
- Baymard Mobile Homepage usability research.
- Baymard Mobile UX Trends 2026.
- Baymard information-architecture guidance.
- Nielsen Norman Group progressive disclosure.
- WCAG 2.2 Target Size / Dragging Movements.
