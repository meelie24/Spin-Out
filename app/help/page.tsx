import Link from 'next/link';
export const metadata = { title: 'Get help | Spin Out' };
const resources = [
  ['Gambling Therapy', 'Free online practical and emotional support worldwide.', 'https://gamblingtherapy.org/talk-to-us/'],
  ['Find A Helpline', 'Find support by country and topic.', 'https://findahelpline.com/'],
  ['BetBlocker', 'Free gambling-blocking software.', 'https://betblocker.org/'],
  ['Gamban', 'Gambling-blocking software for supported devices.', 'https://gamban.com/'],
  ['GAMSTOP', 'Self-exclusion for licensed online gambling in Great Britain.', 'https://www.gamstop.co.uk/'],
  ['NCPG', 'U.S. help and state-by-state support information.', 'https://www.ncpgambling.org/help-treatment/help-by-state/'],
];
export default function HelpPage() {
  return <main className="plain-page help-page"><p className="kicker">Outside support</p><h1>If Spin Out isn’t enough right now</h1><p className="lead">You can put more distance between you and gambling with blocking tools, self-exclusion or direct support.</p><div className="resource-list">{resources.map(([name,desc,url])=><a key={name} href={url} target="_blank" rel="noreferrer"><strong>{name}</strong><span>{desc}</span><b aria-hidden="true">↗</b></a>)}</div><p className="research-limit">Services vary by country. Spin Out does not guess where you are or invent local phone numbers.</p><Link href="/" className="text-link">Back home</Link></main>;
}
