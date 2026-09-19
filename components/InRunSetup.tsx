'use client';

import { useEffect, useMemo, useState } from 'react';
import { isFinancialContextStale } from '@/lib/engine';
import type {
  DifficultTime,
  OnboardingQuestionKey,
  PaydayPlanAction,
  RealityProfile,
} from '@/lib/types';

type QuestionKind = 'date' | 'money' | 'text' | 'choices' | 'yes-no';

interface ChoiceOption {
  label: string;
  value: string;
}

interface SetupQuestion {
  key: OnboardingQuestionKey;
  title: string;
  kind: QuestionKind;
  options?: ChoiceOption[];
  placeholder?: string;
  skipLabel?: string;
}

const financialKeys: OnboardingQuestionKey[] = [
  'income-date',
  'available-money',
  'obligation-amount',
  'obligation-date',
];

const difficultOptions: ChoiceOption[] = [
  { value: 'payday', label: 'Payday' },
  { value: 'friday-night', label: 'Friday night' },
  { value: 'late-night', label: 'Late at night' },
  { value: 'after-drinking', label: "When I'm drinking" },
  { value: 'after-argument', label: 'After an argument' },
  { value: 'bored', label: "When I'm bored" },
  { value: 'stressed', label: "When I'm stressed" },
  { value: 'alone', label: "When I'm alone" },
];

const paydayOptions: ChoiceOption[] = [
  { value: 'open-spinout', label: 'Open Spin Out first' },
  { value: 'move-bill-money', label: 'Move bill money first' },
  { value: 'move-savings', label: 'Move savings first' },
  { value: 'message-someone', label: 'Message someone' },
  { value: 'use-gambling-block', label: 'Use a gambling block' },
  { value: 'skip', label: 'Not sure' },
];

function obligationName(profile: RealityProfile) {
  const names: Record<string, string> = {
    rent: 'rent / mortgage',
    car: 'car payment',
    groceries: 'groceries',
    'credit-card': 'credit card',
    utilities: 'utilities',
    childcare: 'childcare',
    loan: 'debt / loan',
    insurance: 'insurance',
    phone: 'phone bill',
    other: 'bill',
  };
  return names[profile.obligationType] ?? 'bill';
}

function isoInDays(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function inferredCompletion(profile: RealityProfile) {
  const set = new Set<OnboardingQuestionKey>(profile.onboardingCompleted ?? []);

  if (!profile.onboardingCompleted) {
    if (profile.nextIncomeDate) set.add('income-date');
    if (profile.availableUntilIncomeCents != null) set.add('available-money');

    if (profile.obligationType === 'none') {
      set.add('obligation-amount');
      set.add('obligation-date');
    } else {
      if (profile.obligationAmountCents != null) set.add('obligation-amount');
      if (profile.obligationDueDate) set.add('obligation-date');
    }

    if (profile.quitReason?.trim()) set.add('quit-reason');
    if (profile.personalMoneyGoal?.trim()) set.add('money-goal');
    if (profile.difficultTimes?.length) set.add('difficult-times');

    if (profile.recentLenderName?.trim()) {
      set.add('lender-name');
      set.add('lender-helped');
      if (!profile.recentLenderHelpedRecently || profile.recentLenderAmountCents != null) {
        set.add('lender-amount');
      }
    }

    if (profile.paydayPlanActions?.length) set.add('payday-plan');
  }

  if (isFinancialContextStale(profile)) {
    financialKeys.forEach(key => set.delete(key));
  }

  return set;
}

function pendingQuestions(profile: RealityProfile): SetupQuestion[] {
  const complete = inferredCompletion(profile);
  const questions: SetupQuestion[] = [];
  const push = (question: SetupQuestion) => {
    if (!complete.has(question.key)) questions.push(question);
  };

  push({
    key: 'income-date',
    title: "When's more money coming in?",
    kind: 'date',
    options: [
      { value: 'today', label: 'Today' },
      { value: 'tomorrow', label: 'Tomorrow' },
      { value: 'this-week', label: 'This week' },
      { value: 'next-week', label: 'Next week' },
      { value: 'pick-date', label: 'Pick a date' },
      { value: 'not-sure', label: 'Not sure' },
    ],
  });

  push({
    key: 'available-money',
    title: 'About how much do you have to work with until then?',
    kind: 'money',
    placeholder: 'Amount',
    skipLabel: 'Not sure',
  });

  if (profile.obligationType !== 'none') {
    push({
      key: 'obligation-amount',
      title: `You said the ${obligationName(profile)}. How much is it?`,
      kind: 'money',
      placeholder: 'Amount',
      skipLabel: 'Not sure',
    });
    push({
      key: 'obligation-date',
      title: 'When does it have to be paid?',
      kind: 'date',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'this-week', label: 'This week' },
        { value: 'next-week', label: 'Next week' },
        { value: 'pick-date', label: 'Pick a date' },
        { value: 'not-sure', label: 'Not sure' },
      ],
      });
  }

  push({
    key: 'quit-reason',
    title: 'What are you trying to stop from happening again?',
    kind: 'text',
    placeholder: 'A few words is enough',
    skipLabel: 'Not sure',
  });

  push({
    key: 'money-goal',
    title: "Is there something you'd rather this money still be there for?",
    kind: 'choices',
    options: [
      { value: 'Emergency fund', label: 'Emergency fund' },
      { value: 'Family', label: 'Family' },
      { value: 'Debt', label: 'Debt' },
      { value: 'Savings', label: 'Savings' },
      { value: 'Something else', label: 'Something else' },
      { value: 'skip', label: 'Not sure' },
    ],
  });

  push({
    key: 'difficult-times',
    title: 'When does gambling usually get harder to ignore?',
    kind: 'choices',
    options: difficultOptions,
  });

  push({
    key: 'lender-name',
    title: 'If you came up short, who would you probably call?',
    kind: 'text',
    placeholder: 'First name',
    skipLabel: 'No one',
  });

  if (profile.recentLenderName?.trim()) {
    push({
      key: 'lender-helped',
      title: `Has ${profile.recentLenderName.trim()} had to help you recently?`,
      kind: 'yes-no',
      options: [
        { value: 'yes', label: 'Yeah' },
        { value: 'no', label: 'No' },
      ],
    });

    if (profile.recentLenderHelpedRecently) {
      push({
        key: 'lender-amount',
        title: 'About how much did they have to cover?',
        kind: 'money',
        placeholder: 'Amount',
        skipLabel: 'Not sure',
      });
    }
  }

  push({
    key: 'payday-plan',
    title: 'When payday hits, what would help keep the money where you want it?',
    kind: 'choices',
    options: paydayOptions,
  });

  return questions;
}

function cents(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) : null;
}

export function InRunSetup({
  profile,
  foregroundOpen,
  collapseSignal,
  onProfileChange,
}: {
  profile: RealityProfile;
  foregroundOpen: boolean;
  collapseSignal: number;
  onProfileChange: (next: RealityProfile) => void;
}) {
  const questions = useMemo(() => pendingQuestions(profile), [profile]);
  const [expanded, setExpanded] = useState(true);
  const [consuming, setConsuming] = useState(false);
  const [consumingQuestion, setConsumingQuestion] = useState<SetupQuestion | null>(null);
  const [customDate, setCustomDate] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [openAtSignal, setOpenAtSignal] = useState(collapseSignal);
  const [choicePager, setChoicePager] = useState<{ key: OnboardingQuestionKey | null; page: number }>({ key: null, page: 0 });

  const activeQuestion = consumingQuestion ?? questions[0] ?? null;
  const forcedCollapsed = foregroundOpen || collapseSignal > openAtSignal;
  const effectiveExpanded = expanded && !forcedCollapsed;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(Boolean(media?.matches));
    sync();
    media?.addEventListener?.('change', sync);
    return () => media?.removeEventListener?.('change', sync);
  }, []);

  const complete = (question: SetupQuestion, value: string | number | boolean | null) => {
    if (consuming) return;

    const completed = inferredCompletion(profile);
    completed.add(question.key);

    let next: RealityProfile = {
      ...profile,
      onboardingCompleted: Array.from(completed),
    };

    if (question.key === 'income-date') {
      next = { ...next, nextIncomeDate: value as string | null, financialContextUpdatedAt: new Date().toISOString() };
    } else if (question.key === 'available-money') {
      next = { ...next, availableUntilIncomeCents: value as number | null, financialContextUpdatedAt: new Date().toISOString() };
    } else if (question.key === 'obligation-amount') {
      next = { ...next, obligationAmountCents: value as number | null, financialContextUpdatedAt: new Date().toISOString() };
    } else if (question.key === 'obligation-date') {
      next = { ...next, obligationDueDate: value as string | null, financialContextUpdatedAt: new Date().toISOString() };
    } else if (question.key === 'quit-reason') {
      next = { ...next, quitReason: typeof value === 'string' && value.trim() ? value.trim().slice(0, 180) : null };
    } else if (question.key === 'money-goal') {
      next = { ...next, personalMoneyGoal: typeof value === 'string' && value !== 'skip' ? value : null };
    } else if (question.key === 'difficult-times') {
      next = { ...next, difficultTimes: value ? [value as DifficultTime] : [] };
    } else if (question.key === 'lender-name') {
      const name = typeof value === 'string' && value.trim() ? value.trim().slice(0, 40) : null;
      if (!name) {
        completed.add('lender-helped');
        completed.add('lender-amount');
      }
      next = {
        ...next,
        recentLenderName: name,
        recentLenderHelpedRecently: name ? next.recentLenderHelpedRecently : false,
        recentLenderAmountCents: name ? next.recentLenderAmountCents : null,
        onboardingCompleted: Array.from(completed),
      };
    } else if (question.key === 'lender-helped') {
      const helped = value === true;
      if (!helped) completed.add('lender-amount');
      next = {
        ...next,
        recentLenderHelpedRecently: helped,
        recentLenderAmountCents: helped ? next.recentLenderAmountCents : null,
        onboardingCompleted: Array.from(completed),
      };
    } else if (question.key === 'lender-amount') {
      next = { ...next, recentLenderAmountCents: value as number | null };
    } else if (question.key === 'payday-plan') {
      next = {
        ...next,
        paydayPlanActions: value && value !== 'skip' ? [value as PaydayPlanAction] : [],
      };
    }

    setConsumingQuestion(question);
    setConsuming(true);
    onProfileChange(next);

    const duration = reducedMotion ? 130 : 960;
    window.setTimeout(() => {
      setConsuming(false);
      setConsumingQuestion(null);
      setCustomDate(false);
      setInputValue('');
      setChoicePager({ key: null, page: 0 });
      setExpanded(false);
    }, duration);
  };

  const currentChoicePage = activeQuestion && choicePager.key === activeQuestion.key ? choicePager.page : 0;

  const pagedOptions = (options: ChoiceOption[]) => {
    if (options.length <= 4) {
      return { visible: options, canBack: false, canMore: false };
    }

    if (currentChoicePage === 0) {
      return { visible: options.slice(0, 3), canBack: false, canMore: true };
    }

    const start = 3 + (currentChoicePage - 1) * 2;
    const remainingOptions = options.length - start;
    const canMore = remainingOptions > 3;
    return {
      visible: options.slice(start, start + (canMore ? 2 : 3)),
      canBack: true,
      canMore,
    };
  };

  if (!activeQuestion) return null;

  const state = forcedCollapsed ? 'collapsed' : consuming ? 'consuming' : effectiveExpanded ? 'expanded' : 'collapsed';

  if (state === 'collapsed') {
    return (
      <aside className="in-run-setup" data-state="collapsed" data-reduced-motion={reducedMotion ? 'true' : 'false'}>
        <button
          type="button"
          className="setup-rail"
          aria-label="Make it more immersive"
          onClick={() => {
            setOpenAtSignal(collapseSignal);
            setExpanded(true);
          }}
        >
          <span>Make it more immersive</span>
          <b aria-hidden="true">↑</b>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="in-run-setup"
      data-state={state}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-label="Make it more immersive"
    >
      <div className={`setup-question ${consuming ? 'is-consuming' : ''}`}>
        <div className="setup-question-top">
          <h2 className="setup-question-title">{activeQuestion.title}</h2>
          <button
            type="button"
            className="setup-not-now"
            onClick={() => setExpanded(false)}
            disabled={consuming}
          >Not now</button>
        </div>

        {activeQuestion.kind === 'date' ? (
          customDate ? (
            <form
              className="setup-input-row"
              onSubmit={event => {
                event.preventDefault();
                const value = String(new FormData(event.currentTarget).get('date') ?? '');
                if (value) complete(activeQuestion, value);
              }}
            >
              <input name="date" type="date" aria-label="Pick a date" required />
              <button type="submit">Use</button>
              <button type="button" className="setup-quiet" onClick={() => setCustomDate(false)}>Back</button>
            </form>
          ) : (() => {
            const page = pagedOptions(activeQuestion.options ?? []);
            return (
              <div className="setup-choice-row is-paged">
                {page.canBack ? (
                  <button
                    type="button"
                    className="setup-page-control"
                    onClick={() => setChoicePager({ key: activeQuestion.key, page: Math.max(0, currentChoicePage - 1) })}
                  >Back</button>
                ) : null}
                {page.visible.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      const value = option.value;
                      if (value === 'pick-date') {
                        setCustomDate(true);
                      } else if (value === 'today') {
                        complete(activeQuestion, isoInDays(0));
                      } else if (value === 'tomorrow') {
                        complete(activeQuestion, isoInDays(1));
                      } else if (value === 'this-week') {
                        complete(activeQuestion, isoInDays(5));
                      } else if (value === 'next-week') {
                        complete(activeQuestion, isoInDays(7));
                      } else {
                        complete(activeQuestion, null);
                      }
                    }}
                  >{option.label}</button>
                ))}
                {page.canMore ? (
                  <button
                    type="button"
                    className="setup-page-control"
                    onClick={() => setChoicePager({ key: activeQuestion.key, page: currentChoicePage + 1 })}
                  >More</button>
                ) : null}
              </div>
            );
          })()
        ) : null}

        {activeQuestion.kind === 'money' ? (
          <form
            className="setup-input-row"
            onSubmit={event => {
              event.preventDefault();
              const value = cents(inputValue);
              if (value != null) complete(activeQuestion, value);
            }}
          >
            <span aria-hidden="true">$</span>
            <input
              inputMode="decimal"
              aria-label={activeQuestion.placeholder ?? 'Amount'}
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              placeholder={activeQuestion.placeholder}
            />
            <button type="submit">Use</button>
            <button type="button" className="setup-quiet" onClick={() => complete(activeQuestion, null)}>{activeQuestion.skipLabel}</button>
          </form>
        ) : null}

        {activeQuestion.kind === 'text' ? (
          <form
            className="setup-input-row setup-text-row"
            onSubmit={event => {
              event.preventDefault();
              complete(activeQuestion, inputValue);
            }}
          >
            <input
              aria-label={activeQuestion.placeholder ?? 'Answer'}
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              placeholder={activeQuestion.placeholder}
              maxLength={180}
            />
            <button type="submit" disabled={!inputValue.trim()}>Use</button>
            <button type="button" className="setup-quiet" onClick={() => complete(activeQuestion, null)}>{activeQuestion.skipLabel}</button>
          </form>
        ) : null}

        {activeQuestion.kind === 'choices' || activeQuestion.kind === 'yes-no'
          ? (() => {
              const page = pagedOptions(activeQuestion.options ?? []);
              return (
                <div className="setup-choice-row is-paged">
                  {page.canBack ? (
                    <button
                      type="button"
                      className="setup-page-control"
                      onClick={() => setChoicePager({ key: activeQuestion.key, page: Math.max(0, currentChoicePage - 1) })}
                    >Back</button>
                  ) : null}
                  {page.visible.map(option => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        if (activeQuestion.kind === 'yes-no') {
                          complete(activeQuestion, option.value === 'yes');
                        } else if (activeQuestion.key === 'difficult-times') {
                          complete(activeQuestion, option.value as DifficultTime);
                        } else if (activeQuestion.key === 'payday-plan') {
                          complete(activeQuestion, option.value === 'skip' ? null : option.value);
                        } else {
                          complete(activeQuestion, option.value);
                        }
                      }}
                    >{option.label}</button>
                  ))}
                  {page.canMore ? (
                    <button
                      type="button"
                      className="setup-page-control"
                      onClick={() => setChoicePager({ key: activeQuestion.key, page: currentChoicePage + 1 })}
                    >More</button>
                  ) : null}
                </div>
              );
            })()
          : null}
      </div>

      {consuming ? (
        <div className="setup-consume-effect" aria-hidden="true">
          <span className="setup-black-hole" />
          <span className="setup-droplet setup-droplet-a" />
          <span className="setup-droplet setup-droplet-b" />
          <span className="setup-droplet setup-droplet-c" />
        </div>
      ) : null}
    </aside>
  );
}
