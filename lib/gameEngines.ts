import type { GamblingType, OutcomeBand } from './types';

export type SlotSymbol = 'lemon' | 'cherry' | 'plum' | 'bell' | 'gem' | 'seven';
export type CardCode = string;

export type GameVisual =
  | { kind: 'slots'; grid: SlotSymbol[][]; paylinesWon: number; payoutCents: number }
  | { kind: 'roulette'; number: number; color: 'red' | 'black' | 'green'; selected: 'Red' | 'Black' }
  | { kind: 'sports'; selected: string; opponent: string; odds: number; winner: string; payoutCents: number }
  | { kind: 'poker'; hand: CardCode[]; held: boolean[]; handName: string; payoutMultiplier: number; payoutCents: number }
  | { kind: 'scratch'; cells: number[]; prizeCents: number; won: boolean };

export interface ResolvedGameOutcome {
  band: OutcomeBand;
  netCents: number;
  visual: GameVisual;
}

const SLOT_STRIP: SlotSymbol[] = [
  'lemon','cherry','plum','lemon','bell','cherry','lemon','gem',
  'plum','cherry','lemon','bell','plum','cherry','seven','lemon',
  'gem','plum','cherry','lemon','bell','cherry','plum','lemon',
];

const SLOT_LINES = [
  [0,0,0,0,0],
  [1,1,1,1,1],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
] as const;

const SLOT_PAYTABLE: Record<SlotSymbol, Record<number, number>> = {
  lemon:  { 3: 8, 4: 20, 5: 45 },
  cherry: { 3: 12, 4: 30, 5: 75 },
  plum:   { 3: 15, 4: 40, 5: 105 },
  bell:   { 3: 25, 4: 70, 5: 165 },
  gem:    { 3: 38, 4: 105, 5: 300 },
  seven:  { 3: 75, 4: 225, 5: 675 },
};

export const SPORTS_MARKETS = [
  { home: 'North Harbor', away: 'East Vale', homeOdds: 1.72, awayOdds: 2.16 },
  { home: 'Cedar City', away: 'West Point', homeOdds: 2.25, awayOdds: 1.68 },
  { home: 'Riverside', away: 'Kingsport', homeOdds: 1.91, awayOdds: 1.91 },
] as const;

const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function safeRandom(rng: () => number) {
  const value = rng();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('rng must return [0,1)');
  return value;
}

function bandFromNet(netCents: number, stakeCents: number, payoutCents = Math.max(0, netCents + stakeCents)): OutcomeBand {
  if (netCents < 0) return payoutCents > 0 ? 'partial-loss' : 'loss';
  if (netCents === 0) return 'push';
  if (netCents >= stakeCents * 5) return 'big-win';
  return 'win';
}

export function resolveSlots(rng: () => number, stakeCents: number): ResolvedGameOutcome {
  const stops = Array.from({ length: 5 }, () => Math.floor(safeRandom(rng) * SLOT_STRIP.length));
  const grid: SlotSymbol[][] = Array.from({ length: 3 }, (_, row) =>
    stops.map(stop => SLOT_STRIP[(stop + row - 1 + SLOT_STRIP.length) % SLOT_STRIP.length]),
  );

  const lineBet = stakeCents / SLOT_LINES.length;
  let payoutCents = 0;
  let paylinesWon = 0;

  for (const line of SLOT_LINES) {
    const symbols = line.map((row, reel) => grid[row][reel]);
    const first = symbols[0];
    let count = 0;
    for (const symbol of symbols) {
      if (symbol !== first) break;
      count += 1;
    }
    if (count >= 3) {
      paylinesWon += 1;
      payoutCents += Math.round(lineBet * SLOT_PAYTABLE[first][count]);
    }
  }

  const netCents = payoutCents - stakeCents;
  return {
    band: bandFromNet(netCents, stakeCents, payoutCents),
    netCents,
    visual: { kind: 'slots', grid, paylinesWon, payoutCents },
  };
}

export function rouletteColor(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green';
  return RED_NUMBERS.has(number) ? 'red' : 'black';
}

export function resolveRoulette(rng: () => number, stakeCents: number, selected: 'Red' | 'Black'): ResolvedGameOutcome {
  const number = Math.floor(safeRandom(rng) * 37);
  const color = rouletteColor(number);
  const won = color === selected.toLowerCase();
  const netCents = won ? stakeCents : -stakeCents;
  return {
    band: won ? 'win' : 'loss',
    netCents,
    visual: { kind: 'roulette', number, color, selected },
  };
}

function sportsSelection(name: string) {
  for (const market of SPORTS_MARKETS) {
    if (market.home === name) return { selected:name, opponent:market.away, odds:market.homeOdds, otherOdds:market.awayOdds };
    if (market.away === name) return { selected:name, opponent:market.home, odds:market.awayOdds, otherOdds:market.homeOdds };
  }
  return null;
}

export function resolveSports(rng: () => number, stakeCents: number, selected: string): ResolvedGameOutcome {
  const selection = sportsSelection(selected) ?? sportsSelection(SPORTS_MARKETS[0].home)!;
  const selectedImplied = 1 / selection.odds;
  const otherImplied = 1 / selection.otherOdds;
  const trueProbability = selectedImplied / (selectedImplied + otherImplied);
  const won = safeRandom(rng) < trueProbability;
  const payoutCents = won ? Math.round(stakeCents * selection.odds) : 0;
  const netCents = payoutCents - stakeCents;
  return {
    band: bandFromNet(netCents, stakeCents, payoutCents),
    netCents,
    visual: {
      kind: 'sports',
      selected: selection.selected,
      opponent: selection.opponent,
      odds: selection.odds,
      winner: won ? selection.selected : selection.opponent,
      payoutCents,
    },
  };
}

const SUITS = ['S','H','D','C'] as const;
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const;
const RANK_VALUE: Record<string, number> = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13,A:14 };

export function createDeck(): CardCode[] {
  return SUITS.flatMap(suit => RANKS.map(rank => rank + suit));
}

function shuffled<T>(items: T[], rng: () => number) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(safeRandom(rng) * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function dealPoker(rng: () => number) {
  const deck = shuffled(createDeck(), rng);
  return { hand: deck.slice(0,5), deck: deck.slice(5), held: [false,false,false,false,false] };
}

function cardParts(code: CardCode) {
  const suit = code.slice(-1);
  const rank = code.slice(0,-1);
  return { suit, rank, value: RANK_VALUE[rank] };
}

export function evaluateJacksOrBetter(hand: CardCode[]) {
  if (hand.length !== 5) throw new RangeError('poker hand must contain 5 cards');
  const cards = hand.map(cardParts);
  const values = cards.map(c => c.value).sort((a,b)=>a-b);
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a,b)=>b[1]-a[1] || b[0]-a[0]);
  const flush = cards.every(c => c.suit === cards[0].suit);
  const unique = [...new Set(values)];
  const wheel = unique.join(',') === '2,3,4,5,14';
  const straight = unique.length === 5 && (wheel || unique[4] - unique[0] === 4);
  const high = wheel ? 5 : unique[unique.length - 1];

  if (straight && flush && high === 14 && values.includes(10)) return { name:'Royal Flush', multiplier:800 };
  if (straight && flush) return { name:'Straight Flush', multiplier:50 };
  if (groups[0]?.[1] === 4) return { name:'Four of a Kind', multiplier:25 };
  if (groups[0]?.[1] === 3 && groups[1]?.[1] === 2) return { name:'Full House', multiplier:9 };
  if (flush) return { name:'Flush', multiplier:6 };
  if (straight) return { name:'Straight', multiplier:4 };
  if (groups[0]?.[1] === 3) return { name:'Three of a Kind', multiplier:3 };
  if (groups[0]?.[1] === 2 && groups[1]?.[1] === 2) return { name:'Two Pair', multiplier:2 };
  if (groups[0]?.[1] === 2 && groups[0][0] >= 11) return { name:'Jacks or Better', multiplier:1 };
  return { name:'No Win', multiplier:0 };
}

export function drawPoker(
  hand: CardCode[],
  deck: CardCode[],
  held: boolean[],
  stakeCents: number,
): { outcome: ResolvedGameOutcome; remainingDeck: CardCode[] } {
  const nextHand = [...hand];
  const remaining = [...deck];
  for (let i = 0; i < 5; i++) {
    if (!held[i]) {
      const card = remaining.shift();
      if (!card) throw new Error('poker deck exhausted');
      nextHand[i] = card;
    }
  }

  const evaluated = evaluateJacksOrBetter(nextHand);
  const payoutCents = Math.round(stakeCents * evaluated.multiplier);
  const netCents = payoutCents - stakeCents;
  return {
    outcome: {
      band: bandFromNet(netCents, stakeCents, payoutCents),
      netCents,
      visual: {
        kind: 'poker',
        hand: nextHand,
        held: [false,false,false,false,false],
        handName: evaluated.name,
        payoutMultiplier: evaluated.multiplier,
        payoutCents,
      },
    },
    remainingDeck: remaining,
  };
}

export function resolveScratch(rng: () => number, stakeCents: number): ResolvedGameOutcome {
  const win = safeRandom(rng) < (1 / 3.75);
  let prizeCents = 0;
  let cells: number[];

  if (win) {
    const roll = safeRandom(rng);
    const multiplier = roll < .40 ? 1 : roll < .78 ? 2 : roll < .95 ? 5 : 10;
    prizeCents = stakeCents * multiplier;
    const winValue = prizeCents;
    const fillers = [stakeCents,stakeCents,stakeCents*2,stakeCents*2,stakeCents*3,stakeCents*3].filter(v => v !== winValue).slice(0,6);
    while (fillers.length < 6) fillers.push(stakeCents * (4 + fillers.length));
    cells = shuffled([winValue,winValue,winValue,...fillers], rng).slice(0,9);
  } else {
    cells = shuffled([
      stakeCents,stakeCents,
      stakeCents*2,stakeCents*2,
      stakeCents*3,stakeCents*3,
      stakeCents*4,stakeCents*4,
      stakeCents*5,
    ], rng);
  }

  const netCents = prizeCents - stakeCents;
  return {
    band: bandFromNet(netCents, stakeCents, prizeCents),
    netCents,
    visual: { kind:'scratch', cells, prizeCents, won: prizeCents > 0 },
  };
}

export function resolveSimpleGame(type: GamblingType, rng: () => number, stakeCents: number, decision = '') {
  if (type === 'slots' || type === 'other') return resolveSlots(rng, stakeCents);
  if (type === 'sports') return resolveSports(rng, stakeCents, decision);
  if (type === 'casino') return resolveRoulette(rng, stakeCents, decision === 'Black' ? 'Black' : 'Red');
  if (type === 'lottery') return resolveScratch(rng, stakeCents);
  throw new Error('Poker uses dealPoker/drawPoker');
}
