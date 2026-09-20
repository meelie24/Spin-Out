import type { ActiveRun, ExitReason, RealityProfile } from '../types';

export interface RealityReceipt {
  durationSeconds: number;
  rounds: number;
  startedCents: number;
  endedCents: number;
  behavior: string | null;
  translation: string | null;
  respectedLimit: boolean | null;
}

function dollars(cents:number){
  const amount=cents/100;
  return '$'+(Number.isInteger(amount)?amount.toFixed(0):amount.toFixed(2));
}

function obligationLabel(profile:RealityProfile){
  if(profile.obligationType==='car') return 'car payment';
  if(profile.obligationType==='rent') return 'rent';
  if(profile.obligationType==='groceries') return 'groceries';
  if(profile.obligationType==='credit-card') return 'credit card payment';
  if(profile.obligationType==='utilities') return 'utilities';
  if(profile.obligationType==='phone') return 'phone bill';
  if(profile.obligationType==='loan') return 'loan';
  if(profile.obligationType==='childcare') return 'childcare';
  if(profile.obligationType==='insurance') return 'insurance';
  if(profile.obligationType==='other') return 'bill';
  return null;
}

function raisedAfterLoss(run:ActiveRun){
  let lastActionNet:number|null=null;
  let previousStake:number|undefined;
  for(const event of run.timeline){
    if(event.kind==='action'){
      lastActionNet=event.netCents ?? null;
      previousStake=event.stakeCents;
    } else if(event.kind==='stake'){
      if(lastActionNet!=null && lastActionNet<0 && previousStake!=null
        && event.stakeCents!=null && event.stakeCents>previousStake) return true;
      previousStake=event.stakeCents;
    }
  }
  return false;
}

function behaviorFor(run:ActiveRun, endedAt:number, reason:ExitReason){
  if(run.chosenLimitRounds!=null && run.actionCount>run.chosenLimitRounds){
    const over=run.actionCount-run.chosenLimitRounds;
    return `You went ${over} round${over===1?'':'s'} past the limit you chose.`;
  }

  if(run.chosenLimitMinutes!=null){
    const overSeconds=Math.round((endedAt-run.startedAt)/1000)-run.chosenLimitMinutes*60;
    if(overSeconds>0){
      const minutes=Math.max(1,Math.round(overSeconds/60));
      return `You stayed about ${minutes} minute${minutes===1?'':'s'} past the time you chose.`;
    }
  }

  if(raisedAfterLoss(run)) return 'You raised the amount after a loss.';

  const intervals=(run.actionIntervalsMs??[]).slice(-4);
  if(intervals.length===4 && intervals.every(value=>value<1900)){
    return 'Your last four decisions came fast.';
  }

  const lastPing=run.pings[run.pings.length-1];
  if(reason==='voluntary' && lastPing && endedAt>=lastPing.shownAt && endedAt-lastPing.shownAt<=60_000){
    return 'You left after the last Reality Ping.';
  }

  return null;
}

function translationFor(profile:RealityProfile,run:ActiveRun){
  const loss=Math.max(0,run.initialBalanceCents-run.balanceCents);
  const label=obligationLabel(profile);
  if(!loss || !label || !profile.obligationAmountCents || profile.obligationAmountCents<=0) return null;
  const percentage=Math.round((loss/profile.obligationAmountCents)*100);
  return `${dollars(loss)} is about ${percentage}% of the ${label} you entered.`;
}

export function buildRealityReceipt(
  profile:RealityProfile,
  run:ActiveRun,
  endedAt:number,
  reason:ExitReason = 'voluntary',
):RealityReceipt{
  const durationSeconds=Math.max(0,Math.round((endedAt-run.startedAt)/1000));
  const hasLimit=run.chosenLimitRounds!=null||run.chosenLimitMinutes!=null;
  const respectedRounds=run.chosenLimitRounds==null||run.actionCount<=run.chosenLimitRounds;
  const respectedTime=run.chosenLimitMinutes==null||durationSeconds<=run.chosenLimitMinutes*60;

  return {
    durationSeconds,
    rounds:run.actionCount,
    startedCents:run.initialBalanceCents,
    endedCents:run.balanceCents,
    behavior:behaviorFor(run,endedAt,reason),
    translation:translationFor(profile,run),
    respectedLimit:hasLimit?respectedRounds&&respectedTime:null,
  };
}
