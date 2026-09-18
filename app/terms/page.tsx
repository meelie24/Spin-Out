import Link from 'next/link';
export const metadata = { title: 'Terms | Spin Out' };
export default function TermsPage() {
  return <main className="plain-page">
    <p className="kicker">Terms</p>
    <h1>Spin Out is a simulation.</h1>
    <p className="lead">Balances inside a Reality Run have no cash value. They cannot be deposited, withdrawn, redeemed or won.</p>
    <section><h2>No real-money gambling</h2><p>Spin Out does not accept gambling wagers, gambling deposits, cash-value credits, prizes or jackpots.</p></section>
    <section><h2>Spin Out+</h2><p>Spin Out+ is an optional subscription for history and trend features. Core Reality Runs remain available without a paid subscription.</p></section>
    <section><h2>Not medical treatment</h2><p>Spin Out has not been clinically validated as a treatment and does not replace professional gambling support, mental-health care or financial advice.</p></section>
    <section><h2>Gambling cues</h2><p>The simulation uses gambling-style visuals and sounds. Those cues can increase urges for some people. Leave the run and use the support page if the experience is making things worse.</p></section>
    <Link href="/" className="text-link">Back home</Link>
  </main>;
}
