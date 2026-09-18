import Link from 'next/link';
export default function NotFound() {
  return <main className="plain-page"><p className="kicker">404</p><h1>Nothing here.</h1><p>The page you opened does not exist.</p><Link className="text-link" href="/">Back to Spin Out</Link></main>;
}
