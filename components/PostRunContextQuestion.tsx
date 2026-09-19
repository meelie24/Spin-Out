'use client';

import { useState } from 'react';
import type { DifficultTime, OnboardingQuestionKey, PaydayPlanAction, RealityProfile } from '@/lib/types';

const difficultOptions: Array<{ value: DifficultTime; label: string }> = [
  { value: 'payday', label: 'Payday' },
  { value: 'friday-night', label: 'Friday night' },
  { value: 'late-night', label: 'Late at night' },
  { value: 'after-drinking', label: "When I'm drinking" },
  { value: 'after-argument', label: 'After an argument' },
  { value: 'bored', label: "When I'm bored" },
  { value: 'stressed', label: "When I'm stressed" },
  { value: 'alone', label: "When I'm alone" },
];

const paydayOptions: Array<{ value: PaydayPlanAction; label: string }> = [
  { value: 'open-spinout', label: 'Open Spin Out first' },
  { value: 'move-bill-money', label: 'Move bill money first' },
  { value: 'move-savings', label: 'Move savings first' },
  { value: 'message-someone', label: 'Message someone' },
  { value: 'use-gambling-block', label: 'Use a gambling block' },
];

type Answer = string | number | boolean | null;

function moneyToCents(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

export function PostRunContextQuestion({
  questionKey,
  profile,
  onAnswer,
  onNotNow,
}: {
  questionKey: OnboardingQuestionKey;
  profile: RealityProfile;
  onAnswer: (value: Answer) => void;
  onNotNow: () => void;
}) {
  const [text, setText] = useState('');

  const heading = questionKey === 'money-goal'
    ? "Is there something you'd rather this money still be there for?"
    : questionKey === 'difficult-times'
      ? 'When does gambling usually get harder to ignore?'
      : questionKey === 'quit-reason'
        ? 'What are you trying to stop from happening again?'
        : questionKey === 'payday-plan'
          ? 'When payday hits, what would help keep the money where you want it?'
          : questionKey === 'lender-name'
            ? 'If you came up short, who would you probably call?'
            : questionKey === 'lender-helped'
              ? `Has ${profile.recentLenderName?.trim() || 'that person'} had to help you recently?`
              : questionKey === 'lender-amount'
                ? 'About how much did they have to cover?'
                : null;

  if (!heading) return null;

  const choice = (label: string, value: Answer) => (
    <button type="button" key={label} onClick={() => onAnswer(value)}>{label}</button>
  );

  return (
    <section className="post-run-context-question" aria-labelledby="post-run-context-title">
      <div className="post-context-head">
        <span>Make it more immersive</span>
        <button type="button" className="post-context-not-now" onClick={onNotNow}>Not now</button>
      </div>
      <h2 id="post-run-context-title">{heading}</h2>

      {questionKey === 'money-goal' ? (
        <div className="post-context-choices">
          {choice('Emergency fund', 'Emergency fund')}
          {choice('Family', 'Family')}
          {choice('Debt', 'Debt')}
          {choice('Savings', 'Savings')}
          {choice('Something else', 'Something else')}
          {choice('Not sure', null)}
        </div>
      ) : null}

      {questionKey === 'difficult-times' ? (
        <div className="post-context-choices">
          {difficultOptions.map(option => choice(option.label, option.value))}
          {choice('Not sure', null)}
        </div>
      ) : null}

      {questionKey === 'payday-plan' ? (
        <div className="post-context-choices">
          {paydayOptions.map(option => choice(option.label, option.value))}
          {choice('Not sure', null)}
        </div>
      ) : null}

      {questionKey === 'lender-helped' ? (
        <div className="post-context-choices post-context-choices-short">
          {choice('Yeah', true)}
          {choice('No', false)}
        </div>
      ) : null}

      {questionKey === 'quit-reason' || questionKey === 'lender-name' ? (
        <form className="post-context-input" onSubmit={event => {
          event.preventDefault();
          if (text.trim()) onAnswer(text.trim());
        }}>
          <input
            value={text}
            onChange={event => setText(event.target.value)}
            maxLength={questionKey === 'lender-name' ? 40 : 180}
            placeholder={questionKey === 'lender-name' ? 'First name' : 'A few words is enough'}
            aria-label={questionKey === 'lender-name' ? 'First name' : 'Your answer'}
          />
          <button type="submit" disabled={!text.trim()}>Use</button>
          {questionKey === 'lender-name'
            ? <button type="button" className="post-context-quiet" onClick={() => onAnswer(null)}>No one</button>
            : <button type="button" className="post-context-quiet" onClick={() => onAnswer(null)}>Not sure</button>}
        </form>
      ) : null}

      {questionKey === 'lender-amount' ? (
        <form className="post-context-input post-context-money" onSubmit={event => {
          event.preventDefault();
          const value = moneyToCents(text);
          if (value != null) onAnswer(value);
        }}>
          <span aria-hidden="true">$</span>
          <input
            value={text}
            onChange={event => setText(event.target.value)}
            inputMode="decimal"
            placeholder="Amount"
            aria-label="Amount"
          />
          <button type="submit" disabled={moneyToCents(text) == null}>Use</button>
          <button type="button" className="post-context-quiet" onClick={() => onAnswer(null)}>Not sure</button>
        </form>
      ) : null}
    </section>
  );
}
