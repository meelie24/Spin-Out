import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decideIntervention,
  initialDirectorState,
  type DirectorInput,
} from '../lib/realityEngine/director';
import type { PingCandidate } from '../lib/types';

function candidate(type:string, level:1|2|3|4|5, patch:Partial<PingCandidate>={}):PingCandidate {
  return {
    id:type+'-1',
    type,
    level,
    message:type,
    factual:true,
    ...patch,
  };
}

function input(patch:Partial<DirectorInput>={}):DirectorInput {
  return {
    now:100_000,
    candidates:[],
    foregroundOpen:false,
    state:initialDirectorState(),
    ...patch,
  };
}

test('director can intentionally do nothing', () => {
  const decision=decideIntervention(input());
  assert.equal(decision.foreground,null);
  assert.equal(decision.ambientMode,'normal');
});

test('only one foreground intervention wins when several conditions qualify', () => {
  const decision=decideIntervention(input({
    candidates:[
      candidate('rapid-replay',3),
      candidate('stake-up',5),
      candidate('loss-streak',5),
    ],
  }));
  assert.ok(decision.foreground);
  assert.equal(decision.foreground?.family,'chasing');
  assert.equal(decision.foreground?.candidate.type,'stake-up');
});

test('a far-past personal limit outranks chasing and pace observations', () => {
  const decision=decideIntervention(input({
    candidates:[
      candidate('rapid-loop',5,{requiresChoice:true}),
      candidate('stake-up',5),
      candidate('limit-exceeded',5,{requiresChoice:true}),
    ],
  }));
  assert.equal(decision.foreground?.candidate.type,'limit-exceeded');
  assert.equal(decision.foreground?.surface,'strong');
});

test('near misses and chase moments route to X-Ray rather than another generic Ping', () => {
  const near=decideIntervention(input({candidates:[candidate('near-miss',4)]}));
  const chase=decideIntervention(input({candidates:[candidate('stake-up',5)]}));
  assert.equal(near.foreground?.surface,'xray');
  assert.equal(chase.foreground?.surface,'xray');
});

test('an open foreground blocks every new foreground intervention', () => {
  const decision=decideIntervention(input({
    foregroundOpen:true,
    candidates:[candidate('limit-exceeded',5,{requiresChoice:true})],
  }));
  assert.equal(decision.foreground,null);
  assert.equal(decision.ambientMode,'strong');
});

test('recent foreground cooldown suppresses weaker interruptions but keeps ambient truth', () => {
  const state=initialDirectorState();
  state.lastForegroundAt=95_000;
  state.recentFamilies=[{family:'chasing',at:95_000}];

  const decision=decideIntervention(input({
    state,
    candidates:[candidate('rapid-replay',3),candidate('obligation',4)],
  }));
  assert.equal(decision.foreground,null);
  assert.notEqual(decision.ambientMode,'normal');
});

test('same idea family is suppressed when it was just communicated', () => {
  const state=initialDirectorState();
  state.lastForegroundAt=60_000;
  state.recentFamilies=[{family:'chasing',at:92_000}];

  const decision=decideIntervention(input({
    state,
    candidates:[candidate('stake-up',5),candidate('goal',3)],
  }));
  assert.equal(decision.foreground?.family,'ledger');
  assert.equal(decision.foreground?.candidate.type,'goal');
});

test('strong limit events can return after a shorter family cooldown when behavior worsens', () => {
  const state=initialDirectorState();
  state.lastForegroundAt=75_000;
  state.recentFamilies=[{family:'limit',at:75_000}];

  const decision=decideIntervention(input({
    state,
    candidates:[candidate('limit-exceeded',5,{requiresChoice:true})],
  }));
  assert.equal(decision.foreground?.family,'limit');
  assert.equal(decision.foreground?.surface,'strong');
});

test('ambient mode reflects chasing and ledger context without forcing foreground', () => {
  const state=initialDirectorState();
  state.lastForegroundAt=99_000;
  const chase=decideIntervention(input({state,candidates:[candidate('loss-streak',5)]}));
  assert.equal(chase.foreground,null);
  assert.equal(chase.ambientMode,'cooling');

  const ledger=decideIntervention(input({state:{...state,recentFamilies:[]},candidates:[candidate('shortfall',5)]}));
  assert.equal(ledger.foreground,null);
  assert.equal(ledger.ambientMode,'ledger');
});
