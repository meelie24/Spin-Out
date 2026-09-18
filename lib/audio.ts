'use client';

import type { GamblingType } from './types';

const PREF_KEY = 'spinout.audio.v1';

class SpinAudio {
  private ctx: AudioContext | null = null;
  private ambient: { source: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode } | null = null;
  private muted = false;
  private masterVolume = .75;
  private hydrated = false;

  private hydrate() {
    if (this.hydrated || typeof window === 'undefined') return;
    this.hydrated = true;
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { muted?: unknown; volume?: unknown };
      if (typeof saved.muted === 'boolean') this.muted = saved.muted;
      const volume = Number(saved.volume);
      if (Number.isFinite(volume)) this.masterVolume = Math.max(0, Math.min(1, volume));
    } catch {}
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ muted: this.muted, volume: this.masterVolume }));
    } catch {}
  }

  private getCtx() {
    this.hydrate();
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  isMuted() {
    this.hydrate();
    return this.muted;
  }

  setMuted(value: boolean) {
    this.hydrate();
    this.muted = value;
    this.persist();
    if (value) this.stopAmbient();
  }

  setMasterVolume(value: number) {
    this.hydrate();
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.persist();
    if (this.ambient) this.ambient.gain.gain.value = .008 * this.masterVolume;
  }

  setAmbientMode(mode: 'normal' | 'cooling' | 'ledger' | 'strong') {
    const ambient = this.ambient;
    if (!ambient) return;

    const now = this.ctx?.currentTime ?? 0;
    const targets = mode === 'normal'
      ? { gain: .008, frequency: 420 }
      : mode === 'cooling'
        ? { gain: .0058, frequency: 300 }
        : mode === 'ledger'
          ? { gain: .0064, frequency: 340 }
          : { gain: .0042, frequency: 230 };

    ambient.gain.gain.cancelScheduledValues(now);
    ambient.gain.gain.setTargetAtTime(this.gain(targets.gain), now, .22);
    ambient.filter.frequency.cancelScheduledValues(now);
    ambient.filter.frequency.setTargetAtTime(targets.frequency, now, .22);
  }

  private gain(amount: number) {
    return amount * this.masterVolume;
  }

  click() {
    const ctx = this.getCtx(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(105, ctx.currentTime + .05);
    g.gain.setValueAtTime(this.gain(.035), ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .07);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .08);
  }

  ping() {
    const ctx = this.getCtx(); if (!ctx) return;
    const g = ctx.createGain(); g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(this.gain(.08), ctx.currentTime + .01);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .27);
    [440, 660].forEach((frequency, index) => {
      const o = ctx.createOscillator();
      o.type = index ? 'sine' : 'triangle';
      o.frequency.value = frequency;
      o.connect(g);
      o.start(ctx.currentTime + index * .035);
      o.stop(ctx.currentTime + .3);
    });
  }

  spin(duration = 850, game: GamblingType = 'slots') {
    const ctx = this.getCtx(); if (!ctx) return;
    const seconds = duration / 1000;

    if (game === 'sports') {
      [240, 320].forEach((frequency, index) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        const t = ctx.currentTime + index * .055;
        o.type = 'sine'; o.frequency.value = frequency;
        g.gain.setValueAtTime(this.gain(.025), t);
        g.gain.exponentialRampToValueAtTime(.0001, t + .07);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + .08);
      });
      return;
    }

    const size = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      const decay = game === 'lottery' ? .65 : 1 - i / size;
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = buffer;

    if (game === 'casino') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + seconds);
      gain.gain.value = this.gain(.032);
    } else if (game === 'poker') {
      filter.type = 'highpass';
      filter.frequency.value = 900;
      gain.gain.value = this.gain(.018);
    } else if (game === 'lottery') {
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      gain.gain.value = this.gain(.026);
    } else {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(640, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + seconds);
      gain.gain.value = this.gain(.045);
    }

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();

    const ticks = game === 'casino'
      ? Math.max(12, Math.round(seconds * 18))
      : game === 'poker'
        ? 5
        : game === 'lottery'
          ? 9
          : Math.max(6, Math.round(seconds * 13));

    for (let i = 0; i < ticks; i++) {
      const t = ctx.currentTime + (i / Math.max(1, ticks - 1)) * seconds * .92;
      const click = ctx.createOscillator(); const cg = ctx.createGain();
      click.type = game === 'poker' ? 'triangle' : 'square';
      click.frequency.value = game === 'casino' ? 180 + (i % 4) * 35 : game === 'poker' ? 720 - i * 45 : 105 + i * 4;
      cg.gain.setValueAtTime(.0001, t);
      cg.gain.exponentialRampToValueAtTime(this.gain(game === 'poker' ? .012 : .018), t + .002);
      cg.gain.exponentialRampToValueAtTime(.0001, t + .022);
      click.connect(cg).connect(ctx.destination); click.start(t); click.stop(t + .024);
    }
  }

  result(netCents: number, game: GamblingType = 'slots') {
    const ctx = this.getCtx(); if (!ctx) return;
    const base = netCents > 0 ? 520 : netCents < 0 ? 150 : 260;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = game === 'casino' ? 'triangle' : 'sine';
    o.frequency.value = game === 'sports' ? base * .85 : base;
    g.gain.setValueAtTime(this.gain(.04), ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .13);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .14);

    const overtone = ctx.createOscillator(); const og = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.value = base * 1.5;
    og.gain.setValueAtTime(this.gain(.018), ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .1);
    overtone.connect(og).connect(ctx.destination); overtone.start(); overtone.stop(ctx.currentTime + .11);
  }

  startAmbient() {
    this.hydrate();
    if (this.ambient || this.muted) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const gain = ctx.createGain();
    gain.gain.value = this.gain(.008);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    this.ambient = { source, gain, filter };
  }

  stopAmbient() {
    if (!this.ambient) return;
    try { this.ambient.source.stop(); } catch {}
    this.ambient = null;
  }
}

export const spinAudio = new SpinAudio();
