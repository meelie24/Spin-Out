'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { syncProfileIfSignedIn } from '@/lib/sync';
import { updateData } from '@/lib/storage';
import type { DifficultTime, ObligationType, PaydayPlanAction, RealityProfile } from '@/lib/types';

const obligations: Array<{ value: ObligationType; label: string }> = [
  { value: 'rent', label: 'Rent' },
  { value: 'car', label: 'Car payment' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'phone', label: 'Phone' },
  { value: 'credit-card', label: 'Credit card' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'loan', label: 'Debt / loan' },
  { value: 'other', label: 'Something else' },
  { value: 'none', label: 'Nothing specific' },
];

const difficultOptions: Array<{ value: DifficultTime; label: string }> = [
  { value:'payday', label:'Payday' },
  { value:'friday-night', label:'Friday night' },
  { value:'late-night', label:'Late at night' },
  { value:'after-drinking', label:'After drinking' },
  { value:'after-argument', label:'After an argument' },
  { value:'bored', label:"When I'm bored" },
  { value:'stressed', label:"When I'm stressed" },
  { value:'alone', label:"When I'm alone" },
];

const planOptions: Array<{ value: PaydayPlanAction; label: string }> = [
  { value:'open-spinout', label:'Open Spin Out first' },
  { value:'move-bill-money', label:'Move bill money first' },
  { value:'move-savings', label:'Move savings first' },
  { value:'message-someone', label:'Message someone' },
  { value:'use-gambling-block', label:'Use a gambling block' },
];

function moneyValue(cents: number | null) {
  return cents == null ? '' : String(cents / 100);
}

function moneyLabel(cents: number | null) {
  return cents == null ? null : '$' + (cents / 100).toLocaleString();
}

function cents(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g,''));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null;
}

export function RealityContextPanel({
  profile,
  onClose,
  onSaved,
}: {
  profile: RealityProfile | null;
  onClose: () => void;
  onSaved: (profile: RealityProfile) => void;
}) {
  const [draft, setDraft] = useState<RealityProfile | null>(profile);
  const [amount, setAmount] = useState(profile ? moneyValue(profile.obligationAmountCents) : '');
  const [available, setAvailable] = useState(profile ? moneyValue(profile.availableUntilIncomeCents) : '');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const selectedPlans = useMemo(() => draft?.paydayPlanActions ?? [], [draft?.paydayPlanActions]);

  if (!draft) {
    return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="glass-dialog reality-context-dialog" role="dialog" aria-modal="true" aria-labelledby="reality-context-title" onMouseDown={e => e.stopPropagation()}>
        <p className="kicker">My reality</p>
        <h2 id="reality-context-title">Set this up during your first Reality Run.</h2>
        <p className="provider-note">Spin Out only asks for the money and timing it can actually use during a run.</p>
        <button className="primary-button" type="button" onClick={onClose}>Got it</button>
      </section>
    </div>;
  }

  const toggleDifficult = (value: DifficultTime) => {
    const current = draft.difficultTimes ?? [];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    setDraft({ ...draft, difficultTimes: next });
  };

  const togglePlan = (value: PaydayPlanAction) => {
    const current = draft.paydayPlanActions ?? [];
    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : current.length >= 2
        ? current
        : [...current, value];
    setDraft({ ...draft, paydayPlanActions: next });
  };

  const save = () => {
    const next: RealityProfile = {
      ...draft,
      obligationAmountCents: draft.obligationType === 'none' ? null : cents(amount),
      availableUntilIncomeCents: cents(available),
      difficultTimes: (draft.difficultTimes ?? []).slice(0, 8),
      paydayPlanActions: (draft.paydayPlanActions ?? []).slice(0, 2),
      difficultTimeCustom: draft.difficultTimeCustom?.trim().slice(0, 80) || null,
      paydayPlanCustom: draft.paydayPlanCustom?.trim().slice(0, 120) || null,
      personalMoneyGoal: draft.personalMoneyGoal?.trim().slice(0, 100) || null,
      quitReason: draft.quitReason?.trim().slice(0, 160) || null,
      financialContextUpdatedAt: new Date().toISOString(),
    };
    updateData(data => ({ ...data, profile: next }));
    void syncProfileIfSignedIn(next);
    setDraft(next);
    setAmount(moneyValue(next.obligationAmountCents));
    setAvailable(moneyValue(next.availableUntilIncomeCents));
    setSaved(true);
    setEditing(false);
    onSaved(next);
    window.setTimeout(() => setSaved(false), 900);
  };

  const clearLedger = () => {
    setAmount('');
    setAvailable('');
    setDraft({
      ...draft,
      obligationType:'none',
      obligationAmountCents:null,
      obligationDueDate:null,
      availableUntilIncomeCents:null,
      nextIncomeDate:null,
      personalMoneyGoal:null,
      additionalMoneyGoal:null,
    });
  };

  const obligationLabel = obligations.find(option => option.value === draft.obligationType)?.label ?? 'Not set';
  const dueBits = [
    moneyLabel(draft.obligationAmountCents),
    draft.obligationDueDate || null,
  ].filter(Boolean);
  const moneyDue = draft.obligationType === 'none'
    ? 'Nothing specific'
    : dueBits.join(' · ') || 'Details not set';

  const incomeBits = [
    moneyLabel(draft.availableUntilIncomeCents)
      ? moneyLabel(draft.availableUntilIncomeCents) + ' available'
      : null,
    draft.nextIncomeDate || null,
  ].filter(Boolean);
  const incomeSummary = incomeBits.join(' · ') || 'Not set';

  const difficultSummary = (draft.difficultTimes ?? [])
    .map(value => difficultOptions.find(option => option.value === value)?.label ?? value)
    .join(' · ') || 'Not set';

  const paydaySummary = (draft.paydayPlanActions ?? [])
    .map(value => planOptions.find(option => option.value === value)?.label ?? value)
    .join(' · ') || 'Not set';

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section ref={dialogRef} tabIndex={-1} className="glass-dialog reality-context-dialog" role="dialog" aria-modal="true" aria-labelledby="reality-context-title" onMouseDown={e => e.stopPropagation()}>
      <div className="reality-context-head">
        <div>
          <p className="kicker">My reality</p>
          <h2 id="reality-context-title">{editing ? 'Change what Spin Out keeps in mind.' : 'What Spin Out knows right now.'}</h2>
        </div>
        <button className="bare-link" type="button" onClick={onClose}>Close</button>
      </div>

      {!editing ? (
        <div className="reality-context-summary">
          <div className="context-summary-top">
            <p>These are the details Spin Out can use when they actually matter.</p>
            <button className="soft-button" type="button" onClick={() => setEditing(true)}>Edit</button>
          </div>

          <div className="context-summary-grid">
            <article>
              <span>What this money is for</span>
              <strong>{obligationLabel}</strong>
              <small>{moneyDue}</small>
            </article>
            <article>
              <span>Money coming in</span>
              <strong>{incomeSummary}</strong>
            </article>
            <article>
              <span>What I’m trying to keep it for</span>
              <strong>{draft.personalMoneyGoal?.trim() || 'Not set'}</strong>
            </article>
            <article>
              <span>When gambling gets harder to ignore</span>
              <strong>{difficultSummary}</strong>
            </article>
            <article>
              <span>Who I might call</span>
              <strong>{draft.recentLenderName?.trim() || 'Not set'}</strong>
            </article>
            <article>
              <span>Payday plan</span>
              <strong>{paydaySummary}</strong>
            </article>
          </div>

          {saved ? <p className="context-saved-note" role="status">Saved.</p> : null}
        </div>
      ) : (
        <div className="reality-context-editor">
          <div className="context-edit-section">
            <div className="context-edit-title">
              <strong>Life Ledger</strong>
              <button type="button" className="bare-link" onClick={clearLedger}>Clear</button>
            </div>

            <label>{"What's due next?"}
              <select value={draft.obligationType} onChange={e => setDraft({ ...draft, obligationType:e.target.value as ObligationType })}>
                {obligations.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            {draft.obligationType !== 'none' ? <div className="context-edit-pair">
              <label>How much?
                <span className="context-money-input">$<input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="430"/></span>
              </label>
              <label>When?
                <input type="date" value={draft.obligationDueDate ?? ''} onChange={e => setDraft({ ...draft, obligationDueDate:e.target.value || null })}/>
              </label>
            </div> : null}

            <div className="context-edit-pair">
              <label>Money until more comes in
                <span className="context-money-input">$<input inputMode="decimal" value={available} onChange={e => setAvailable(e.target.value)} placeholder="850"/></span>
              </label>
              <label>Next money date
                <input type="date" value={draft.nextIncomeDate ?? ''} onChange={e => setDraft({ ...draft, nextIncomeDate:e.target.value || null })}/>
              </label>
            </div>

            <label>Something you want the money available for
              <input value={draft.personalMoneyGoal ?? ''} onChange={e => setDraft({ ...draft, personalMoneyGoal:e.target.value })} placeholder="Emergency fund"/>
            </label>
          </div>

          <details className="context-edit-details">
            <summary>When does it usually get harder?<span>Optional</span></summary>
            <div className="context-edit-details-body">
              <div className="context-chip-grid">
                {difficultOptions.map(option => <button key={option.value} type="button" className={(draft.difficultTimes ?? []).includes(option.value) ? 'is-on' : ''} onClick={() => toggleDifficult(option.value)}>{option.label}</button>)}
              </div>
              <input value={draft.difficultTimeCustom ?? ''} onChange={e => setDraft({ ...draft, difficultTimeCustom:e.target.value })} placeholder="Something else"/>
            </div>
          </details>

          <details className="context-edit-details">
            <summary>If payday gets hard<span>Pick up to 2</span></summary>
            <div className="context-edit-details-body">
              <div className="context-chip-grid">
                {planOptions.map(option => <button key={option.value} type="button" className={selectedPlans.includes(option.value) ? 'is-on' : ''} onClick={() => togglePlan(option.value)}>{option.label}</button>)}
              </div>
              <input value={draft.paydayPlanCustom ?? ''} onChange={e => setDraft({ ...draft, paydayPlanCustom:e.target.value })} placeholder="My own plan"/>
            </div>
          </details>

          <details className="context-edit-details">
            <summary>More personal context<span>Optional</span></summary>
            <div className="context-edit-details-body">
              <label>If you came up short, who would you call?
                <input
                  value={draft.recentLenderName ?? ''}
                  onChange={e => setDraft({ ...draft, recentLenderName:e.target.value.replace(/[^a-zA-Z '-]/g,'').slice(0,32) })}
                  placeholder="First name"
                />
              </label>

              {draft.recentLenderName?.trim() ? <>
                <div className="inline-choices">
                  <button type="button" className={draft.recentLenderHelpedRecently ? 'is-on' : ''} onClick={() => setDraft({ ...draft, recentLenderHelpedRecently:true })}>Helped recently</button>
                  <button type="button" className={!draft.recentLenderHelpedRecently ? 'is-on' : ''} onClick={() => setDraft({ ...draft, recentLenderHelpedRecently:false, recentLenderAmountCents:null })}>No</button>
                </div>
                {draft.recentLenderHelpedRecently ? <label>About how much?
                  <span className="context-money-input">$<input
                    inputMode="decimal"
                    value={moneyValue(draft.recentLenderAmountCents)}
                    onChange={e => setDraft({ ...draft, recentLenderAmountCents:cents(e.target.value) })}
                    placeholder="Optional"
                  /></span>
                </label> : null}
              </> : null}

              <label>Why are you trying to stop?
                <input value={draft.quitReason ?? ''} onChange={e => setDraft({ ...draft, quitReason:e.target.value })} placeholder="Your words"/>
              </label>
            </div>
          </details>

          <button className="primary-button reality-context-save" type="button" onClick={save}>{saved ? 'Saved' : 'Save'}</button>
          <button className="bare-link context-cancel-edit" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </section>
  </div>;
}
