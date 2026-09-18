'use client';

class SpinAudio {
  private ctx: AudioContext | null = null;
  private ambient: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  muted = false;

  private getCtx() {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setMuted(value: boolean) {
    this.muted = value;
    if (value) this.stopAmbient();
  }

  click() {
    const ctx = this.getCtx(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(180, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(105, ctx.currentTime + .05);
    g.gain.setValueAtTime(.035, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .07);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .08);
  }

  ping() {
    const ctx = this.getCtx(); if (!ctx) return;
    const g = ctx.createGain(); g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .27);
    [440, 660].forEach((frequency, index) => {
      const o = ctx.createOscillator(); o.type = index ? 'sine' : 'triangle'; o.frequency.value = frequency;
      o.connect(g); o.start(ctx.currentTime + index * .035); o.stop(ctx.currentTime + .3);
    });
  }

  spin(duration = 850) {
    const ctx = this.getCtx(); if (!ctx) return;
    const seconds = duration / 1000;
    const size = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate); const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(640, ctx.currentTime); filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + seconds);
    gain.gain.value = .045; src.buffer = buffer; src.connect(filter).connect(gain).connect(ctx.destination); src.start();
    const ticks = Math.max(6, Math.round(seconds * 13));
    for (let i = 0; i < ticks; i++) {
      const t = ctx.currentTime + (i / Math.max(1, ticks - 1)) * seconds * .92;
      const click = ctx.createOscillator(); const cg = ctx.createGain();
      click.type = 'square'; click.frequency.value = 105 + i * 4;
      cg.gain.setValueAtTime(.0001, t); cg.gain.exponentialRampToValueAtTime(.018, t + .002); cg.gain.exponentialRampToValueAtTime(.0001, t + .022);
      click.connect(cg).connect(ctx.destination); click.start(t); click.stop(t + .024);
    }
  }

  result(netCents: number) {
    const ctx = this.getCtx(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = netCents > 0 ? 520 : netCents < 0 ? 150 : 260;
    g.gain.setValueAtTime(.04, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .13);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .14);
    const overtone = ctx.createOscillator(); const og = ctx.createGain();
    overtone.type = 'triangle'; overtone.frequency.value = (netCents > 0 ? 520 : netCents < 0 ? 150 : 260) * 1.5;
    og.gain.setValueAtTime(.018, ctx.currentTime); og.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .1);
    overtone.connect(og).connect(ctx.destination); overtone.start(); overtone.stop(ctx.currentTime + .11);
  }

  startAmbient() {
    if (this.ambient || this.muted) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420;
    const gain = ctx.createGain(); gain.gain.value = .008;
    source.connect(filter).connect(gain).connect(ctx.destination); source.start(); this.ambient = { source, gain };
  }

  stopAmbient() { if (!this.ambient) return; try { this.ambient.source.stop(); } catch {} this.ambient = null; }
}

export const spinAudio = new SpinAudio();
