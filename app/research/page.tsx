import Link from 'next/link';
export const metadata = { title: 'Research | Spin Out' };
export default function ResearchPage() {
  return <main className="plain-page research-page" data-editorial="ledger">
    <header className="plain-page-intro">
      <p className="kicker">Research</p>
      <h1>Why Spin Out works this way</h1>
      <p className="lead">Spin Out draws on research about chasing losses, gambling cues, interruptions and messages shown during play.</p>
    </header>
    <div className="plain-page-body">
      <section><h2>Chasing losses</h2><p>Losing can make leaving harder because another bet can feel like a way to erase what just happened. Reality Pings bring the amount or obligation back into view while the run is still active.</p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2827449/" target="_blank" rel="noreferrer">Background on gambling decision-making</a></section>
      <section><h2>Messages during play</h2><p>Researchers have tested pop-up messages and self-appraisal prompts during gambling. Spin Out uses short questions to interrupt automatic repetition. Those studies did not test Spin Out.</p><a href="https://pubmed.ncbi.nlm.nih.gov/34366941/" target="_blank" rel="noreferrer">Warning pop-up randomized trial</a></section>
      <section><h2>Breaks in play</h2><p>Interruptions can change the rhythm of continuous play. Spin Out keeps the simulation finite and lets real-life context break through without rewarding longer sessions.</p><a href="https://pubmed.ncbi.nlm.nih.gov/26275785/" target="_blank" rel="noreferrer">Breaks in play study</a></section>
      <section><h2>Gambling cues</h2><p>Gambling-style cues can increase urges for some people. That is why Spin Out asks for an urge rating and keeps outside help close.</p><a href="https://pubmed.ncbi.nlm.nih.gov/27804002/" target="_blank" rel="noreferrer">Cue-reactivity research</a></section>
      <p className="research-limit">Spin Out has not been clinically tested as a treatment. These sources explain design choices, not proof that the product works.</p>
      <Link href="/" className="text-link">Back home</Link>
    </div>
  </main>;
}
