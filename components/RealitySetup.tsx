'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GamblingType, ObligationType, RealityProfile, SessionLimit, TriggerType } from '@/lib/types';
import { spinAudio } from '@/lib/audio';

const gameChoices: { value: GamblingType; label: string; art: string }[] = [
  { value: 'slots', label: 'Slots', art: '◫' },
  { value: 'sports', label: 'Sportsbook', art: '◒' },
  { value: 'casino', label: 'Roulette', art: '◇' },
  { value: 'poker', label: 'Video Poker', art: '♠' },
  { value: 'lottery', label: 'Lottery / scratch', art: '✦' },
  { value: 'other', label: 'Something else', art: '·' },
];

const sessionIntent: { value: TriggerType; label: string }[] = [
  { value: 'win-money', label: 'Win some money' },
  { value: 'win-it-back', label: 'Win back what I lost' },
  { value: 'bored', label: 'Kill some time' },
  { value: 'rush', label: 'Feel something' },
  { value: 'switch-off', label: 'Shut my brain off for a bit' },
  { value: 'habit', label: "Honestly, it's just habit" },
  { value: 'other', label: 'Something else' },
];

const obligations: { value: ObligationType; label: string }[] = [
  { value: 'rent', label: 'Rent / mortgage' },
  { value: 'car', label: 'Car payment' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'credit-card', label: 'Credit card' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'loan', label: 'Debt / loan' },
  { value: 'other', label: 'Something else' },
  { value: 'none', label: 'Nothing specific' },
];

const limits: Array<{ label: string; value: SessionLimit }> = [
  { label: '5 rounds', value: { rounds: 5, minutes: null } },
  { label: '10 rounds', value: { rounds: 10, minutes: null } },
  { label: '5 minutes', value: { rounds: null, minutes: 5 } },
  { label: '10 minutes', value: { rounds: null, minutes: 10 } },
  { label: "I'll decide when I'm done", value: { rounds: null, minutes: null } },
];

type Step = 'wager' | 'game' | 'intent' | 'obligation' | 'urge' | 'limit';

function centsFrom(input: string) {
  const n = Number(input.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export function RealitySetup({
  existing,
  initialGame = null,
  onComplete,
}: {
  existing: RealityProfile | null;
  initialGame?: GamblingType | null;
  onComplete: (profile: RealityProfile, limit: SessionLimit) => void;
}) {
  const firstRun = !existing;
  const gameKnown = Boolean(initialGame || existing?.gamblingType);
  const steps = useMemo<Step[]>(() => {
    if (firstRun) {
      return gameKnown
        ? ['wager', 'intent', 'obligation', 'urge', 'limit']
        : ['wager', 'game', 'intent', 'obligation', 'limit'];
    }

    return gameKnown
      ? ['wager', 'intent', 'limit']
      : ['wager', 'game', 'intent', 'limit'];
  }, [firstRun, gameKnown]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wager, setWager] = useState(existing?.intendedWagerCents ?? 10_000);
  const [game, setGame] = useState<GamblingType>(initialGame ?? existing?.gamblingType ?? 'slots');
  const [trigger, setTrigger] = useState<TriggerType>(existing?.triggerType ?? 'win-it-back');
  const [triggerCustom, setTriggerCustom] = useState(existing?.triggerCustom ?? '');
  const [obligation, setObligation] = useState<ObligationType>(existing?.obligationType ?? 'none');
  const [startingUrge, setStartingUrge] = useState(existing?.startingUrge ?? 5);
  const panel = useRef<HTMLDivElement>(null);
  const step = steps[index];

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .25, ease: 'power2.out' });
  }, [index]);

  const advance = (value?: string) => {
    spinAudio.click();
    if (value) setSelected(value);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      setSelected(null);
      setIndex(current => Math.min(current + 1, steps.length - 1));
    }, reduce ? 0 : 180);
  };

  const buildProfile = (): RealityProfile => {
    const now = new Date().toISOString();
    return {
      version: 1,
      intendedWagerCents: wager,
      gamblingType: game,
      triggerType: trigger,
      triggerCustom: trigger === 'other' ? triggerCustom.trim().slice(0, 64) || null : null,
      quitReason: existing?.quitReason ?? null,
      availableUntilIncomeCents: existing?.availableUntilIncomeCents ?? null,
      nextIncomeDate: existing?.nextIncomeDate ?? null,
      obligationType: obligation,
      obligationAmountCents: obligation === 'none' ? null : existing?.obligationAmountCents ?? null,
      obligationDueDate: obligation === 'none' ? null : existing?.obligationDueDate ?? null,
      recentLenderName: existing?.recentLenderName ?? null,
      recentLenderHelpedRecently: existing?.recentLenderHelpedRecently ?? false,
      recentLenderAmountCents: existing?.recentLenderAmountCents ?? null,
      personalMoneyGoal: existing?.personalMoneyGoal ?? null,
      additionalMoneyGoal: existing?.additionalMoneyGoal ?? null,
      difficultTimes: existing?.difficultTimes ?? [],
      difficultTimeCustom: existing?.difficultTimeCustom ?? null,
      paydayPlanActions: existing?.paydayPlanActions ?? [],
      paydayPlanCustom: existing?.paydayPlanCustom ?? null,
      onboardingCompleted: firstRun ? [] : existing?.onboardingCompleted,
      startingUrge,
      financialContextUpdatedAt: existing?.financialContextUpdatedAt ?? now,
      createdAt: existing?.createdAt ?? now,
    };
  };

  const finish = (limit: SessionLimit, value: string) => {
    spinAudio.click();
    setSelected(value);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => onComplete(buildProfile(), limit), reduce ? 0 : 180);
  };

  const chip = (value: string, label: string, onClick: () => void, extra?: React.ReactNode) => (
    <button
      type="button"
      key={value}
      className={`choice-card ${selected === value ? 'is-selected' : ''}`}
      onClick={() => {
        onClick();
        advance(value);
      }}
    >
      {extra}
      <span>{label}</span>
    </button>
  );

  return (
    <main className="setup-shell">
      <div className="setup-top">
        <span className="brand-quiet">Spin Out</span>
        <span>{firstRun ? 'Quick setup' : 'Before this run'}</span>
      </div>

      <section className="setup-panel" ref={panel} data-committing={selected ? 'true' : 'false'}>
        {step === 'wager' ? <>
          <h1>How much were you about to put in?</h1>
          <div className="amount-grid">
            {[20, 50, 100, 200].map(n => chip(String(n), `$${n}`, () => setWager(n * 100)))}
          </div>
          <form
            className="single-input"
            onSubmit={event => {
              event.preventDefault();
              const value = centsFrom(String(new FormData(event.currentTarget).get('other')));
              if (value != null && value > 0) {
                setWager(value);
                advance('other');
              }
            }}
          >
            <span>$</span>
            <input name="other" inputMode="decimal" placeholder="Other" aria-label="Other wager amount" />
            <button type="submit">Use</button>
          </form>
        </> : null}

        {step === 'game' ? <>
          <h1>What were you about to play?</h1>
          <div className="game-choice-grid">
            {gameChoices.map(choice => chip(
              choice.value,
              choice.label,
              () => setGame(choice.value),
              <b aria-hidden="true">{choice.art}</b>,
            ))}
          </div>
        </> : null}

        {step === 'intent' ? <>
          <h1>What were you hoping would happen?</h1>
          <div className="choice-stack">
            {sessionIntent.map(choice => choice.value === 'other' ? (
              <div key={choice.value} className="custom-choice">
                <button type="button" className="choice-card" onClick={() => setTrigger('other')}>{choice.label}</button>
                {trigger === 'other' ? (
                  <form onSubmit={event => { event.preventDefault(); advance('other'); }}>
                    <input
                      autoFocus
                      value={triggerCustom}
                      onChange={event => setTriggerCustom(event.target.value)}
                      maxLength={64}
                      placeholder="What's on your mind?"
                    />
                    <button type="submit">Use</button>
                  </form>
                ) : null}
              </div>
            ) : chip(choice.value, choice.label, () => setTrigger(choice.value)))}
          </div>
        </> : null}

        {step === 'obligation' ? <>
          <h1>Realistically, what is this money for? If it's not for anything, what could it be put towards to make the next 1-3 months easier for you?</h1>
          <div className="obligation-grid">
            {obligations.map(choice => chip(choice.value, choice.label, () => setObligation(choice.value)))}
          </div>
        </> : null}

        {step === 'urge' ? <>
          <h1>How bad do you want to play right now?</h1>
          <div className="urge-scale" role="group" aria-label="Urge from 1 to 10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setStartingUrge(n);
                  if ('vibrate' in navigator) navigator.vibrate?.(8);
                  advance(String(n));
                }}
                style={{ '--heat': n / 10 } as React.CSSProperties}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="urge-labels"><span>Low</span><span>High</span></div>
        </> : null}

        {step === 'limit' ? <>
          <h1>Before you start, where do you want to stop?</h1>
          <div className="limit-setup-grid">
            {limits.map(option => (
              <button
                type="button"
                key={option.label}
                className={`choice-card ${selected === option.label ? 'is-selected' : ''}`}
                onClick={() => finish(option.value, option.label)}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </> : null}
      </section>

      <p className="setup-privacy">Private by default.</p>
    </main>
  );
}
