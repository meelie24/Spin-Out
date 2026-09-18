'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GamblingType, ObligationType, RealityProfile, TriggerType } from '@/lib/types';
import { isFinancialContextStale, isObligationExpired } from '@/lib/engine';
import { spinAudio } from '@/lib/audio';

const gameChoices: { value: GamblingType; label: string; art: string }[] = [
  { value: 'slots', label: 'Slots', art: '◫' }, { value: 'sports', label: 'Sportsbook', art: '◒' },
  { value: 'casino', label: 'Roulette', art: '◇' }, { value: 'poker', label: 'Video Poker', art: '♠' },
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

type Step = 'wager' | 'game' | 'trigger' | 'quit-reason' | 'available' | 'obligation' | 'obligation-detail' | 'urge';

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

export function RealitySetup({ existing, initialGame = null, onComplete }: { existing: RealityProfile | null; initialGame?: GamblingType | null; onComplete: (profile: RealityProfile) => void }) {
  const firstRun = !existing;
  const expired = existing?.obligationDueDate ? isObligationExpired(existing.obligationDueDate, new Date().toISOString().slice(0, 10)) : false;
  const financeStale = existing ? isFinancialContextStale(existing) : false;
  const steps = useMemo<Step[]>(() => {
    if (firstRun) return initialGame ? ['wager','trigger','quit-reason','available','obligation','obligation-detail','urge'] : ['wager','game','trigger','quit-reason','available','obligation','obligation-detail','urge'];
    const next: Step[] = ['wager','trigger'];
    if (financeStale) next.push('available','obligation','obligation-detail');
    else if (expired) next.push('obligation','obligation-detail');
    next.push('urge');
    return next;
  }, [firstRun, expired, financeStale, initialGame]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [wager, setWager] = useState(existing?.intendedWagerCents ?? 10_000);
  const [game, setGame] = useState<GamblingType>(initialGame ?? existing?.gamblingType ?? 'slots');
  const [trigger, setTrigger] = useState<TriggerType>(existing?.triggerType ?? 'win-it-back');
  const [triggerCustom, setTriggerCustom] = useState(existing?.triggerCustom ?? '');
  const [quitReason, setQuitReason] = useState(existing?.quitReason ?? '');
  const [available, setAvailable] = useState<number | null>(existing?.availableUntilIncomeCents ?? null);
  const [incomeDate, setIncomeDate] = useState<string | null>(existing?.nextIncomeDate ?? null);
  const [obligation, setObligation] = useState<ObligationType>(existing?.obligationType ?? 'car');
  const [obligationAmount, setObligationAmount] = useState<number | null>(existing?.obligationAmountCents ?? null);
  const [obligationDate, setObligationDate] = useState<string | null>(existing?.obligationDueDate ?? null);
  const [customObligationDate, setCustomObligationDate] = useState(false);
  const lenderName = existing?.recentLenderName ?? '';
  const lenderHelped = existing?.recentLenderHelpedRecently ?? false;
  const lenderAmount = existing?.recentLenderAmountCents ?? null;
  const goal = existing?.personalMoneyGoal ?? '';

  const step = steps[index];

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .28, ease: 'power2.out' });
  }, [index]);

  useEffect(() => {
    if (step !== 'obligation-detail' || obligation !== 'none') return;
    const timer = window.setTimeout(() => setIndex(i => Math.min(i + 1, steps.length - 1)), 80);
    return () => window.clearTimeout(timer);
  }, [step, obligation, steps.length]);

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
      quitReason: quitReason.trim() || null,
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
      <section className="setup-panel" ref={panel} data-committing={selected ? "true" : "false"}>
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

        {step === 'quit-reason' ? <>
          <h1>Why are you trying to stop?</h1>
          <p className="setup-note">Your words. Keep it short.</p>
          <form className="reason-input" onSubmit={e => {
            e.preventDefault();
            const value = String(new FormData(e.currentTarget).get('reason') ?? '').trim();
            setQuitReason(value.slice(0, 160));
            advance(value ? 'reason' : 'skip');
          }}>
            <input
              name="reason"
              autoFocus
              maxLength={160}
              defaultValue={quitReason}
              placeholder="I'm tired of..."
              aria-label="Why you are trying to stop"
            />
            <button type="submit">Use</button>
          </form>
          <button className="bare-link centered" type="button" onClick={() => { setQuitReason(''); advance('skip'); }}>Skip</button>
        </> : null}

        {step === 'available' ? <>
          <h1>Until more money comes in</h1>
          <p className="setup-note">Just enough context to make the run real.</p>
          <div className="money-context-card">
            <label>
              <span>How much have you got?</span>
              <div className="money-field">
                <span>$</span>
                <input
                  name="available"
                  inputMode="decimal"
                  value={available == null ? '' : String(available / 100)}
                  onChange={e => setAvailable(centsFrom(e.target.value))}
                  placeholder="Not sure"
                  aria-label="Money available until more comes in"
                />
              </div>
              <button type="button" className="bare-link money-context-clear" onClick={() => setAvailable(null)}>Not sure on the amount</button>
            </label>

            <div className="money-context-date">
              <span>{"When's more money coming in?"}</span>
              <div className="due-quick" role="group" aria-label="Next income date">
                {['Today','Tomorrow','This week','Next week'].map(choice => (
                  <button
                    key={choice}
                    type="button"
                    className={incomeDate === dateFor(choice) ? 'is-on' : ''}
                    onClick={() => setIncomeDate(dateFor(choice))}
                  >
                    {choice}
                  </button>
                ))}
                <label className="date-inline-choice">Choose date
                  <input type="date" value={incomeDate ?? ''} onChange={e => setIncomeDate(e.target.value || null)} />
                </label>
                <button type="button" className={incomeDate == null ? 'is-on' : ''} onClick={() => setIncomeDate(null)}>Not sure</button>
              </div>
            </div>
          </div>
          <button className="primary-button setup-continue" type="button" onClick={() => advance('money-context')}>Continue</button>
        </> : null}

        {step === 'obligation' ? <><h1>What’s the next thing that has to get paid?</h1><div className="obligation-grid">{obligations.map(c => chip(c.value, c.label, () => setObligation(c.value)))}</div></> : null}

        {step === 'obligation-detail' ? obligation === 'none' ? <div className="auto-forward"><h1>Nothing urgent.</h1></div> : <>
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

        {step === 'urge' ? <><h1>How bad do you want to play right now?</h1><div className="urge-scale" role="group" aria-label="Urge from 1 to 10">{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <button key={n} type="button" onClick={() => { if ('vibrate' in navigator) navigator.vibrate?.(8); finish(n); }} style={{ '--heat': n / 10 } as React.CSSProperties}>{n}</button>)}</div><div className="urge-labels"><span>Low</span><span>High</span></div></> : null}
      </section>
      <p className="setup-privacy">Private by default.</p>
    </main>
  );
}
