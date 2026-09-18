SPIN OUT
MASTER PRODUCT PROMPT

This is the authoritative product specification for Spin Out.

Build the product described here.

Do not revert to earlier concepts.

Do not add Shield, gambling blockers, forced cooldowns, giant Stop buttons, generic therapy exercises, recovery streaks, community feeds, or unnecessary wellness features.

Every major behavior is defined below.

Where a technical implementation detail is missing, choose the simplest solution that preserves the intended experience.

==================================================
1. WHAT SPIN OUT IS
==================================================

Spin Out is a web experience for somebody who is thinking about gambling.

The user opens Spin Out before putting real money into gambling.

Spin Out quickly learns enough about their current situation to make the experience personal.

Then the user enters a realistic simulated gambling environment.

During the simulation, the money gradually stops feeling like meaningless game money.

Their actual life begins appearing inside the experience:

rent

car payment

groceries

childcare

credit card

days until payday

savings goals

people they recently borrowed from

things they would rather use the money for

The player can leave at any point.

A Reality Run can last for a maximum of 15 minutes.

The goal is for users to leave sooner over time.

Spin Out tracks how long each user takes to voluntarily leave.

==================================================
2. THE CORE EXPERIENCE
==================================================

OPEN SPIN OUT

↓

FAST REALITY SETUP

↓

REALITY RUN

↓

REALITY PINGS BEGIN

↓

REAL-LIFE CONSEQUENCES GROW MORE PERSONAL

↓

PLAYER CONTINUES OR LEAVES

↓

TIME TO LEAVE IS RECORDED

↓

ENDING URGE CHECK

↓

DID THEY ACTUALLY GAMBLE?

↓

MONEY KEPT

↓

DONE

The experience should feel simple even though the system underneath it is sophisticated.

==================================================
3. DESIGN PHILOSOPHY
==================================================

The product should feel:

premium

minimal

realistic

mature

fast

cinematic

serious

highly polished

The product should NOT feel like:

a therapy worksheet

a government gambling website

a generic recovery app

an AI assistant

a financial questionnaire

a SaaS dashboard

an educational website

a cheap fake casino

The surrounding product should feel closer to premium fintech.

The Reality Run itself can visually resemble a sophisticated fictional gambling product.

==================================================
4. THE LANDING PAGE
==================================================

Do not build a long marketing homepage before the product.

The homepage should immediately present the action.

Primary view:

SPIN OUT

About to gamble?

[ START ]

Small secondary option:

Sign in

That is enough.

No feature grid.

No wall of science.

No testimonials above the experience.

No long sales page before Start.

The visitor should be able to begin within seconds.

==================================================
5. FIRST-RUN REALITY SETUP
==================================================

The first Reality Run needs enough personal information to make the consequences hit.

Do not reduce this to only four questions.

However, the setup must NOT feel like filling out a form.

There are approximately seven core pieces of information plus two optional personalizers.

Present ONE interaction at a time.

Most answers should require a single tap.

Avoid Continue buttons whenever a choice can advance automatically.

The rhythm should feel like:

TAP

SNAP

TRANSFORM

NEXT

The entire setup should feel more like configuring a game than completing intake paperwork.

==================================================
6. SETUP QUESTION 1
==================================================

Ask:

“How much were you about to put in?”

Show large amount options:

$20

$50

$100

$200

Other

Allow custom numeric input.

When an amount is selected:

the card physically responds

the value becomes visually locked

the other options recede

the next question arrives immediately

Store:

intended_wager_amount

==================================================
7. SETUP QUESTION 2
==================================================

Ask:

“What were you about to play?”

Use visual cards:

Slots

Sports

Casino

Poker

Lottery / scratch cards

Other

Each card should have subtle original imagery.

Do not copy a real casino or sportsbook interface.

Tap automatically advances.

Store:

gambling_type

==================================================
8. SETUP QUESTION 3
==================================================

Ask:

“What’s pulling you in?”

Choices:

Win money

Win it back

Bored

Want the rush

Want to switch off

Habit

Something else

If Something else is selected, allow short optional text.

Do not force typing.

Store:

trigger_type

==================================================
9. SETUP QUESTION 4
==================================================

Ask:

“How much have you actually got until more money comes in?”

Currency input.

Allow:

Not sure

This value is extremely important for the Reality Engine.

Store:

available_until_income

==================================================
10. SETUP QUESTION 5
==================================================

Ask:

“When’s more money coming in?”

Quick options:

Today

Tomorrow

This week

Next week

Choose date

This should take one tap in most cases.

Store:

next_income_date

==================================================
11. SETUP QUESTION 6
==================================================

Ask:

“What’s the next thing that has to get paid?”

Use visually distinct choices:

Rent / mortgage

Car

Groceries

Credit card

Utilities

Childcare

Loan

Insurance

Phone

Other

Nothing urgent

Tap automatically advances.

Store:

primary_obligation_type

==================================================
12. SETUP QUESTION 7
==================================================

Turn the selected obligation card into the next interaction.

Example:

CAR

“How much?”

User enters:

$430

Then, inside the SAME visual card:

“When?”

Today

Tomorrow

This week

Next week

Choose date

Do not create two boring form screens if one animated card can handle both.

Store:

primary_obligation_amount

primary_obligation_due_date

==================================================
13. OPTIONAL PERSONALIZER 1
==================================================

Ask:

“If you came up short, who would you call?”

This must clearly be optional.

Choices:

Type a first name

Skip

Only collect first name.

Example:

Brian

If the user enters a name, optionally ask in a quick follow-up:

“Have they helped you recently?”

Yes

No

If Yes:

“How much?”

Optional.

Do not force this.

Store:

recent_lender_name

recent_lender_amount

==================================================
14. OPTIONAL PERSONALIZER 2
==================================================

Ask:

“What would you rather keep this money for?”

Use quick options:

Savings

Mom / Dad / family

Birthday

Kids

Groceries

Trip

Debt

Car

Something I want

Other

Skip

Allow a short custom label where useful.

Examples:

Mom’s birthday

Baby food

Vacation

New tires

Store:

personal_money_goal

==================================================
15. FINAL SETUP INTERACTION
==================================================

Ask:

“How bad do you want to play right now?”

Use a tactile 1 to 10 intensity control.

Do not use boring radio buttons.

Use a smooth rail, slider, or segmented intensity control.

The visual intensity can increase subtly as the number rises.

Mobile may use restrained haptic feedback where supported.

Store:

starting_urge

Once selected:

DO NOT SHOW AN EXPLANATION SCREEN.

Immediately transition into the Reality Run.

==================================================
16. MAKE SETUP FEEL FAST
==================================================

The number of questions is less important than how each question feels.

Avoid:

large forms

multiple visible fields

scrolling questionnaires

long descriptions

Continue buttons after every answer

progress bars that make setup feel long

“Question 6 of 10”

Most screens should contain:

one sentence

one decision

one tap

The system should feel responsive enough that someone can move through the setup quickly without feeling interrogated.

==================================================
17. MOTION SYSTEM
==================================================

Motion is important.

It should make data collection feel like gameplay.

Use motion to:

confirm selections

move between questions

transform entered information into game elements

introduce Reality Pings

show money movement

bring real-world obligations into the game

Most interface motion:

180 to 320 milliseconds.

Larger transitions:

300 to 600 milliseconds.

Never make the user wait for an animation before they can interact.

==================================================
18. QUESTION ANIMATION
==================================================

When someone selects an answer:

1. selected option compresses slightly

2. short tactile response

3. selection locks

4. surrounding choices fade or move away

5. selected item moves toward visual focus

6. next question replaces it

The sequence should feel:

quick

physical

intentional

Do not create exaggerated bouncing animations.

==================================================
19. TRANSITION INTO THE REALITY RUN
==================================================

Use the user's answers as part of the transition.

Example:

User entered:

$100

The $100 amount remains on screen.

Other setup UI falls away.

The $100 physically moves into:

BALANCE
$100

The gambling environment builds around it.

If a car payment was entered:

CAR
$430

may briefly appear in the environment before receding.

The user should feel like the information they entered has been absorbed into the world.

==================================================
20. REALITY RUN
==================================================

Each session is called a:

REALITY RUN

A Reality Run can last for a maximum of:

15 minutes

900 seconds

The player may voluntarily leave at ANY time.

The desired behavioral direction is:

shorter sessions over time.

Do not encourage the player to stay until 15 minutes.

Do not show a visible 15-minute countdown.

Do not celebrate reaching 15 minutes.

Do not reward duration.

==================================================
21. LEAVING THE RUN
==================================================

The player always has a natural exit appropriate to the game.

Examples:

Slots:

Cash Out

Sports:

Leave

Poker:

Leave Table

Casino:

Leave Table

The option should always be available.

It should not dominate the interface.

Do not flash it.

Do not continuously point at it.

The Reality Engine should create the reason the player chooses it.

When the user leaves:

end the simulation immediately.

Do not ask:

“Are you sure?”

Record:

time_to_exit_seconds

==================================================
22. PRIMARY BEHAVIORAL METRIC
==================================================

Track:

TIME TO VOLUNTARY EXIT

Example:

First Reality Run:

8:42

Later:

5:11

Later:

2:03

The ideal long-term pattern is decreasing time.

Do not make this competitive between users.

No public leaderboard.

No ranking.

The comparison is only against the same user's previous behavior.

==================================================
23. ADDITIONAL ANALYTICS
==================================================

Track internally:

session start

session end

time to exit

actions before exit

starting wager

simulated losses

simulated recoveries

largest loss

number of Reality Pings

Ping type

Ping dismissal time

decision immediately after Ping

time between Ping and next action

time between Ping and voluntary exit

stake increases after Ping

stake decreases after Ping

exit after break-even

exit after recovery

starting urge

ending urge

intended real wager

actual real wager

money kept

Do not expose all of these metrics to the user.

==================================================
24. GAME ENVIRONMENTS
==================================================

The game should visually adapt to gambling_type.

SLOTS

Create an original realistic slot-style interface.

SPORTS

Create an original sportsbook-style environment.

CASINO

Create original casino-style gameplay.

POKER

Create an original poker environment.

LOTTERY

Create an original scratch / lottery-inspired environment.

Do not reproduce proprietary interfaces.

Do not copy:

FanDuel

DraftKings

BetMGM

Stake

Bet365

Caesars

or another real operator.

==================================================
25. IMPORTANT GAMEPLAY RULE
==================================================

The purpose is NOT to create a free casino that users enjoy gambling in for hours.

Do not implement:

endless gambling

infinite spins

jackpots designed to excite continued play

loot boxes

retention mechanics

daily casino rewards

fake monetary prizes

near-miss manipulation designed to keep them playing

The simulation may contain realistic wins and losses because those are required to create meaningful gambling decisions.

The experience remains finite.

==================================================
26. TRIGGER PERSONALIZATION
==================================================

The Reality Run should behave differently depending on why the user wanted to gamble.

WIN IT BACK

Focus on:

loss chasing

partial recovery

stake escalation

moving break-even targets

reaching break-even

temptation to continue after recovering

WIN MONEY

Focus on:

early winnings

increasing targets

treating winnings as disposable

risking the amount again

BORED

Focus on:

automatic repetition

mindless clicking

repeated decisions

RUSH

Focus on:

speed

temptation

pressure

stake escalation

SWITCH OFF

Focus on:

temporary distraction

real obligations slowly returning into focus

HABIT

Focus on:

automatic actions

repeated patterns

“one more”

==================================================
27. REALITY ENGINE
==================================================

The Reality Engine is one of the defining features of Spin Out.

As the user continues gambling in the simulation, their actual financial situation begins appearing inside the experience.

It should feel like reality gradually breaking through.

The system uses:

confirmed user facts

accurate financial calculations

clearly hypothetical comparisons

Never confuse these categories.

==================================================
28. REALITY PINGS
==================================================

Personal consequence messages appear as:

REALITY PINGS

A Reality Ping should feel like a serious message breaking through the game.

It should NOT look like an ordinary toast notification.

When triggered:

1. play one short recognizable Ping sound

2. message appears around 80 to 85 percent scale

3. message grows rapidly toward the user's visual focus

4. briefly reaches approximately 103 percent

5. settles at 100 percent

6. game behind it drops slightly in prominence

7. user can immediately tap or click the Ping to remove it

Total emphasis animation:

approximately 220 to 320 milliseconds.

==================================================
29. PING DISMISSAL
==================================================

The entire Reality Ping is clickable / tappable.

One tap removes it instantly.

Do not require:

OK

Continue

I understand

a tiny X

confirmation

If the user taps before the entrance animation finishes:

dismiss it immediately.

==================================================
30. PING SOUND
==================================================

Create one short distinctive Spin Out Reality Ping sound.

It should sound like:

an important message arriving

It should be:

clean

serious

short

recognizable

Avoid:

casino bells

jackpots

sirens

horror sounds

buzzers

cartoon effects

Approximate length:

150 to 400 milliseconds.

Respect browser audio rules.

Allow mute.

==================================================
31. REALITY PING VOICE
==================================================

Every Reality Ping must sound like a serious, responsible best friend.

Someone who knows the user.

Someone who cares.

Someone willing to call them out.

The tone should be:

human

direct

familiar

serious

occasionally incredulous

It should NEVER sound like:

therapy

software

a bank

a PSA

AI

corporate copy

financial education

Do not write paragraphs.

Most messages:

5 to 18 words.

Use contractions.

Use natural American speech.

Examples of natural wording:

gonna

you're

that's

wasn't

can't

didn't

what's

where's

Do not constantly force slang.

Do not make every sentence say:

bro

fr

ngl

lowkey

literally

A serious friend becomes more serious when the situation becomes more serious.

==================================================
32. MESSAGE STRUCTURE
==================================================

Preferred structure:

FACT.

CONSEQUENCE.

QUESTION.

The question is important.

Do not wrap everything up with a conclusion.

Make the user mentally answer.

GOOD:

“That was $300 of the car payment. How are you gonna get that back?”

BAD:

“You have now lost $300 which may impact your ability to meet your automobile payment.”

==================================================
33. CAR EXAMPLES
==================================================

“That was $300 of the car payment. How are you gonna get that back?”

“You just used half the car payment. What's covering the other half now?”

“You're back at $430. That's the whole car payment. Why are you still here?”

==================================================
34. RENT EXAMPLES
==================================================

“That's $250 of rent gone. Rent's in four days. How are you making that back?”

“Rent's Friday. You're $180 short now. What's the plan?”

“You had enough for rent when you started. What happened?”

“You got the rent money back. What exactly are you trying to win now?”

==================================================
35. CHILD / FAMILY EXAMPLES
==================================================

“That $40 was for the baby food. You can't pick up more shifts right now. So what now?”

“That could've handled diapers for the week. What did this get you?”

“That $100 could've handled Mom's birthday. What did this get you instead?”

==================================================
36. BORROWING EXAMPLES
==================================================

Only use names actually supplied by the user.

“Brian helped you last month. You really wanna call him again?”

“You borrowed from Brian last time. Who are you asking now?”

“You're turning another bad bet into Brian's problem. What are you telling him?”

==================================================
37. PAYDAY EXAMPLES
==================================================

“Six days till payday and you just dropped another $120. How's that supposed to work?”

“You've still got five days. Where's the next $100 coming from?”

==================================================
38. GROCERIES
==================================================

“Another $60? That's groceries. What are you cutting this week?”

“That could've been food for the week. You really wanna run it again?”

==================================================
39. WORK
==================================================

Only use working-hours comparisons when the system has enough information to calculate them correctly.

“That took you six hours to earn. Took two minutes to lose. Another one?”

==================================================
40. CHASING
==================================================

“You said you were just trying to get $200 back. You have it. So what's the next bet for?”

“You keep saying you'll make it back. With what money?”

“You said last one three plays ago. So when's the last one?”

==================================================
41. RECOVERY MOMENTS
==================================================

Recovery moments are extremely important.

If the user gets simulated money back:

DO NOT celebrate like a casino.

Use the recovered amount against the reason they said they were gambling.

Examples:

“You're back at $430. That's the whole car payment. Why are you still here?”

“You got the rent money back. What exactly are you trying to win now?”

“You're almost back where you started. Isn't that what you wanted?”

“You said you just wanted your $200 back. You have it. So what's the next bet for?”

“You got lucky enough to fix it. You really wanna need that luck twice?”

==================================================
42. ESCALATION
==================================================

Reality Pings escalate progressively.

Do not begin at maximum emotional intensity.

LEVEL 1

Observation.

“Down $40. You doing another one?”

LEVEL 2

Pattern.

“You said last one already. So what's this one?”

LEVEL 3

Real obligation.

“That was part of the car payment. How are you replacing it?”

LEVEL 4

Actual shortfall.

“You're $120 short on rent now. Where's that coming from?”

LEVEL 5

Personal consequence.

“Brian already helped you last month. You really wanna make that call again?”

==================================================
43. REALITY PING FREQUENCY
==================================================

Do not show a Ping after every bet.

That would become annoying.

Trigger them when something meaningful happens.

Examples:

significant accumulated loss

stake increase after losses

repeated chasing

crossing an obligation threshold

recovering enough to cover an obligation

reaching break-even

continuing after break-even

approaching money required before payday

repeating “last one” behavior

putting a personal goal at risk

==================================================
44. FINANCIAL ACCURACY
==================================================

Never exaggerate.

Example:

User has:

$1,650 available

Rent:

$1,200

They lose:

$200

Remaining:

$1,450

Spin Out cannot say:

“You can't pay rent.”

They still can.

Later another $300 is lost.

Remaining:

$1,150

Now the user is:

$50 short.

A valid Ping:

“Rent's $1,200. You're $50 short now. Where's that coming from?”

Every financial statement must be mathematically correct.

==================================================
45. HYPOTHETICAL COMPARISONS
==================================================

Spin Out may create plausible comparisons.

Use language that makes clear they are comparisons.

Allowed:

“That $80 could've been groceries.”

“That could've handled Mom's birthday.”

“That could've filled the tank.”

“That could've gone toward your trip.”

Do not pretend Spin Out knows a fact the user never supplied.

==================================================
46. REALITY BACKGROUND
==================================================

The player's real life should gradually appear beyond the Reality Pings.

Example:

CAR PAYMENT
$430

can begin faintly appearing in the environment.

As losses grow:

CAR PAYMENT
$430

becomes visually more noticeable.

If the user becomes $100 short:

$100 SHORT

may appear.

Other examples:

RENT
FRIDAY

6 DAYS UNTIL PAYDAY

GROCERIES

MOM'S BIRTHDAY

BRIAN

Do not fake messages from real people.

Do not impersonate them.

==================================================
47. BACKGROUND MOTION
==================================================

Reality should creep into the environment.

Do not abruptly replace the game.

Possible effects:

casino lighting becomes less dominant

real financial amount becomes sharper

game balance physically aligns beside a bill amount

due date becomes more visible

background financial context moves closer to the foreground

The visual distinction between:

GAME MONEY

and:

REAL MONEY

should progressively collapse.

==================================================
48. PROGRESSIVE PERSONALIZATION
==================================================

The first setup gives enough information for impact.

Do not make the user answer everything imaginable.

Collect additional information later through very short contextual interactions.

Examples:

another obligation

whether they still owe Brian

income amount

another savings goal

work schedule

another person they commonly borrow from

Do this only when useful.

One question at a time.

Do not interrupt intense game moments unnecessarily.

==================================================
49. RETURNING USERS
==================================================

Do not repeat the full Reality Setup every time.

Remember existing context.

A returning flow might only ask:

“How much?”

“What’s pulling you in?”

“How bad do you want to play?”

Then:

REALITY RUN

If an old obligation is no longer relevant, ask for an update later.

==================================================
50. ENDING A REALITY RUN
==================================================

If the user voluntarily leaves:

stop immediately.

Record:

time_to_exit_seconds

Then ask:

“How bad do you want to play now?”

Use the exact same 1 to 10 control as before.

Store:

ending_urge

Briefly show:

8 → 5

Do not interpret it with a paragraph.

==================================================
51. REAL-WORLD OUTCOME
==================================================

Ask:

“Did you end up gambling?”

Choices:

No

Yes

Less than I planned

If No:

actual_wager = $0

If Yes:

ask:

“How much?”

If Less:

ask:

“How much?”

Do not shame the answer.

Record what happened accurately.

==================================================
52. MONEY KEPT
==================================================

Calculate:

intended wager

minus

actual wager

equals

Money Kept

Example:

Intended:

$100

Actual:

$0

Money Kept:

$100

Display:

$100 KEPT

This month:

$420

All time:

$1,380

No casino confetti.

No jackpot sound.

No spinning coins.

Use premium financial styling.

==================================================
53. CONNECT MONEY KEPT TO REAL LIFE
==================================================

When mathematically relevant:

CAR PAYMENT

$430 / $430

COVERED

or:

RENT

$900 / $1,200

PROTECTED

or:

MOM'S BIRTHDAY

$100 KEPT

This makes the successful exit feel concrete too.

==================================================
54. TIME-TO-EXIT PROGRESS
==================================================

Time to exit should become an important long-term metric.

Example:

FIRST 5 RUNS

7:18 average

RECENT 5 RUNS

2:41 average

Keep presentation simple.

No leaderboard.

No percentile.

No competitive ranking.

No reward for staying longer.

Shorter is better.

==================================================
55. RETURNING HOMEPAGE
==================================================

Returning users see:

SPIN OUT

$1,240 kept

[ I FEEL LIKE GAMBLING ]

Optionally show one useful metric:

Recent exit average:

2:14

or:

Car payment:

$430 protected

Do not turn the homepage into a dashboard.

==================================================
56. NO DAILY STREAK SYSTEM
==================================================

Do not create pressure to use Spin Out daily.

Do not create:

daily streaks

daily login rewards

loss-of-streak punishment

The ideal long-term outcome may be that someone needs Spin Out less often.

The product should support that.

==================================================
57. PERSONALIZATION ENGINE
==================================================

Store:

intended wager

actual wager

gambling type

trigger

starting urge

ending urge

available money

income date

obligations

due dates

borrowing context

goals

Reality Run scenario

decisions inside run

Reality Pings shown

Ping dismissal behavior

behavior after Ping

exit timing

money kept

Use this data to improve future Reality Runs.

Do not claim that correlation proves a particular Ping caused behavior.

==================================================
58. PING LEARNING
==================================================

The system should learn what types of Reality Pings appear most relevant to each person.

Example:

Generic loss messages:

user keeps playing.

Rent messages:

user frequently lowers stakes or leaves soon afterward.

Future Reality Runs may prioritize accurate rent-related messaging when relevant.

Maintain variety.

Do not repeat the exact same lines constantly.

Create message families around:

rent

car

groceries

children

payday

borrowing

debt

savings

family

birthdays

work hours

break-even

chasing

==================================================
59. MONETIZATION
==================================================

Do not paywall someone before helping them with the immediate urge.

Core Spin Out remains usable for free.

Create:

SPIN OUT+

Initial pricing:

$4.99 per month

$29.99 per year

Premium can include:

full Reality Run scenario library

advanced personalization

full session history

long-term Money Kept analytics

multiple obligations

multiple financial goals

advanced trigger patterns

weekly summaries

cross-device sync

advanced Reality Ping personalization

long-term Time-to-Exit trends

Never interrupt an active Reality Run with a paywall.

==================================================
60. PAYWALL PLACEMENT
==================================================

Appropriate times:

after a completed session

when opening advanced history

when opening deeper personalization

when viewing long-term analytics

when selecting premium scenario libraries

Never during:

high urge

active gambling simulation

Reality Ping

severe simulated loss

==================================================
61. PRIVACY
==================================================

Treat these as private:

gambling behavior

available money

bills

due dates

names

borrowing information

goals

session outcomes

Do not expose them publicly.

Do not create public sharing by default.

Do not sell this information.

Collect only information the product actually uses.

==================================================
62. MOBILE EXPERIENCE
==================================================

Mobile is critical.

Reality Run should dominate the viewport.

Buttons must be thumb-friendly.

Questions should usually fit without scrolling.

Reality Pings should grow into the visual focus.

Tap anywhere on a Ping to dismiss.

Motion must remain smooth on normal mobile hardware.

==================================================
63. DESKTOP EXPERIENCE
==================================================

Keep the Reality Run centered and dominant.

Supporting context can exist around it without competing.

Reality Pings appear over the simulation.

Click anywhere on the Ping to dismiss.

==================================================
64. ACCESSIBILITY
==================================================

Support:

keyboard controls

screen reader labels

high contrast

mute

reduced motion

responsive text

If reduced motion is enabled:

replace dramatic scale animation with restrained fade and size emphasis.

The experience must remain understandable without sound.

==================================================
65. REQUIRED PRODUCT STATES
==================================================

Explicitly implement:

first visit

returning visit

signed out

signed in

setup

optional question skipped

no obligation

unknown payday

active Reality Run

Reality Ping active

Reality Ping dismissed

muted audio

reduced motion

voluntary exit

15-minute automatic ending

urge lower

urge unchanged

urge higher

user did not gamble

user gambled less

user gambled full amount

user gambled more than intended

first Money Kept event

returning Money Kept event

expired obligation

premium

free

payment failed

subscription canceled

mobile

tablet

desktop

Do not leave these flows undefined.

==================================================
66. FAILURE / RELAPSE UX
==================================================

If someone still gambles:

do not erase their progress.

do not reset a streak.

do not display FAILURE.

do not punish them.

Simply show what happened.

Example:

You planned:

$100

You spent:

$180

Keep it factual.

The next session can use the information.

==================================================
67. FINAL REALITY PING CHECK
==================================================

Before displaying any generated Ping, verify:

Is every factual statement true?

Is every calculation correct?

Is a hypothetical clearly hypothetical?

Does it sound spoken?

Is it short?

Would a serious friend actually say this?

Would a question make it hit harder?

Has this wording been overused?

Is this moment important enough to deserve a Ping?

If any answer fails:

rewrite or do not show the Ping.

==================================================
68. FINAL EXPERIENCE TEST
==================================================

The finished product should feel approximately like this:

OPEN

↓

“How much were you about to put in?”

$300

tap

↓

“What were you about to play?”

Slots

tap

↓

“What’s pulling you in?”

Win it back

tap

↓

“How much have you actually got till more money comes in?”

$850

↓

“When’s more money coming in?”

Next Friday

↓

“What has to get paid next?”

Car

↓

“How much?”

$430

“When?”

Tuesday

↓

“If you came up short, who would you call?”

Brian

↓

“What would you rather keep this money for?”

Mom's birthday

↓

“How bad do you want to play?”

8

↓

THE $300 BECOMES THE GAME BALANCE

↓

REALITY RUN

↓

LOSS

PING

“That was $100 of the car payment.

How are you gonna get that back?”

tap

gone

↓

PLAYER KEEPS GOING

↓

LOSS

CAR PAYMENT
$430

begins appearing behind the game

↓

PING

“You've got $450 left and payday's next Friday.

What's the plan if this one goes?”

tap

gone

↓

PLAYER RECOVERS

BALANCE
$435

PING

“You've got the whole car payment back.

Why are you still playing?”

↓

PLAYER CHOOSES CASH OUT

↓

TIME TO EXIT:

4:18

stored silently

↓

“How bad do you want to play now?”

5

↓

8 → 5

↓

“Did you actually gamble?”

No

↓

$300 KEPT

CAR PAYMENT
$300 / $430

PROTECTED

↓

DONE

No lecture.

No cooldown.

No Shield.

No giant Stop button.

No wall of text.

The interaction itself should communicate the product.

==================================================
69. FINAL STANDARD
==================================================

Before calling Spin Out finished, ask:

Does setup feel quick even though it gathers meaningful information?

Does every input have a reason to exist?

Can unnecessary taps be removed?

Does motion make setup feel better rather than slower?

Does the Reality Run look convincing?

Can somebody leave instantly?

Are Reality Pings impossible to mistake for generic software notifications?

Does the dialogue sound human?

Are questions being used instead of overly conclusive statements?

Does the financial math work?

Do real obligations progressively invade the game?

Does the system avoid rewarding longer simulation time?

Is time-to-exit measured correctly?

Does a returning user get back into the experience quickly?

Does any part look like generic AI-generated UI?

Does any part accidentally encourage endless fake gambling?

Fix anything that fails these tests.

Spin Out should ultimately feel like somebody entered a gambling game, except their real life slowly began showing up inside it.