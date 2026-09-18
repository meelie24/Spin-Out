import Link from 'next/link';
export const metadata = { title: 'Privacy | Spin Out' };
export default function PrivacyPage() {
  return <main className="plain-page">
    <p className="kicker">Privacy</p>
    <h1>Your data stays limited to what Spin Out needs.</h1>
    <p className="lead">Reality Runs are local-first. If you sign in, selected profile and run history can sync to your Spin Out account so Plus works across devices.</p>
    <section><h2>Reality Run data</h2><p>Spin Out may store your intended wager, gambling type, trigger, urge ratings, available money, income timing, obligation details, optional first name, optional goals, run decisions, Reality Pings, exit timing and real-world outcome.</p></section>
    <section><h2>Accounts</h2><p>Sign-in uses Supabase authentication. Account sessions are handled with secure browser cookies. Signed-in profile and run history are protected by row-level access rules tied to your account.</p></section>
    <section><h2>Live presence</h2><p>The small live count uses a random session ID with a short expiry. It is stored separately from your Reality Setup, run history, financial context and identity. The number disappears if the presence service is unavailable.</p></section>
    <section><h2>Payments</h2><p>Spin Out does not collect gambling deposits or payment details for a Reality Run. Spin Out+ checkout is handled by PayPal when billing is enabled. Paid access is verified server-side against the signed-in account.</p></section>
    <section><h2>Advertising</h2><p>Spin Out does not build advertising audiences from your urge, gambling history or financial context.</p></section>
    <Link href="/" className="text-link">Back home</Link>
  </main>;
}
