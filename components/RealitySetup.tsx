'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GamblingType, ObligationType, RealityProfile, TriggerType } from '@/lib/types';
import { isFinancialContextStale, isObligationExpired } from '@/lib/engine';
import { spinAudio } from '@/lib/audio';

const gameChoices: { value: GamblingType; label: string; art: string }[] = [
  { value: 'slots', label: 'Slots', art: '◫' }, { value: 'sports', label: 'Sports', art: '◒' },
  { value: 'casino', label: 'Casino', art: '◇' }, { value: 'poker', label: 'Poker', art: '♠' },
  { value: 'lottery', label: 'Lottery / scratch', art: '✦' }, { value: 'other', label: 'Other', art: '·' },
];
const triggers: { value: TriggerType; label: string }[] = [
  { value: 'win-money', label: 'Win money' }, { value: 'win-it-back', label: 'Win it back' },
  { value: 'bored', label: 'Bored' }, { value: 'rush', label: 'Want the rush' },
  { value: 'switch-off', label: 'Want to switch off' }, { value: 'habit', label: 'Habit' },
  { value: 'other', label: 'Something else' },
];
const obligations: { value: ObligationType; label: string }[] = [
  { value: 'rent', label: 'Rent / mortgage' }, { value: 'car', label: 'Car' }, { value: 'groceries', label: 'Groceries' },
  { value: 'credit-card', label: 'Credit card' }, { value: 'utilities', label: 'Utilities' }, { value: 'childcare', label: 'Childcare' },
  { value: 'loan', label: 'Loan' }, { value: 'insurance', label: 'Insurance' }, { value: 'phone', label: 'Phone' },
  { value: 'other', label: 'Other' }, { value: 'none', label: 'Nothing urgent' },
];
const goals = ['Savings', 'Mom / Dad / family', 'Birthday', 'Kids', 'Groceries', 'Trip', 'Debt', 'Car', 'Something I want', 'Other'];

type Step = 'wager' | 'game' | 'trigger' | 'available' | 'income' | 'obligation' | 'obligation-detail' | 'lender' | 'goal' | 'urge';

function centsFrom(input: string) {
  const n = Number(input.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}
function dateFor(choice: string) {
  const d = new Date(); d.setHours(12, 0, 0, 0);
  if (choice === 'Tomorrow') d.setDate(d.getDate() + 1);
  if (choice === 'This week') d.setDate(d.getDate() + 4);
  if (choice === 'Next week') d.setDate(d.getDate() + 9);
  return d.toISOString().slice(0, 10);
}

export function RealitySetup({ existing, onComplete }: { existing: RealityProfile | null; onComplete: (profile: RealityProfile) => void }) {
  const firstRun = !existing;
  const expired = existing?.obligationDueDate ? isObligationExpired(existing.obligationDueDate, new Date().toISOString().slice(0, 10)) : false;
  const financeStale = existing ? isFinancialContextStale(existing) : false;
  const steps = useMemo<Step[]>(() => {
    if (firstRun) return ['wager','game','trigger','available','income','obligation','obligation-detail','lender','goal','urge'];
    const next: Step[] = ['wager','trigger'];
    if (financeStale) next.push('available','income','obligation','obligation-detail');
    else if (expired) next.push('obligation','obligation-detail');
    next.push('urge');
    return next;
  }, [firstRun, expired, financeStale]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [wager, setWager] = useState(existing?.intendedWagerCents ?? 10_000);
  const [game, setGame] = useState<GamblingType>(existing?.gamblingType ?? 'slots');
  const [trigger, setTrigger] = useState<TriggerType>(existing?.triggerType ?? 'win-it-back');
  const [triggerCustom, setTriggerCustom] = useState(existing?.triggerCustom ?? '');
  const [available, setAvailable] = useState<number | null>(existing?.availableUntilIncomeCents ?? null);
  const [incomeDate, setIncomeDate] = useState<string | null>(existing?.nextIncomeDate ?? null);
  const [obligation, setObligation] = useState<ObligationType>(existing?.obligationType ?? 'car');
  const [obligationAmount, setObligationAmount] = useState<number | null>(existing?.obligationAmountCents ?? null);
  const [obligationDate, setObligationDate] = useState<string | null>(existing?.obligationDueDate ?? null);
  const [customObligationDate, setCustomObligationDate] = useState(false);
  const [lenderName, setLenderName] = useState(existing?.recentLenderName ?? '');
  const [lenderHelped, setLenderHelped] = useState(existing?.recentLenderHelpedRecently ?? false);
  const [lenderAmount, setLenderAmount] = useState<number | null>(existing?.recentLenderAmountCents ?? null);
  const [goal, setGoal] = useState(existing?.personalMoneyGoal ?? '');

  const step = steps[index];

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .28, ease: 'power2.out' });
  }, [index]);

  const advance = (value?: string) => {
    spinAudio.click();
    if (value) setSelected(value);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      setSelected(null);
      setIndex(i => Math.min(i + 1, steps.length - 1));
    }, reduce ? 0 : 190);
  };

  const finish = (startingUrge: number) => {
    spinAudio.click();
    const profile: RealityProfile = {
      version: 1,
      intendedWagerCents: wager,
      gamblingType: game,
      triggerType: trigger,
      triggerCustom: trigger === 'other' ? triggerCustom || null : null,
      availableUntilIncomeCents: available,
      nextIncomeDate: incomeDate,
      obligationType: obligation,
      obligationAmountCents: obligation === 'none' ? null : obligationAmount,
      obligationDueDate: obligation === 'none' ? null : obligationDate,
      recentLenderName: lenderName.trim() || null,
      recentLenderHelpedRecently: Boolean(lenderName.trim()) && lenderHelped,
      recentLenderAmountCents: lenderName.trim() && lenderHelped ? lenderAmount : null,
      personalMoneyGoal: goal.trim() || null,
      startingUrge,
      financialContextUpdatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    onComplete(profile);
  };

  const chip = (value: string, label: string, onClick: () => void, extra?: React.ReactNode) => (
    <button type="button" key={value} className={`choice-card ${selected === value ? 'is-selected' : ''}`} onClick={() => { onClick(); advance(value); }}>
      {extra}<span>{label}</span>
    </button>
  );

  return (
    <main className="setup-shell">
      <div className="setup-top"><span className="brand-quiet">Spin Out</span><span>{firstRun ? 'Reality setup' : 'Quick setup'}</span></div>
      <section className="setup-panel" ref={panel}>
        {step === 'wager' ? <>
          <h1>How much were you about to put in?</h1>
          <div className="amount-grid">{[20,50,100,200].map(n => chip(String(n), `$${n}`, () => setWager(n * 100)))}</div>
          <form className="single-input" onSubmit={e => { e.preventDefault(); const v = centsFrom(String(new FormData(e.currentTarget).get('other'))); if (v != null && v > 0) { setWager(v); advance('other'); } }}>
            <span>$</span><input name="other" inputMode="decimal" placeholder="Other" aria-label="Other wager amount"/><button type="submit">Use</button>
          </form>
        </> : null}

        {step === 'game' ? <><h1>What were you about to play?</h1><div className="game-choice-grid">{gameChoices.map(c => chip(c.value, c.label, () => setGame(c.value), <b aria-hidden="true">{c.art}</b>))}</div></> : null}

        {step === 'trigger' ? <><h1>What’s pulling you in?</h1><div className="choice-stack">{triggers.map(c => c.value === 'other' ? (
          <div key={c.value} className="custom-choice"><button type="button" className="choice-card" onClick={() => setTrigger('other')}>{c.label}</button>{trigger === 'other' ? <form onSubmit={e => { e.preventDefault(); advance('other'); }}><input autoFocus value={triggerCustom} onChange={e => setTriggerCustom(e.target.value)} maxLength={64} placeholder="Optional"/><button type="submit">Use</button></form> : null}</div>
        ) : chip(c.value, c.label, () => setTrigger(c.value)))}</div></> : null}

        {step === 'available' ? <><h1>How much have you actually got until more money comes in?</h1>
          <form className="big-money-input" onSubmit={e => { e.preventDefault(); const v = centsFrom(String(new FormData(e.currentTarget).get('available'))); if (v != null) { setAvailable(v); advance('amount'); } }}><span>$</span><input name="available" inputMode="decimal" autoFocus placeholder="0"/><button type="submit">Use</button></form>
          <button className="bare-link centered" type="button" onClick={() => { setAvailable(null); advance('not-sure'); }}>Not sure</button>
        </> : null}

        {step === 'income' ? <><h1>When’s more money coming in?</h1><div className="choice-stack">{['Today','Tomorrow','This week','Next week'].map(v => chip(v, v, () => setIncomeDate(dateFor(v))))}<label className="choice-card date-card">Choose date<input type="date" onChange={e => { if (e.target.value) { setIncomeDate(e.target.value); advance('date'); } }}/></label><button type="button" className="choice-card" onClick={() => { setIncomeDate(null); advance('not-sure'); }}>Not sure</button></div></> : null}

        {step === 'obligation' ? <><h1>What’s the next thing that has to get paid?</h1><div className="obligation-grid">{obligations.map(c => chip(c.value, c.label, () => setObligation(c.value)))}</div></> : null}

        {step === 'obligation-detail' ? obligation === 'none' ? <div className="auto-forward" ref={el => { if (el) window.setTimeout(() => advance('none'), 30); }}><h1>Nothing urgent.</h1></div> : <>
          <p className="kicker">{obligations.find(o => o.value === obligation)?.label}</p><h1>How much, and when?</h1>
          <form className="obligation-card" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const amount = centsFrom(String(fd.get('amount'))); const due = String(fd.get('due')); if (amount != null && amount > 0 && due) { setObligationAmount(amount); setObligationDate(due); advance('details'); } }}>
            <label>Amount<div className="money-field"><span>$</span><input name="amount" inputMode="decimal" defaultValue={obligationAmount ? obligationAmount / 100 : ''} required/></div></label>
            <label>When
              <div className="due-quick" role="group" aria-label="Obligation due date">
                {['Today','Tomorrow','This week','Next week'].map(choice => <button key={choice} type="button" className={obligationDate === dateFor(choice) && !customObligationDate ? 'is-on' : ''} onClick={() => { setCustomObligationDate(false); setObligationDate(dateFor(choice)); }}>{choice}</button>)}
                <button type="button" className={customObligationDate ? 'is-on' : ''} onClick={() => setCustomObligationDate(true)}>Choose date</button>
              </div>
              {customObligationDate ? <input name="due-custom" type="date" value={obligationDate ?? ''} onChange={e => setObligationDate(e.target.value || null)} required/> : null}
              <input name="due" type="hidden" value={obligationDate ?? ''}/>
            </label><button className="primary-button" type="submit" disabled={!obligationDate}>Lock it in</button>
          </form>
        </> : null}

        {step === 'lender' ? <><h1>If you came up short, who would you call?</h1><p className="setup-note">Optional. First name only.</p>
          <div className="lender-card"><input aria-label="First name" value={lenderName} onChange={e => setLenderName(e.target.value.replace(/[^a-zA-Z '-]/g, '').slice(0, 32))} placeholder="First name"/>
            {lenderName.trim() ? <><p>Have they helped you recently?</p><div className="inline-choices"><button type="button" onClick={() => setLenderHelped(true)} className={lenderHelped ? 'is-on' : ''}>Yes</button><button type="button" onClick={() => setLenderHelped(false)} className={!lenderHelped ? 'is-on' : ''}>No</button></div>{lenderHelped ? <div className="money-field small"><span>$</span><input inputMode="decimal" placeholder="Amount (optional)" onChange={e => setLenderAmount(centsFrom(e.target.value))}/></div> : null}<button type="button" className="primary-button" onClick={() => advance('lender')}>Use {lenderName.trim()}</button></> : null}
          </div><button className="bare-link centered" type="button" onClick={() => { setLenderName(''); setLenderAmount(null); advance('skip'); }}>Skip</button>
        </> : null}

        {step === 'goal' ? <><h1>What would you rather keep this money for?</h1><p className="setup-note">Optional.</p><div className="obligation-grid">{goals.map(g => g === 'Other' ? <button key={g} type="button" className="choice-card" onClick={() => setGoal('')}>Other</button> : chip(g, g, () => setGoal(g)))}</div>
          <form className="single-input" onSubmit={e => { e.preventDefault(); const v = String(new FormData(e.currentTarget).get('goal') ?? '').trim(); if (v) { setGoal(v.slice(0, 64)); advance('custom-goal'); } }}><input name="goal" placeholder="Custom label"/><button type="submit">Use</button></form>
          <button className="bare-link centered" type="button" onClick={() => { setGoal(''); advance('skip'); }}>Skip</button>
        </> : null}

        {step === 'urge' ? <><h1>How bad do you want to play right now?</h1><div className="urge-scale" role="group" aria-label="Urge from 1 to 10">{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <button key={n} type="button" onClick={() => { if ('vibrate' in navigator) navigator.vibrate?.(8); finish(n); }} style={{ '--heat': n / 10 } as React.CSSProperties}>{n}</button>)}</div><div className="urge-labels"><span>Low</span><span>High</span></div></> : null}
      </section>
      <p className="setup-privacy">Private by default.</p>
    </main>
  );
}
