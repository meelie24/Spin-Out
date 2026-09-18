import type { PaydayPlanAction, RealityProfile } from '../types';

export interface PaydayShieldCard {
  key:'payday'|'friday-night'|'late-night';
  title:string;
  detail:string;
  facts:string[];
  plan:string[];
}

function dollars(cents:number){
  const amount=cents/100;
  return '$'+(Number.isInteger(amount)?amount.toFixed(0):amount.toFixed(2));
}

function dayDifference(date:string|null,now:Date){
  if(!date) return null;
  const target=new Date(date+'T12:00:00');
  if(!Number.isFinite(target.getTime())) return null;
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  return Math.round((target.getTime()-today.getTime())/86_400_000);
}

function obligationFact(profile:RealityProfile){
  if(profile.obligationType==='none'||!profile.obligationAmountCents) return null;
  const label=profile.obligationType==='car'?'Car'
    :profile.obligationType==='rent'?'Rent'
    :profile.obligationType==='credit-card'?'Credit card'
    :profile.obligationType==='phone'?'Phone'
    :profile.obligationType==='loan'?'Debt'
    :profile.obligationType==='groceries'?'Groceries'
    :profile.obligationType==='utilities'?'Utilities'
    :profile.obligationType==='childcare'?'Childcare'
    :profile.obligationType==='insurance'?'Insurance'
    :'Next bill';
  return `${label}: ${dollars(profile.obligationAmountCents)}`;
}

function planLine(action:PaydayPlanAction,profile:RealityProfile){
  if(action==='open-spinout') return 'Open Spin Out before I deposit anything.';
  if(action==='move-bill-money'){
    const fact=obligationFact(profile);
    return fact ? `Move ${fact.split(': ')[1]} for ${fact.split(': ')[0].toLowerCase()} first.` : 'Move bill money first.';
  }
  if(action==='move-savings') return 'Move savings first.';
  if(action==='message-someone') return 'Message someone.';
  if(action==='use-gambling-block') return 'Use a gambling block.';
  return profile.paydayPlanCustom?.trim() || null;
}

export function buildPaydayShield(profile:RealityProfile,now=new Date()):PaydayShieldCard|null{
  const difficult=new Set(profile.difficultTimes??[]);
  let key:PaydayShieldCard['key']|null=null;
  let title='';
  let detail='';

  const days=dayDifference(profile.nextIncomeDate,now);
  if(difficult.has('payday') && days!=null && (days===0||days===1)){
    key='payday';
    title=days===0?"Payday's today.":"Payday's tomorrow.";
    detail="You told us that's usually a rough one.";
  } else if(difficult.has('friday-night') && now.getDay()===5 && now.getHours()>=17){
    key='friday-night';
    title='Friday night.';
    detail='You told us this is one of the harder times.';
  } else if(difficult.has('late-night') && (now.getHours()>=22||now.getHours()<4)){
    key='late-night';
    title="It's late.";
    detail='You told us late nights can get harder.';
  }

  if(!key) return null;

  const fact=obligationFact(profile);
  const facts=fact?[fact]:[];
  const plan=(profile.paydayPlanActions??[])
    .slice(0,2)
    .map(action=>planLine(action,profile))
    .filter((line):line is string=>Boolean(line));

  return {key,title,detail,facts,plan};
}
