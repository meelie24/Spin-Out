'use client';

import type { GamblingType, OutcomeBand } from './types';

export interface AnimatedOutcome {
  band: OutcomeBand;
  netCents: number;
  balanceCents: number;
  actionCount: number;
}

export interface RealityGameBridge {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setContext(balanceCents: number): void;
  destroy(): void;
}

type PhaserModule = typeof import('phaser');

type SceneApi = {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setContext(balanceCents: number): void;
};

const SYMBOLS = ['cherry', 'bell', 'seven', 'plum', 'lemon', 'gem'] as const;
type SymbolName = (typeof SYMBOLS)[number];
const STRIP: SymbolName[] = ['cherry','plum','bell','lemon','gem','seven'];

function centerForBand(band: OutcomeBand): SymbolName[] {
  switch (band) {
    case 'loss': return ['lemon','bell','plum','gem','cherry'];
    case 'partial-loss': return ['cherry','lemon','plum','gem','bell'];
    case 'push': return ['cherry','cherry','lemon','plum','gem'];
    case 'win': return ['bell','bell','bell','lemon','plum'];
    case 'big-win': return ['seven','seven','seven','seven','seven'];
  }
}
function shift(symbol: SymbolName, offset: number) {
  const i = STRIP.indexOf(symbol); return STRIP[(i + offset + STRIP.length * 4) % STRIP.length];
}
function gridForBand(band: OutcomeBand) {
  const center = centerForBand(band);
  return [center.map((s,i)=>shift(s,-i-1)), center, center.map((s,i)=>shift(s,i+1))];
}

function money(cents: number) {
  const n = Math.abs(cents) / 100;
  return `${cents < 0 ? '-' : ''}$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
}

export async function mountRealityGame(
  parent: HTMLElement,
  options: { gameType: GamblingType; reducedMotion: boolean; initialBalanceCents: number },
): Promise<RealityGameBridge> {
  const Phaser = await import('phaser');
  let sceneApi: SceneApi | null = null;

  class RealityScene extends Phaser.Scene {
    private balanceText: any;
    private slotRoot: any;
    private gameSurface: any;
    private reelMasks: any[] = [];
    private reelContainers: any[] = [];
    private resultText: any;
    private wheel: any;
    private cards: any[] = [];
    private ticketCells: any[] = [];
    private sportsRows: any[] = [];

    constructor() { super('RealityScene'); }

    preload() {
      if (options.gameType === 'slots' || options.gameType === 'other') {
        for (const symbol of SYMBOLS) this.load.svg(symbol, `/symbols/${symbol}.svg`);
      }
    }

    create() {
      this.cameras.main.setBackgroundColor('#140c0b');
      this.drawRoom(Phaser);
      this.balanceText = this.add.text(500, 65, money(options.initialBalanceCents), {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '23px', fontStyle: '600', color: '#fff7e8'
      }).setOrigin(.5);
      this.add.text(500, 41, 'PRACTICE BALANCE', { fontFamily: 'Inter,Arial', fontSize: '10px', color: '#bcae99', letterSpacing: 2 }).setOrigin(.5);
      this.add.text(500, 595, 'PRACTICE ONLY · NO REAL MONEY', { fontFamily: 'Inter,Arial', fontSize: '10px', color: '#907f6e', letterSpacing: 1.5 }).setOrigin(.5);
      this.resultText = this.add.text(500, 540, '', { fontFamily: 'Inter,Arial', fontSize: '22px', fontStyle: '600', color: '#ead4ad' }).setOrigin(.5).setAlpha(0);

      switch (options.gameType) {
        case 'sports': this.createSports(Phaser); break;
        case 'casino': this.createRoulette(Phaser); break;
        case 'poker': this.createPoker(Phaser); break;
        case 'lottery': this.createLottery(Phaser); break;
        default: this.createSlots(Phaser); break;
      }

      sceneApi = {
        playOutcome: (outcome) => this.animateOutcome(outcome, Phaser),
        setContext: balance => this.setContext(balance),
      };
    }

    private drawRoom(P: PhaserModule) {
      const g = this.add.graphics();
      g.fillStyle(0x140c0b, 1).fillRect(0, 0, 1000, 640);
      g.fillStyle(0x241512, 1).fillRoundedRect(54, 82, 892, 476, 30);
      g.lineStyle(2, 0xb99354, .48).strokeRoundedRect(56, 84, 888, 472, 28);
      g.lineStyle(1, 0xf1d7a3, .2).strokeRoundedRect(68, 96, 864, 448, 24);
      // subtle casino-rug geometry
      g.lineStyle(1, 0x9f7438, .13);
      for (let x = 70; x < 930; x += 44) for (let y = 112; y < 540; y += 44) {
        g.strokeCircle(x + ((y / 44) % 2) * 22, y, 6);
      }
      const bulbYs = [108, 532];
      bulbYs.forEach((y, row) => {
        for (let x = 88, i = 0; x <= 912; x += 44, i++) {
          const bulb = this.add.circle(x, y, 4.2, 0xffda82, .38);
          this.tweens.add({ targets: bulb, alpha: { from: .25, to: .92 }, duration: 850 + ((i + row) % 5) * 130, yoyo: true, repeat: -1, delay: i * 40 });
        }
      });
      for (let y = 145, i = 0; y <= 495; y += 44, i++) {
        [78, 922].forEach((x, side) => {
          const bulb = this.add.circle(x, y, 4, 0xffd77c, .33);
          this.tweens.add({ targets: bulb, alpha: { from: .2, to: .8 }, duration: 1000 + i * 60, yoyo: true, repeat: -1, delay: side * 110 });
        });
      }
      this.add.text(92, 53, 'SPIN OUT', { fontFamily: 'Inter,Arial', fontSize: '16px', fontStyle: '700', color: '#dfc48e', letterSpacing: 1.8 });
    }

    private createSlots(P: PhaserModule) {
      const root = this.add.container(0, 0); this.slotRoot = root; this.gameSurface = root;
      const frame = this.add.graphics(); frame.fillStyle(0x0e0b0b, .96).fillRoundedRect(104, 126, 792, 368, 15);
      frame.lineStyle(3, 0xb99354, .85).strokeRoundedRect(104, 126, 792, 368, 15);
      frame.lineStyle(1, 0xf4dca8, .3).strokeRoundedRect(114, 136, 772, 348, 11); root.add(frame);
      const grid = gridForBand('loss');
      const reelW = 148, rowH = 108, startX = 130, startY = 148;
      for (let col = 0; col < 5; col++) {
        const bg = this.add.rectangle(startX + col * reelW + reelW / 2, startY + rowH * 1.5, reelW - 2, rowH * 3, 0xf2e7d3).setStrokeStyle(1, 0x6d5f52, .5); root.add(bg);
        const maskShape = this.make.graphics({ x: 0, y: 0 }); maskShape.fillStyle(0xffffff).fillRect(startX + col * reelW, startY, reelW - 2, rowH * 3);
        const mask = maskShape.createGeometryMask(); this.reelMasks[col] = mask;
        const reel = this.add.container(startX + col * reelW, startY); reel.setMask(mask); root.add(reel); this.reelContainers[col] = reel;
        for (let row = 0; row < 3; row++) {
          const img = this.add.image(reelW / 2, row * rowH + rowH / 2, grid[row][col]).setDisplaySize(86, 86); reel.add(img);
        }
        const shade = this.add.graphics();
        shade.fillStyle(0x3e2a22, .12).fillRect(startX + col * reelW, startY, 15, rowH * 3);
        shade.fillStyle(0x3e2a22, .10).fillRect(startX + col * reelW + reelW - 17, startY, 15, rowH * 3); root.add(shade);
      }
      const m = this.add.graphics(); m.fillStyle(0xd6ac63, .9).fillTriangle(111, 309, 124, 302, 124, 316).fillTriangle(889, 309, 876, 302, 876, 316); root.add(m);
    }

    private createSports(P: PhaserModule) {
      const root = this.add.container(0, 0); this.gameSurface = root;
      const panel = this.add.graphics(); panel.fillStyle(0x0e1414, .96).fillRoundedRect(124, 140, 752, 336, 16).lineStyle(2, 0x9f8a57, .7).strokeRoundedRect(124, 140, 752, 336, 16); root.add(panel);
      this.add.text(156, 158, 'LIVE MARKET · FICTIONAL', { fontFamily: 'Inter,Arial', fontSize: '11px', color: '#a8b7aa', letterSpacing: 1.5 });
      const games = [['North Harbor','East Vale','1.92','2.05'],['Cedar City','West Point','2.18','1.74'],['Riverside','Kingsport','1.84','2.12']];
      games.forEach((row,i)=>{
        const y=202+i*82; const bg=this.add.rectangle(500,y+26,680,66,0x17201f,.94).setStrokeStyle(1,0x49625d,.55); root.add(bg);
        root.add(this.add.text(178,y+5,`${row[0]}  vs  ${row[1]}`,{fontFamily:'Inter,Arial',fontSize:'18px',color:'#f4efe5'}));
        const odds=this.add.text(722,y+6,`${row[2]}    ${row[3]}`,{fontFamily:'Inter,Arial',fontSize:'16px',color:'#d8c28e'}); root.add(odds); this.sportsRows.push(bg);
      });
    }

    private createRoulette(P: PhaserModule) {
      const root = this.add.container(0,0); this.gameSurface = root;
      const felt=this.add.graphics(); felt.fillStyle(0x153228,.98).fillRoundedRect(124,140,752,336,18).lineStyle(2,0xb99354,.65).strokeRoundedRect(124,140,752,336,18); root.add(felt);
      const wheel=this.add.container(380,308); this.wheel=wheel; root.add(wheel);
      for(let i=0;i<24;i++){ const a=i*Math.PI*2/24; const color=i%2?0x8d1f2d:0x171719; const wedge=this.add.graphics(); wedge.fillStyle(color,1).slice(0,0,128,a,a+Math.PI*2/24,true).fillPath(); wheel.add(wedge); }
      wheel.add(this.add.circle(0,0,55,0xc8a15e).setStrokeStyle(4,0xf2d596));
      root.add(this.add.text(580,230,'ROULETTE',{fontFamily:'Inter,Arial',fontSize:'28px',fontStyle:'700',color:'#f1dfbd'}));
      root.add(this.add.text(580,274,'Practice table\nFake balance only',{fontFamily:'Inter,Arial',fontSize:'15px',color:'#aab8ae',lineSpacing:7}));
    }

    private createPoker(P: PhaserModule) {
      const root=this.add.container(0,0); this.gameSurface=root; const felt=this.add.graphics(); felt.fillStyle(0x173128,.98).fillRoundedRect(124,140,752,336,18).lineStyle(2,0xb99354,.65).strokeRoundedRect(124,140,752,336,18); root.add(felt);
      root.add(this.add.text(500,170,'FIVE CARD DRAW',{fontFamily:'Inter,Arial',fontSize:'14px',color:'#d9c49a',letterSpacing:2}).setOrigin(.5));
      for(let i=0;i<5;i++){ const card=this.add.container(300+i*100,305); const bg=this.add.rectangle(0,0,82,120,0xf4eee2).setStrokeStyle(2,0x9f8355); const t=this.add.text(0,0,'?',{fontFamily:'Georgia',fontSize:'38px',fontStyle:'700',color:'#211817'}).setOrigin(.5); card.add([bg,t]); root.add(card); this.cards.push({card,text:t}); }
    }

    private createLottery(P: PhaserModule) {
      const root=this.add.container(0,0); this.gameSurface=root; const paper=this.add.graphics(); paper.fillStyle(0xf2e6cd,.98).fillRoundedRect(160,142,680,332,16).lineStyle(3,0xc49a4e,.75).strokeRoundedRect(160,142,680,332,16); root.add(paper);
      root.add(this.add.text(500,170,'SCRATCH PRACTICE',{fontFamily:'Inter,Arial',fontSize:'15px',fontStyle:'700',color:'#5e4729',letterSpacing:2}).setOrigin(.5));
      for(let i=0;i<9;i++){ const x=325+(i%3)*175,y=245+Math.floor(i/3)*82; const c=this.add.rectangle(x,y,140,62,0x7f664c).setStrokeStyle(2,0xe0c38d,.8); root.add(c); this.ticketCells.push(c); }
    }

    private setContext(balanceCents: number) { this.balanceText?.setText(money(balanceCents)); }

    private async animateOutcome(outcome: AnimatedOutcome, P: PhaserModule) {
      this.resultText.setAlpha(0);
      if (options.gameType === 'slots' || options.gameType === 'other') await this.animateSlots(outcome, P);
      else if (options.gameType === 'casino') await this.animateRoulette(outcome, P);
      else if (options.gameType === 'poker') await this.animatePoker(outcome, P);
      else if (options.gameType === 'lottery') await this.animateLottery(outcome, P);
      else await this.animateSports(outcome, P);
      this.setContext(outcome.balanceCents);
      this.showResult(outcome);
    }

    private showResult(outcome: AnimatedOutcome) {
      const label = outcome.netCents > 0 ? `+${money(outcome.netCents)}`.replace('+$','+$') : money(outcome.netCents);
      this.resultText.setText(outcome.netCents === 0 ? 'No change' : `${label} ${outcome.netCents < 0 ? 'LOSS' : 'GAIN'}`);
      this.resultText.setColor(outcome.netCents > 0 ? '#e9d6a6' : outcome.netCents < 0 ? '#d7b7ad' : '#b9b1a5');
      this.tweens.add({ targets: this.resultText, alpha: 1, y: { from: 548, to: 540 }, duration: options.reducedMotion ? 0 : 180 });
    }

    private animateSlots(outcome: AnimatedOutcome, P: PhaserModule) {
      const grid=gridForBand(outcome.band); const reelW=148,rowH=108,startX=130,startY=148;
      return new Promise<void>(resolve=>{
        let done=0;
        for(let col=0;col<5;col++){
          const old=this.reelContainers[col]; if(old) old.destroy(true);
          const reel=this.add.container(startX+col*reelW,startY); reel.setMask(this.reelMasks[col]); this.slotRoot.add(reel); this.reelContainers[col]=reel;
          const sequence:SymbolName[]=[]; for(let i=0;i<8;i++) sequence.push(STRIP[(i+col*2)%STRIP.length]); sequence.push(grid[0][col],grid[1][col],grid[2][col]);
          sequence.forEach((s,i)=>{ const img=this.add.image(reelW/2,i*rowH+rowH/2,s).setDisplaySize(86,86); reel.add(img); });
          reel.y=startY-8*rowH;
          if(options.reducedMotion){ reel.y=startY; reel.removeAll(true); [grid[0][col],grid[1][col],grid[2][col]].forEach((s,i)=>reel.add(this.add.image(reelW/2,i*rowH+rowH/2,s).setDisplaySize(86,86))); done++; if(done===5) resolve(); continue; }
          this.tweens.add({targets:reel,y:startY,duration:760+col*14,ease:'Cubic.easeOut',onComplete:()=>{ reel.removeAll(true); [grid[0][col],grid[1][col],grid[2][col]].forEach((s,i)=>reel.add(this.add.image(reelW/2,i*rowH+rowH/2,s).setDisplaySize(86,86))); done++; if(done===5) resolve(); }});
        }
      });
    }

    private animateRoulette(outcome: AnimatedOutcome, P: PhaserModule) { return new Promise<void>(resolve=>{ if(options.reducedMotion){resolve();return;} this.tweens.add({targets:this.wheel,angle:this.wheel.angle+720+outcome.actionCount*15,duration:900,ease:'Cubic.easeOut',onComplete:()=>resolve()}); }); }
    private animatePoker(outcome: AnimatedOutcome, P: PhaserModule) { const hands:Record<OutcomeBand,string[]>={loss:['9♠','4♦','J♣','2♥','7♣'],'partial-loss':['Q♠','Q♦','5♣','8♥','2♣'],push:['A♠','K♦','8♣','5♥','3♣'],win:['K♠','K♦','K♣','6♥','3♣'],'big-win':['A♠','K♠','Q♠','J♠','10♠']}; return new Promise<void>(resolve=>{ const h=hands[outcome.band]; this.cards.forEach((c:any,i)=>{ c.text.setText(h[i]); c.card.setScale(.86); this.tweens.add({targets:c.card,scale:1,duration:options.reducedMotion?0:260,delay:i*55,ease:'Back.Out'}); }); this.time.delayedCall(options.reducedMotion?0:560,resolve); }); }
    private animateLottery(outcome: AnimatedOutcome, P: PhaserModule) { const colors:Record<OutcomeBand,number>={loss:0x715548,'partial-loss':0x947254,push:0x9a855b,win:0xb5924d,'big-win':0xd5b56f}; return new Promise<void>(resolve=>{ this.ticketCells.forEach((c:any,i)=>this.tweens.add({targets:c,alpha:.25,duration:options.reducedMotion?0:110,delay:i*35,yoyo:true,onYoyo:()=>c.setFillStyle(colors[outcome.band])})); this.time.delayedCall(options.reducedMotion?0:650,resolve); }); }
    private animateSports(outcome: AnimatedOutcome, P: PhaserModule) { return new Promise<void>(resolve=>{ const target=this.sportsRows[outcome.actionCount%this.sportsRows.length]; this.tweens.add({targets:target,alpha:{from:1,to:.38},duration:options.reducedMotion?0:220,yoyo:true,repeat:1,onComplete:resolve}); }); }
  }

  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: 1000,
    height: 640,
    parent,
    backgroundColor: '#140c0b',
    transparent: false,
    scene: [RealityScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1000, height: 640 },
    render: { antialias: true, roundPixels: false },
    audio: { noAudio: true },
  });

  await new Promise<void>(resolve => {
    const check = () => sceneApi ? resolve() : requestAnimationFrame(check); check();
  });

  return {
    playOutcome: outcome => sceneApi!.playOutcome(outcome),
    setContext: balance => sceneApi!.setContext(balance),
    destroy: () => { game.destroy(true); sceneApi = null; },
  };
}
