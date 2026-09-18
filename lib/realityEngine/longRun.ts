import {
  dealPoker,
  drawPoker,
  evaluateJacksOrBetter,
  resolveSimpleGame,
  type CardCode,
} from '../gameEngines';
import type { GamblingType, OutcomeBand } from '../types';

export interface LongRunSample {
  band: OutcomeBand;
  netCents: number;
  nearMiss: boolean;
}

export interface LongRunResult {
  runs: 10_000;
  totalStakedCents: number;
  totalReturnedCents: number;
  netCents: number;
  wins: number;
  losses: number;
  pushes: number;
  bigWins: number;
  nearMisses: number;
  longestWinStreak: number;
  longestLossStreak: number;
  samples: LongRunSample[];
  strategyNote: string | null;
}

export interface LongRunOptions {
  gameType: GamblingType;
  stakeCents: number;
  decision?: string;
  seed?: number;
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function cardParts(code: CardCode) {
  const suit = code.slice(-1);
  const rank = code.slice(0, -1);
  const value = rank === 'A' ? 14
    : rank === 'K' ? 13
    : rank === 'Q' ? 12
    : rank === 'J' ? 11
    : Number(rank);
  return { suit, rank, value };
}

function holdMatching(hand: CardCode[], values: Set<number>) {
  return hand.map(code => values.has(cardParts(code).value));
}

/**
 * Fixed Jacks-or-Better helper used only by the 10,000-run explainer.
 * It is intentionally transparent and stable, not presented as perfect play.
 */
export function chooseVideoPokerHolds(hand: CardCode[]) {
  const evaluated = evaluateJacksOrBetter(hand);
  const cards = hand.map(cardParts);
  const counts = new Map<number, number>();
  for (const card of cards) counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a,b)=>b[1]-a[1] || b[0]-a[0]);

  if (['Royal Flush','Straight Flush','Full House','Flush','Straight'].includes(evaluated.name)) {
    return [true,true,true,true,true];
  }
  if (evaluated.name === 'Four of a Kind') return holdMatching(hand, new Set([groups[0][0]]));
  if (evaluated.name === 'Three of a Kind') return holdMatching(hand, new Set([groups[0][0]]));
  if (evaluated.name === 'Two Pair') return holdMatching(hand, new Set(groups.filter(group=>group[1]===2).map(group=>group[0])));
  if (evaluated.name === 'Jacks or Better') return holdMatching(hand, new Set([groups[0][0]]));

  const anyPair = groups.find(group=>group[1]===2);
  if (anyPair) return holdMatching(hand,new Set([anyPair[0]]));

  const suitCounts = new Map<string, number>();
  for (const card of cards) suitCounts.set(card.suit,(suitCounts.get(card.suit)??0)+1);
  const fourFlush=[...suitCounts.entries()].find(([,count])=>count===4);
  if (fourFlush) return cards.map(card=>card.suit===fourFlush[0]);

  const unique=[...new Set(cards.map(card=>card.value))].sort((a,b)=>a-b);
  for(let start=0;start<unique.length;start++){
    const window=unique.filter(value=>value>=unique[start]&&value<=unique[start]+4);
    if(window.length>=4) return holdMatching(hand,new Set(window.slice(0,4)));
  }

  const high = new Set(cards.filter(card=>card.value>=11).slice(0,2).map(card=>card.value));
  if (high.size) return holdMatching(hand,high);

  return [false,false,false,false,false];
}

function resolvePokerLongRun(rng:()=>number,stakeCents:number){
  const dealt=dealPoker(rng);
  const held=chooseVideoPokerHolds(dealt.hand);
  return drawPoker(dealt.hand,dealt.deck,held,stakeCents).outcome;
}

export function simulateLongRun(options: LongRunOptions): LongRunResult {
  const rng=seeded(options.seed ?? 1);
  const stakeCents=Math.max(1,Math.round(options.stakeCents));
  let totalReturnedCents=0;
  let wins=0;
  let losses=0;
  let pushes=0;
  let bigWins=0;
  let nearMisses=0;
  let currentWinStreak=0;
  let currentLossStreak=0;
  let longestWinStreak=0;
  let longestLossStreak=0;
  const samples:LongRunSample[]=[];

  for(let i=0;i<10_000;i++){
    const outcome=options.gameType==='poker'
      ? resolvePokerLongRun(rng,stakeCents)
      : resolveSimpleGame(options.gameType,rng,stakeCents,options.decision ?? '');

    const returned=Math.max(0,stakeCents+outcome.netCents);
    totalReturnedCents+=returned;

    if(outcome.netCents>0){
      wins++;
      currentWinStreak++;
      currentLossStreak=0;
      longestWinStreak=Math.max(longestWinStreak,currentWinStreak);
    } else if(outcome.netCents<0){
      losses++;
      currentLossStreak++;
      currentWinStreak=0;
      longestLossStreak=Math.max(longestLossStreak,currentLossStreak);
    } else {
      pushes++;
      currentWinStreak=0;
      currentLossStreak=0;
    }

    if(outcome.band==='big-win') bigWins++;
    if(outcome.nearMiss) nearMisses++;

    if(i<48 || i===99 || i===999 || i===9_999){
      samples.push({
        band:outcome.band,
        netCents:outcome.netCents,
        nearMiss:outcome.nearMiss===true,
      });
    }
  }

  const totalStakedCents=stakeCents*10_000;
  return {
    runs:10_000,
    totalStakedCents,
    totalReturnedCents,
    netCents:totalReturnedCents-totalStakedCents,
    wins,
    losses,
    pushes,
    bigWins,
    nearMisses,
    longestWinStreak,
    longestLossStreak,
    samples,
    strategyNote:options.gameType==='poker'
      ? 'Video poker uses one fixed Jacks-or-Better hold strategy for all 10,000 hands.'
      : null,
  };
}
