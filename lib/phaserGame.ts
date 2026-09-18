'use client';

import type { GameVisual, SlotSymbol } from './gameEngines';
import type { GamblingType, OutcomeBand } from './types';

export interface AnimatedOutcome {
  band: OutcomeBand;
  netCents: number;
  balanceCents: number;
  actionCount: number;
  decision?: string;
  visual?: GameVisual;
}

export interface RealityGameBridge {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setContext(balanceCents: number): void;
  setPokerHand(hand: string[], held: boolean[]): void;
  destroy(): void;
}

type PhaserModule = typeof import('phaser');

type SceneApi = {
  playOutcome(outcome: AnimatedOutcome): Promise<void>;
  setContext(balanceCents: number): void;
  setPokerHand(hand: string[], held: boolean[]): void;
};

const SYMBOLS: SlotSymbol[] = ['cherry', 'bell', 'seven', 'plum', 'lemon', 'gem'];
const ROULETTE_WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function defaultSlotGrid(): SlotSymbol[][] {
  return [
    ['lemon','cherry','plum','bell','gem'],
    ['cherry','plum','bell','lemon','seven'],
    ['gem','lemon','cherry','plum','bell'],
  ];
}

function money(cents: number) {
  const n = Math.abs(cents) / 100;
  return `${cents < 0 ? '-' : ''}$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
}

function cardDisplay(code: string) {
  const suit = code.slice(-1);
  const rank = code.slice(0, -1);
  const symbol = suit === 'S' ? '♠' : suit === 'H' ? '♥' : suit === 'D' ? '♦' : '♣';
  return rank + symbol;
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
    private reelMasks: any[] = [];
    private reelContainers: any[] = [];
    private resultText: any;
    private wheel: any;
    private rouletteNumberText: any;
    private rouletteBall: any;
    private cards: Array<{ card:any; text:any }> = [];
    private pokerHeldLabels: any[] = [];
    private ticketCells: Array<{ rect:any; text:any }> = [];
    private sportsRows: any[] = [];

    constructor() { super('RealityScene'); }

    preload() {
      if (options.gameType === 'slots' || options.gameType === 'other') {
        for (const symbol of SYMBOLS) this.load.svg(symbol, `/symbols/${symbol}.svg`, { width: 180, height: 180 });
      }
    }

    create() {
      this.cameras.main.setBackgroundColor('#140c0b');
      this.drawRoom(Phaser);
      this.balanceText = this.add.text(500, 65, money(options.initialBalanceCents), {
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '23px', fontStyle: '600', color: '#fff7e8'
      }).setOrigin(.5);
      this.add.text(500, 41, 'BALANCE', { fontFamily: 'Inter,Arial', fontSize: '10px', color: '#bcae99', letterSpacing: 2 }).setOrigin(.5);
      this.add.text(500, 595, 'SIMULATION', { fontFamily: 'Inter,Arial', fontSize: '10px', color: '#907f6e', letterSpacing: 1.5 }).setOrigin(.5);
      this.resultText = this.add.text(500, 540, '', {
        fontFamily: 'Inter,Arial', fontSize: '20px', fontStyle: '600', color: '#ead4ad', align: 'center'
      }).setOrigin(.5).setAlpha(0);

      switch (options.gameType) {
        case 'sports': this.createSports(); break;
        case 'casino': this.createRoulette(); break;
        case 'poker': this.createPoker(); break;
        case 'lottery': this.createLottery(); break;
        default: this.createSlots(); break;
      }

      sceneApi = {
        playOutcome: outcome => this.animateOutcome(outcome),
        setContext: balance => this.setContext(balance),
        setPokerHand: (hand, held) => this.setPokerHand(hand, held),
      };
    }

    private drawRoom(P: PhaserModule) {
      const g = this.add.graphics();
      g.fillStyle(0x140c0b, 1).fillRect(0, 0, 1000, 640);
      g.fillStyle(0x241512, 1).fillRoundedRect(54, 82, 892, 476, 30);
      g.lineStyle(2, 0xb99354, .48).strokeRoundedRect(56, 84, 888, 472, 28);
      g.lineStyle(1, 0xf1d7a3, .2).strokeRoundedRect(68, 96, 864, 448, 24);
      g.lineStyle(1, 0x9f7438, .13);
      for (let x = 70; x < 930; x += 44) for (let y = 112; y < 540; y += 44) {
        g.strokeCircle(x + ((y / 44) % 2) * 22, y, 6);
      }
      [108, 532].forEach((y, row) => {
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

    private createSlots() {
      const root = this.add.container(0, 0);
      this.slotRoot = root;
      const frame = this.add.graphics();
      frame.fillStyle(0x0e0b0b, .96).fillRoundedRect(104, 126, 792, 368, 15);
      frame.lineStyle(3, 0xb99354, .85).strokeRoundedRect(104, 126, 792, 368, 15);
      frame.lineStyle(1, 0xf4dca8, .3).strokeRoundedRect(114, 136, 772, 348, 11);
      root.add(frame);
      const grid = defaultSlotGrid();
      const reelW = 148, rowH = 108, startX = 130, startY = 148;
      for (let col = 0; col < 5; col++) {
        root.add(this.add.rectangle(startX + col * reelW + reelW / 2, startY + rowH * 1.5, reelW - 2, rowH * 3, 0xf2e7d3).setStrokeStyle(1, 0x6d5f52, .5));
        const maskShape = this.make.graphics({ x: 0, y: 0 });
        maskShape.fillStyle(0xffffff).fillRect(startX + col * reelW, startY, reelW - 2, rowH * 3);
        const mask = maskShape.createGeometryMask();
        this.reelMasks[col] = mask;
        const reel = this.add.container(startX + col * reelW, startY);
        reel.setMask(mask);
        root.add(reel);
        this.reelContainers[col] = reel;
        for (let row = 0; row < 3; row++) reel.add(this.add.image(reelW / 2, row * rowH + rowH / 2, grid[row][col]).setDisplaySize(86, 86));
      }
      const markers = this.add.graphics();
      markers.fillStyle(0xd6ac63, .9).fillTriangle(111, 309, 124, 302, 124, 316).fillTriangle(889, 309, 876, 302, 876, 316);
      root.add(markers);
      root.add(this.add.text(500, 118, '5 REELS · 5 PAYLINES', { fontFamily:'Inter,Arial', fontSize:'9px', color:'#a78c68', letterSpacing:1.4 }).setOrigin(.5));
    }

    private createSports() {
      const root = this.add.container(0, 0);
      const panel = this.add.graphics();
      panel.fillStyle(0x0d1514, .97).fillRoundedRect(112, 126, 776, 368, 18);
      panel.lineStyle(2, 0x9f8a57, .7).strokeRoundedRect(112, 126, 776, 368, 18);
      root.add(panel);
      root.add(this.add.text(145, 148, 'GAME LINES', { fontFamily:'Inter,Arial', fontSize:'12px', fontStyle:'700', color:'#e9dec9', letterSpacing:1.5 }));
      root.add(this.add.text(760, 148, 'MONEYLINE', { fontFamily:'Inter,Arial', fontSize:'10px', color:'#9ea99f', letterSpacing:1.2 }));

      const games = [
        ['North Harbor','East Vale','1.72','2.16'],
        ['Cedar City','West Point','2.25','1.68'],
        ['Riverside','Kingsport','1.91','1.91'],
      ];
      games.forEach((row, i) => {
        const y = 185 + i * 94;
        const box = this.add.container(0,0);
        const bg = this.add.rectangle(500, y + 34, 706, 78, 0x18211f, .96).setStrokeStyle(1, 0x4b5e57, .55);
        box.add(bg);
        box.add(this.add.text(168, y + 9, row[0], { fontFamily:'Inter,Arial', fontSize:'16px', fontStyle:'600', color:'#f4efe5' }));
        box.add(this.add.text(168, y + 39, row[1], { fontFamily:'Inter,Arial', fontSize:'16px', color:'#d6d1c7' }));
        const homeOdd = this.add.text(760, y + 8, row[2], { fontFamily:'Inter,Arial', fontSize:'15px', fontStyle:'700', color:'#e1c589' }).setOrigin(.5,0);
        const awayOdd = this.add.text(760, y + 38, row[3], { fontFamily:'Inter,Arial', fontSize:'15px', fontStyle:'700', color:'#e1c589' }).setOrigin(.5,0);
        box.add([homeOdd, awayOdd]);
        root.add(box);
        this.sportsRows.push(box);
      });
      root.add(this.add.text(500, 474, 'FICTIONAL EVENTS · DISPLAYED ODDS DRIVE THE RETURN', { fontFamily:'Inter,Arial', fontSize:'8px', color:'#7f8b82', letterSpacing:1.1 }).setOrigin(.5));
    }

    private createRoulette() {
      const root = this.add.container(0,0);
      const felt = this.add.graphics();
      felt.fillStyle(0x173028,.98).fillRoundedRect(112,126,776,368,18);
      felt.lineStyle(2,0xb99354,.65).strokeRoundedRect(112,126,776,368,18);
      root.add(felt);

      const wheel = this.add.container(340,310);
      this.wheel = wheel;
      root.add(wheel);
      const step = Math.PI * 2 / ROULETTE_WHEEL.length;
      ROULETTE_WHEEL.forEach((number, i) => {
        const angle = i * step - Math.PI / 2;
        const color = number === 0 ? 0x17613b : RED_NUMBERS.has(number) ? 0x8d2430 : 0x171719;
        const wedge = this.add.graphics();
        wedge.fillStyle(color,1).slice(0,0,142,angle,angle+step,true).fillPath();
        wedge.lineStyle(1,0xc9a769,.28).slice(0,0,142,angle,angle+step,true).strokePath();
        wheel.add(wedge);
        const mid = angle + step / 2;
        const label = this.add.text(Math.cos(mid)*121, Math.sin(mid)*121, String(number), {
          fontFamily:'Inter,Arial', fontSize:'8px', fontStyle:'700', color:'#f7e8d2'
        }).setOrigin(.5).setRotation(mid + Math.PI / 2);
        wheel.add(label);
      });
      wheel.add(this.add.circle(0,0,62,0xc49b5c).setStrokeStyle(4,0xf0d39b));
      wheel.add(this.add.circle(0,0,37,0x35261f));
      this.rouletteBall = this.add.circle(340,153,7,0xf7f0e2).setStrokeStyle(2,0xbca98b);
      root.add(this.rouletteBall);

      root.add(this.add.text(600,196,'EUROPEAN ROULETTE',{fontFamily:'Inter,Arial',fontSize:'24px',fontStyle:'700',color:'#f1dfbd'}));
      root.add(this.add.text(600,235,'Single zero · Red / Black',{fontFamily:'Inter,Arial',fontSize:'13px',color:'#aab8ae'}));
      this.rouletteNumberText = this.add.text(690,322,'—',{fontFamily:'Inter,Arial',fontSize:'70px',fontStyle:'700',color:'#f5e2c2'}).setOrigin(.5);
      root.add(this.rouletteNumberText);
      root.add(this.add.text(690,373,'RESULT',{fontFamily:'Inter,Arial',fontSize:'9px',color:'#8ca095',letterSpacing:1.6}).setOrigin(.5));
    }

    private createPoker() {
      const root=this.add.container(0,0);
      const felt=this.add.graphics();
      felt.fillStyle(0x173128,.98).fillRoundedRect(112,126,776,368,18);
      felt.lineStyle(2,0xb99354,.65).strokeRoundedRect(112,126,776,368,18);
      root.add(felt);
      root.add(this.add.text(500,151,'JACKS OR BETTER',{fontFamily:'Inter,Arial',fontSize:'16px',fontStyle:'700',color:'#ead4ad',letterSpacing:2}).setOrigin(.5));
      root.add(this.add.text(500,177,'9 / 6 PAY TABLE',{fontFamily:'Inter,Arial',fontSize:'8px',color:'#8fa397',letterSpacing:1.5}).setOrigin(.5));
      for(let i=0;i<5;i++){
        const card=this.add.container(294+i*103,315);
        const bg=this.add.rectangle(0,0,88,128,0xf6efe3).setStrokeStyle(2,0xb3935c);
        const t=this.add.text(0,-3,'?',{fontFamily:'Georgia',fontSize:'30px',fontStyle:'700',color:'#211817'}).setOrigin(.5);
        const held=this.add.text(0,75,'',{fontFamily:'Inter,Arial',fontSize:'8px',fontStyle:'700',color:'#e6c98d',letterSpacing:1}).setOrigin(.5);
        card.add([bg,t,held]);
        root.add(card);
        this.cards.push({card,text:t});
        this.pokerHeldLabels.push(held);
      }
      root.add(this.add.text(500,450,'DEAL · SELECT CARDS TO HOLD · DRAW',{fontFamily:'Inter,Arial',fontSize:'9px',color:'#91a399',letterSpacing:1.1}).setOrigin(.5));
    }

    private createLottery() {
      const root=this.add.container(0,0);
      const paper=this.add.graphics();
      paper.fillStyle(0xf2e6cd,.98).fillRoundedRect(145,130,710,356,16);
      paper.lineStyle(3,0xc49a4e,.75).strokeRoundedRect(145,130,710,356,16);
      root.add(paper);
      root.add(this.add.text(500,154,'MATCH 3',{fontFamily:'Inter,Arial',fontSize:'17px',fontStyle:'700',color:'#5e4729',letterSpacing:2}).setOrigin(.5));
      root.add(this.add.text(500,181,'REVEAL 9 PRIZE AMOUNTS',{fontFamily:'Inter,Arial',fontSize:'9px',color:'#907754',letterSpacing:1.2}).setOrigin(.5));
      for(let i=0;i<9;i++){
        const x=325+(i%3)*175,y=245+Math.floor(i/3)*82;
        const rect=this.add.rectangle(x,y,140,62,0x765a43).setStrokeStyle(2,0xe0c38d,.8);
        const text=this.add.text(x,y,'SCRATCH',{fontFamily:'Inter,Arial',fontSize:'11px',fontStyle:'700',color:'#ead9b9',letterSpacing:1}).setOrigin(.5);
        root.add([rect,text]);
        this.ticketCells.push({rect,text});
      }
    }

    private setContext(balanceCents: number) {
      this.balanceText?.setText(money(balanceCents));
    }

    private setPokerHand(hand: string[], held: boolean[]) {
      if (options.gameType !== 'poker') return;
      this.cards.forEach((card, i) => {
        const code = hand[i] ?? '?';
        card.text.setText(code === '?' ? '?' : cardDisplay(code));
        const red = code.endsWith('H') || code.endsWith('D');
        card.text.setColor(red ? '#8d2430' : '#211817');
        card.card.setScale(held[i] ? 1.04 : 1);
        this.pokerHeldLabels[i]?.setText(held[i] ? 'HELD' : '');
      });
    }

    private async animateOutcome(outcome: AnimatedOutcome) {
      this.resultText.setAlpha(0);
      if (options.gameType === 'slots' || options.gameType === 'other') await this.animateSlots(outcome);
      else if (options.gameType === 'casino') await this.animateRoulette(outcome);
      else if (options.gameType === 'poker') await this.animatePoker(outcome);
      else if (options.gameType === 'lottery') await this.animateLottery(outcome);
      else await this.animateSports(outcome);
      this.setContext(outcome.balanceCents);
      this.showResult(outcome);
    }

    private showResult(outcome: AnimatedOutcome) {
      let prefix = '';
      if (outcome.visual?.kind === 'slots') prefix = outcome.visual.paylinesWon ? `${outcome.visual.paylinesWon} LINE${outcome.visual.paylinesWon === 1 ? '' : 'S'} · ` : '';
      if (outcome.visual?.kind === 'roulette') prefix = `${outcome.visual.number} ${outcome.visual.color.toUpperCase()} · `;
      if (outcome.visual?.kind === 'sports') prefix = `${outcome.visual.winner} · `;
      if (outcome.visual?.kind === 'poker') prefix = `${outcome.visual.handName} · `;
      if (outcome.visual?.kind === 'scratch') prefix = outcome.visual.won ? 'MATCH 3 · ' : 'NO MATCH · ';
      const label = outcome.netCents > 0 ? '+' + money(outcome.netCents) : money(outcome.netCents);
      this.resultText.setText(prefix + (outcome.netCents === 0 ? 'PUSH' : label));
      this.resultText.setColor(outcome.netCents > 0 ? '#e9d6a6' : outcome.netCents < 0 ? '#d7b7ad' : '#b9b1a5');
      this.tweens.add({ targets: this.resultText, alpha: 1, y: { from: 548, to: 540 }, duration: options.reducedMotion ? 0 : 180 });
    }

    private animateSlots(outcome: AnimatedOutcome) {
      const grid = outcome.visual?.kind === 'slots' ? outcome.visual.grid : defaultSlotGrid();
      const reelW = 148, rowH = 108, startX = 130, startY = 148;
      const finalize = () => {
        for (let col = 0; col < 5; col++) {
          const reel = this.reelContainers[col];
          if (!reel) continue;
          reel.y = startY;
          reel.removeAll(true);
          for (let row=0; row<3; row++) reel.add(this.add.image(reelW/2,row*rowH+rowH/2,grid[row][col]).setDisplaySize(86,86));
        }
      };

      for (let col=0; col<5; col++) {
        const old=this.reelContainers[col];
        if (old) old.destroy(true);
        const reel=this.add.container(startX+col*reelW,startY);
        reel.setMask(this.reelMasks[col]);
        this.slotRoot.add(reel);
        this.reelContainers[col]=reel;
        const sequence: SlotSymbol[]=[];
        for(let i=0;i<9;i++) sequence.push(SYMBOLS[(i+col*2)%SYMBOLS.length]);
        sequence.push(grid[0][col],grid[1][col],grid[2][col]);
        sequence.forEach((symbol,i)=>reel.add(this.add.image(reelW/2,i*rowH+rowH/2,symbol).setDisplaySize(86,86)));
        reel.y=startY-9*rowH;
        if(!options.reducedMotion) this.tweens.add({targets:reel,y:startY,duration:760+col*90,ease:'Cubic.easeOut'});
      }
      if(options.reducedMotion){finalize();return Promise.resolve();}
      return new Promise<void>(resolve=>window.setTimeout(()=>{finalize();resolve();},1200));
    }

    private animateRoulette(outcome: AnimatedOutcome) {
      const visual = outcome.visual?.kind === 'roulette' ? outcome.visual : null;
      if (visual) {
        const index = ROULETTE_WHEEL.indexOf(visual.number);
        this.rouletteNumberText?.setText(String(visual.number)).setColor(visual.color === 'red' ? '#e39a9f' : visual.color === 'green' ? '#91c3a3' : '#f5e2c2');
        if (!options.reducedMotion && index >= 0) {
          const pocketAngle = index * (360 / ROULETTE_WHEEL.length);
          this.tweens.add({ targets:this.wheel, angle:this.wheel.angle + 1080 - pocketAngle, duration:1450, ease:'Cubic.easeOut' });
          this.tweens.add({ targets:this.rouletteBall, angle: -720 + pocketAngle, duration:1400, ease:'Cubic.easeOut' });
        }
      }
      return options.reducedMotion ? Promise.resolve() : new Promise<void>(resolve=>window.setTimeout(resolve,1500));
    }

    private animatePoker(outcome: AnimatedOutcome) {
      const visual=outcome.visual?.kind==='poker' ? outcome.visual : null;
      if(visual) this.setPokerHand(visual.hand,visual.held);
      this.cards.forEach((card,i)=>{
        card.card.setScale(.88);
        this.tweens.add({targets:card.card,scale:1,duration:options.reducedMotion?0:240,delay:i*55,ease:'Back.Out'});
      });
      return options.reducedMotion ? Promise.resolve() : new Promise<void>(resolve=>window.setTimeout(resolve,560));
    }

    private animateLottery(outcome: AnimatedOutcome) {
      const visual=outcome.visual?.kind==='scratch' ? outcome.visual : null;
      this.ticketCells.forEach((cell,i)=>{
        this.tweens.add({
          targets:[cell.rect,cell.text],
          alpha:{from:.35,to:1},
          scaleX:{from:.9,to:1},
          duration:options.reducedMotion?0:155,
          delay:i*70,
          ease:'Power2',
          onStart:()=>{
            const value=visual?.cells[i] ?? 0;
            cell.rect.setFillStyle(visual?.won && value===visual.prizeCents ? 0xb28b43 : 0x8a7154);
            cell.text.setText(value ? money(value) : '—').setColor('#3c2a1e');
          },
        });
      });
      return options.reducedMotion ? Promise.resolve() : new Promise<void>(resolve=>window.setTimeout(resolve,820));
    }

    private animateSports(outcome: AnimatedOutcome) {
      const visual=outcome.visual?.kind==='sports' ? outcome.visual : null;
      const marketIndex = visual ? [['North Harbor','East Vale'],['Cedar City','West Point'],['Riverside','Kingsport']].findIndex(pair=>pair.includes(visual.selected)) : -1;
      const target=this.sportsRows[marketIndex];
      if(target) this.tweens.add({targets:target,alpha:{from:1,to:.4},duration:options.reducedMotion?0:220,yoyo:true,repeat:1});
      return options.reducedMotion ? Promise.resolve() : new Promise<void>(resolve=>window.setTimeout(resolve,520));
    }
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
    const check = () => sceneApi ? resolve() : requestAnimationFrame(check);
    check();
  });

  return {
    playOutcome: outcome => sceneApi!.playOutcome(outcome),
    setContext: balance => sceneApi!.setContext(balance),
    setPokerHand: (hand, held) => sceneApi!.setPokerHand(hand, held),
    destroy: () => { game.destroy(true); sceneApi = null; },
  };
}
