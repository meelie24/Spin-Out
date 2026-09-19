'use client';

import type { GameVisual, SlotSymbol } from './gameEngines';
import type { GamblingType, OutcomeBand } from './types';

export interface AnimatedOutcome {
  band: OutcomeBand;
  netCents: number;
  balanceCents: number;
  actionCount: number;
  decision?: string;
  nearMiss?: boolean;
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

const SYMBOLS: SlotSymbol[] = ['cherry', 'bell', 'bar', 'seven', 'plum', 'lemon', 'gem'];
const ROULETTE_WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const SLOT_LAYOUT = { reelW: 142, rowH: 84, startX: 145, startY: 210, symbolSize: 75 };

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
  await document.fonts.ready;
  const bodyStyle = typeof document !== 'undefined' ? getComputedStyle(document.body) : null;
  const uiFont = bodyStyle?.getPropertyValue('--font-ui').trim() || 'Arial, sans-serif';
  const displayFont = uiFont;
  let sceneApi: SceneApi | null = null;

  class RealityScene extends Phaser.Scene {
    private balanceText: any;
    private slotRoot: any;
    private reelMasks: any[] = [];
    private reelContainers: any[] = [];
    private resultText: any;
    private resultPlate: any;
    private outcomeGlow: any;
    private wheel: any;
    private rouletteNumberText: any;
    private rouletteBall: any;
    private cards: Array<{ card:any; text:any }> = [];
    private pokerHeldLabels: any[] = [];
    private ticketCells: Array<{ rect:any; text:any }> = [];
    private sportsRows: any[] = [];

    constructor() { super('RealityScene'); }

    preload() {
      this.load.image('room-scene', `/game-art/${options.gameType}-scene.webp`);
      if (options.gameType === 'slots' || options.gameType === 'other') {
        for (const symbol of SYMBOLS) this.load.svg(symbol, `/symbols/${symbol}.svg`, { width: 180, height: 180 });
      }
    }

    create() {
      this.cameras.main.setBackgroundColor('#140c0b');
      this.drawRoom(Phaser);
      this.outcomeGlow = this.add.rectangle(500, 315, 850, 400, 0xd4aa67, 0).setBlendMode(Phaser.BlendModes.ADD);
      this.balanceText = this.add.text(500, 65, money(options.initialBalanceCents), {
        fontFamily: uiFont, fontSize: '23px', fontStyle: '600', color: '#fff7e8'
      }).setOrigin(.5).setVisible(false);
      // Balance and controls are readable HTML in the HUD; the canvas owns the game.
      this.resultPlate = this.add.rectangle(500, 542, 850, 62, 0x13100d, .92).setAlpha(0);
      this.resultText = this.add.text(500, 540, '', {
        fontFamily: uiFont, fontSize: '48px', fontStyle: '600', color: '#ead4ad', align: 'center'
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
      g.fillStyle(0x0b0706, 1).fillRect(0, 0, 1000, 640);
      this.add.image(500, 320, 'room-scene').setDisplaySize(1000, 1000).setAlpha(.34);

      if (options.gameType !== 'slots' && options.gameType !== 'other') {
        const stage = this.add.graphics();
        if (options.gameType === 'sports') {
          stage.fillStyle(0x0c1715, .68).fillRect(0, 0, 1000, 640);
          stage.lineStyle(2, 0xd8ba7a, .26).lineBetween(74, 100, 926, 100);
          stage.lineStyle(1, 0xa0c5af, .18).lineBetween(74, 522, 926, 522);
        } else if (options.gameType === 'lottery') {
          stage.fillStyle(0x432719, .46).fillRect(0, 0, 1000, 640);
        } else {
          stage.fillStyle(0x0c251d, .7).fillEllipse(500, 330, 1120, 760);
          stage.lineStyle(12, 0x5e3927, .85).strokeEllipse(500, 330, 1100, 690);
          stage.lineStyle(2, 0xd3af73, .35).strokeEllipse(500, 330, 1068, 657);
        }
        return;
      }

      // Deep lacquer room with non-repeating environmental depth.
      g.fillStyle(0x21110e, 1).fillRoundedRect(42, 74, 916, 494, 34);
      g.fillStyle(0x140b09, 1).fillRoundedRect(55, 87, 890, 468, 29);
      g.lineStyle(2, 0xb98649, .58).strokeRoundedRect(44, 76, 912, 490, 32);
      g.lineStyle(1, 0xf1d29a, .18).strokeRoundedRect(58, 90, 884, 462, 26);

      // Asymmetric wall panels / bronze rails instead of wallpaper.
      g.fillStyle(0x5e281f, .22).fillRoundedRect(72, 118, 198, 378, 15);
      g.fillStyle(0x3a1a16, .16).fillRoundedRect(730, 128, 192, 350, 15);
      g.lineStyle(1, 0xc69655, .18).lineBetween(92, 158, 245, 120);
      g.lineStyle(1, 0xc69655, .12).lineBetween(756, 448, 904, 398);
      g.fillStyle(0xc99b54, .16).fillRect(76, 111, 848, 2);
      g.fillStyle(0x8f552e, .1).fillRect(106, 527, 788, 2);

      // Large ghosted casino typography inside the machine world.
      this.add.text(777, 444, 'QUIT', {
        fontFamily: displayFont, fontSize: '112px', fontStyle: '800', color: '#d9b47b',
      }).setOrigin(.5).setRotation(-.08).setAlpha(.035);
      this.add.text(148, 410, '7', {
        fontFamily: displayFont, fontSize: '148px', fontStyle: '800', color: '#c68254',
      }).setOrigin(.5).setRotation(.12).setAlpha(.035);

      // Focused light pools around the central play area.
      const haloA = this.add.ellipse(500, 298, 760, 340, 0xa75838, .045);
      const haloB = this.add.ellipse(500, 298, 610, 250, 0xd0a15d, .025);
      haloA.setBlendMode(P.BlendModes.ADD);
      haloB.setBlendMode(P.BlendModes.ADD);

      [104, 536].forEach((y, row) => {
        for (let x = 92, i = 0; x <= 908; x += 48, i++) {
          const bulb = this.add.circle(x, y, 4.1, 0xffd77c, .36);
          if (!options.reducedMotion) this.tweens.add({ targets: bulb, alpha: { from: .24, to: .9 }, duration: 880 + ((i + row) % 5) * 120, yoyo: true, repeat: -1, delay: i * 38 });
        }
      });
      for (let y = 150, i = 0; y <= 490; y += 48, i++) {
        [80, 920].forEach((x, side) => {
          const bulb = this.add.circle(x, y, 3.8, 0xffd77c, .3);
          if (!options.reducedMotion) this.tweens.add({ targets: bulb, alpha: { from: .2, to: .75 }, duration: 980 + i * 55, yoyo: true, repeat: -1, delay: side * 120 });
        });
      }

      this.add.text(92, 49, 'SPIN OUT', { fontFamily: displayFont, fontSize: '19px', fontStyle: '800', color: '#dfb86f', letterSpacing: 1.6 });
      this.add.text(908, 51, 'REALITY RUN', { fontFamily: uiFont, fontSize: '9px', fontStyle: '700', color: '#806b5a', letterSpacing: 1.8 }).setOrigin(1,0);
    }

    private createSlots() {
      const root = this.add.container(0, 0);
      this.slotRoot = root;

      const frame = this.add.graphics();
      frame.fillStyle(0x090605, .99).fillRoundedRect(88, 126, 824, 374, 16);
      frame.lineStyle(7, 0x5b321f, .95).strokeRoundedRect(88, 126, 824, 374, 16);
      frame.lineStyle(3, 0xc38d4b, .78).strokeRoundedRect(94, 132, 812, 362, 13);
      frame.lineStyle(1, 0xf0d49c, .24).strokeRoundedRect(102, 140, 796, 346, 10);
      frame.fillStyle(0x5c251e, .42).fillRoundedRect(106, 142, 788, 50, 8);
      frame.fillStyle(0x160d0b, .98).fillRoundedRect(106, 198, 788, 270, 7);
      frame.fillStyle(0xc69550, .18).fillRect(108, 197, 784, 2);
      frame.fillStyle(0xe4b96f, .11).fillRect(108, 466, 784, 2);
      root.add(frame);

      root.add(this.add.text(500, 151, 'FIVE REEL REALITY MACHINE', {
        fontFamily: displayFont, fontSize: '22px', fontStyle: '800', color: '#e8c384', letterSpacing: 2
      }).setOrigin(.5));
      root.add(this.add.text(500, 177, '5 REELS  ·  5 PAYLINES', {
        fontFamily: uiFont, fontSize: '9px', fontStyle: '700', color: '#8d735d', letterSpacing: 1.7
      }).setOrigin(.5));

      const grid = defaultSlotGrid();
      const { reelW, rowH, startX, startY, symbolSize } = SLOT_LAYOUT;
      for (let col = 0; col < 5; col++) {
        const centerX = startX + col * reelW + reelW / 2;
        root.add(this.add.rectangle(centerX + 3, startY + rowH * 1.5 + 7, reelW - 6, rowH * 3 + 10, 0x000000, .34));
        root.add(this.add.rectangle(centerX, startY + rowH * 1.5, reelW - 7, rowH * 3, 0xf0e3cf)
          .setStrokeStyle(2, 0x6e5946, .66));
        root.add(this.add.rectangle(centerX, startY + 15, reelW - 11, 28, 0xffffff, .11));
        if (col < 4) {
          root.add(this.add.rectangle(startX + (col + 1) * reelW - 3, startY + rowH * 1.5, 5, rowH * 3 + 10, 0x8a5a30, .8)
            .setStrokeStyle(1, 0xd4aa67, .4));
        }

        const maskShape = this.make.graphics({ x: 0, y: 0 });
        maskShape.fillStyle(0xffffff).fillRect(startX + col * reelW, startY, reelW - 7, rowH * 3);
        const mask = maskShape.createGeometryMask();
        this.reelMasks[col] = mask;
        const reel = this.add.container(startX + col * reelW, startY);
        reel.setMask(mask);
        root.add(reel);
        this.reelContainers[col] = reel;
        for (let row = 0; row < 3; row++) {
          const glow = this.add.circle(reelW/2, row*rowH + rowH/2, 39, 0xd7ad69, .035);
          const image = this.add.image(reelW / 2, row * rowH + rowH / 2, grid[row][col]).setDisplaySize(symbolSize, symbolSize);
          reel.add([glow,image]);
        }
      }

      const markers = this.add.graphics();
      markers.fillStyle(0xe0b968, .96).fillTriangle(115, 336, 135, 325, 135, 347).fillTriangle(885, 336, 865, 325, 865, 347);
      root.add(markers);
      root.add(this.add.rectangle(500, 336, 732, 2, 0xc78f4b, .22));
      root.add(this.add.text(500, 487, 'BRONZE FRAME  ·  ENAMEL SYMBOLS  ·  SIMULATED CREDIT', {
        fontFamily: uiFont, fontSize: '8px', fontStyle: '700', color: '#6e5b4d', letterSpacing: 1.4
      }).setOrigin(.5));
    }

    private createSports() {
      const root = this.add.container(0, 0);
      const panel = this.add.graphics();
      panel.fillStyle(0x0c1512, .995).fillRoundedRect(78, 116, 844, 386, 18);
      panel.lineStyle(3, 0x826c43, .78).strokeRoundedRect(78, 116, 844, 386, 18);
      panel.lineStyle(1, 0xc5a268, .18).strokeRoundedRect(88, 126, 824, 366, 14);
      panel.fillStyle(0x24312a, .58).fillRoundedRect(96, 136, 808, 48, 8);
      panel.fillStyle(0x111b17, .95).fillRoundedRect(96, 193, 808, 288, 8);
      root.add(panel);

      // Stadium crown / scoreboard lights.
      const crown = this.add.graphics();
      crown.lineStyle(2, 0x76623f, .4).arc(500, 117, 355, Math.PI, Math.PI * 2, false);
      crown.lineStyle(1, 0xd0ad69, .14).arc(500, 118, 334, Math.PI, Math.PI * 2, false);
      root.add(crown);
      for (let i=0;i<13;i++) {
        const x = 168 + i*55;
        const light = this.add.circle(x, 125 - Math.sin((i/12)*Math.PI)*34, 3.2, 0xe7c785, .36);
        root.add(light);
      }

      root.add(this.add.text(116, 148, 'LIVE BOARD', { fontFamily: displayFont, fontSize:'22px', fontStyle:'800', color:'#ead8b9', letterSpacing:1.4 }));
      root.add(this.add.text(874, 151, 'MONEYLINE', { fontFamily: uiFont, fontSize:'8px', fontStyle:'700', color:'#8ca095', letterSpacing:1.7 }).setOrigin(1,0));

      const games = [
        ['North Harbor','East Vale','1.72','2.16'],
        ['Cedar City','West Point','2.25','1.68'],
        ['Riverside','Kingsport','1.91','1.91'],
      ];
      games.forEach((row, i) => {
        const y = 207 + i * 88;
        const box = this.add.container(0,0);
        const bg = this.add.rectangle(500, y + 34, 774, 76, i === 1 ? 0x1f2c26 : 0x16221d, .98)
          .setStrokeStyle(1, i === 1 ? 0xaa864e : 0x4d6258, i === 1 ? .52 : .38);
        const accent = this.add.rectangle(122, y + 34, 3, 54, i === 1 ? 0xc38a49 : 0x5c766a, .76);
        box.add([bg,accent]);
        box.add(this.add.text(142, y + 8, row[0], { fontFamily:displayFont, fontSize:'22px', fontStyle:'700', color:'#f1e7d8' }));
        box.add(this.add.text(142, y + 42, row[1], { fontFamily:uiFont, fontSize:'13px', fontStyle:'600', color:'#aebbb3' }));
        box.add(this.add.text(666, y + 10, 'HOME', { fontFamily:uiFont, fontSize:'7px', fontStyle:'700', color:'#72887d', letterSpacing:1.2 }));
        box.add(this.add.text(666, y + 46, 'AWAY', { fontFamily:uiFont, fontSize:'7px', fontStyle:'700', color:'#72887d', letterSpacing:1.2 }));
        const homeOdd = this.add.text(842, y + 6, row[2], { fontFamily:displayFont, fontSize:'24px', fontStyle:'800', color:'#e2bd7c' }).setOrigin(.5,0);
        const awayOdd = this.add.text(842, y + 40, row[3], { fontFamily:displayFont, fontSize:'24px', fontStyle:'800', color:'#e2bd7c' }).setOrigin(.5,0);
        box.add([homeOdd, awayOdd]);
        root.add(box);
        this.sportsRows.push(box);
      });
      root.add(this.add.text(500, 474, 'SELECT A SIDE BELOW  ·  DISPLAYED ODDS SET THE SIMULATED RETURN', {
        fontFamily:uiFont, fontSize:'8px', fontStyle:'700', color:'#71867b', letterSpacing:1.15
      }).setOrigin(.5));
    }

    private createRoulette() {
      const root = this.add.container(0,0);
      const felt = this.add.graphics();
      felt.fillStyle(0x123027,.995).fillRoundedRect(78,116,844,386,18);
      felt.lineStyle(3,0x9e7440,.74).strokeRoundedRect(78,116,844,386,18);
      felt.lineStyle(1,0xe0c28d,.15).strokeRoundedRect(88,126,824,366,14);
      felt.fillStyle(0x0d241d,.68).fillRoundedRect(556,158,322,280,10);
      root.add(felt);

      // Faint table layout on the right, under the result typography.
      const table = this.add.graphics();
      table.lineStyle(1,0xd2b77e,.13);
      for(let c=0;c<4;c++) table.lineBetween(584+c*67,236,584+c*67,416);
      for(let rr=0;rr<4;rr++) table.lineBetween(584,236+rr*45,785,236+rr*45);
      table.lineStyle(2,0xd2b77e,.13).strokeRoundedRect(568,220,232,214,6);
      root.add(table);

      const wheel = this.add.container(317,319);
      this.wheel = wheel;
      root.add(wheel);
      wheel.add(this.add.circle(0,10,190,0x000000,.35));
      wheel.add(this.add.circle(0,0,184,0x14100f).setStrokeStyle(8,0x8f5c32,.92));
      wheel.add(this.add.circle(0,0,171,0xb18246).setStrokeStyle(2,0xe1c185,.52));
      wheel.add(this.add.circle(0,0,158,0x241915).setStrokeStyle(4,0x6e452a,.82));
      const step = Math.PI * 2 / ROULETTE_WHEEL.length;
      ROULETTE_WHEEL.forEach((number, i) => {
        const angle = i * step - Math.PI / 2;
        const color = number === 0 ? 0x17613b : RED_NUMBERS.has(number) ? 0x922b34 : 0x101010;
        const pocket = this.add.rectangle(Math.cos(angle)*143, Math.sin(angle)*143, 25, 14, color)
          .setStrokeStyle(1,0xe3c47e,.48)
          .setRotation(angle + Math.PI / 2);
        wheel.add(pocket);
        if (i % 3 === 0 || number === 0) {
          wheel.add(this.add.text(Math.cos(angle)*167, Math.sin(angle)*167, String(number), {
            fontFamily:uiFont, fontSize:'9px', fontStyle:'700', color:'#f7e8d2'
          }).setOrigin(.5));
        }
      });
      wheel.add(this.add.circle(0,0,104,0x6c4328).setStrokeStyle(3,0xc59b5b,.78));
      wheel.add(this.add.circle(0,0,76,0xc49b5c).setStrokeStyle(4,0xf0d39b,.84));
      wheel.add(this.add.circle(0,0,45,0x2b1a15));
      wheel.add(this.add.circle(0,0,16,0xb77e35));
      this.rouletteBall = this.add.circle(317,129,9,0xf8f2e9).setStrokeStyle(2,0x9b876b);
      root.add(this.rouletteBall);

      root.add(this.add.text(594,164,'EUROPEAN',{fontFamily:uiFont,fontSize:'8px',fontStyle:'700',color:'#84998e',letterSpacing:1.7}));
      root.add(this.add.text(594,183,'ROULETTE',{fontFamily:displayFont,fontSize:'42px',fontStyle:'800',color:'#ead3ab',letterSpacing:.4}));
      root.add(this.add.text(594,222,'37 pockets · single zero',{fontFamily:uiFont,fontSize:'11px',color:'#84978d'}));
      this.rouletteNumberText = this.add.text(704,326,'—',{fontFamily:displayFont,fontSize:'104px',fontStyle:'800',color:'#f5e2c2'}).setOrigin(.5);
      root.add(this.rouletteNumberText);
      root.add(this.add.text(704,392,'RESULT',{fontFamily:uiFont,fontSize:'8px',fontStyle:'700',color:'#83978d',letterSpacing:2}).setOrigin(.5));
      root.add(this.add.text(704,444,'RED / BLACK · 1:1',{fontFamily:uiFont,fontSize:'9px',fontStyle:'700',color:'#ae966f',letterSpacing:1.25}).setOrigin(.5));
    }

    private createPoker() {
      const root=this.add.container(0,0);
      const felt=this.add.graphics();
      felt.fillStyle(0x112d25,.995).fillRoundedRect(78,116,844,386,18);
      felt.lineStyle(3,0x9a713f,.72).strokeRoundedRect(78,116,844,386,18);
      felt.lineStyle(1,0xd8b97e,.15).strokeRoundedRect(88,126,824,366,14);
      felt.fillStyle(0x0d241e,.72).fillEllipse(500,410,760,320);
      felt.lineStyle(1,0xcaa468,.13).strokeEllipse(500,410,730,292);
      root.add(felt);

      root.add(this.add.text(500,143,'JACKS OR BETTER',{fontFamily:displayFont,fontSize:'34px',fontStyle:'800',color:'#ead0a3',letterSpacing:1.1}).setOrigin(.5));
      root.add(this.add.text(500,177,'9 / 6 FULL PAY  ·  HOLD ANY CARD BEFORE DRAW',{fontFamily:uiFont,fontSize:'8px',fontStyle:'700',color:'#82988d',letterSpacing:1.35}).setOrigin(.5));

      // Compact paytable rail.
      const pay = this.add.graphics();
      pay.fillStyle(0x0a1d18,.76).fillRoundedRect(164,199,672,34,5);
      pay.lineStyle(1,0xb88d4e,.15).strokeRoundedRect(164,199,672,34,5);
      root.add(pay);
      root.add(this.add.text(500,216,'JACKS+ 1  ·  TWO PAIR 2  ·  TRIPS 3  ·  STRAIGHT 4  ·  FLUSH 6  ·  FULL HOUSE 9',{
        fontFamily:uiFont,fontSize:'7px',fontStyle:'700',color:'#9b8c70',letterSpacing:.68
      }).setOrigin(.5));

      // Chip stacks create foreground material and depth.
      [182,842].forEach((x,side)=>{
        for(let i=0;i<4;i++) {
          root.add(this.add.ellipse(x,452-i*9,46,14,side===0?0x7d2d31:0x8a5b32,.96)
            .setStrokeStyle(2,0xc69a59,.52));
        }
      });

      for(let i=0;i<5;i++){
        const card=this.add.container(252+i*124,350);
        const shadow=this.add.rectangle(5,7,108,158,0x000000,.3).setRotation(i%2===0?-.01:.012);
        const bg=this.add.rectangle(0,0,108,158,0xf8f0e4).setStrokeStyle(4,0xb18a4c,.82);
        const inner=this.add.rectangle(0,0,94,144,0xffffff,0).setStrokeStyle(1,0x6f5944,.18);
        const t=this.add.text(0,-4,'?',{fontFamily:displayFont,fontSize:'42px',fontStyle:'800',color:'#211817'}).setOrigin(.5);
        const held=this.add.text(0,93,'',{fontFamily:uiFont,fontSize:'8px',fontStyle:'800',color:'#e6c98d',letterSpacing:1.25}).setOrigin(.5);
        card.add([shadow,bg,inner,t,held]);
        root.add(card);
        this.cards.push({card,text:t});
        this.pokerHeldLabels.push(held);
      }
      root.add(this.add.text(500,485,'DEAL  →  HOLD  →  DRAW',{fontFamily:uiFont,fontSize:'9px',fontStyle:'800',color:'#84998e',letterSpacing:1.75}).setOrigin(.5));
    }

    private createLottery() {
      const root=this.add.container(0,0);
      const shadow=this.add.rectangle(505,318,842,400,0x000000,.34).setRotation(-.012);
      root.add(shadow);

      const paper=this.add.graphics();
      paper.fillStyle(0xe9d7b7,.995).fillRoundedRect(86,116,828,390,12);
      paper.lineStyle(5,0xb78138,.82).strokeRoundedRect(86,116,828,390,12);
      paper.lineStyle(1,0xf9edcf,.55).strokeRoundedRect(99,129,802,364,8);
      paper.fillStyle(0x6d2c25,.96).fillRoundedRect(106,137,788,58,6);
      root.add(paper);

      // Ticket perforation / physical paper details.
      for(let x=112;x<=888;x+=34) root.add(this.add.circle(x,119,4,0x140c0b,.85));
      for(let x=112;x<=888;x+=34) root.add(this.add.circle(x,503,4,0x140c0b,.85));
      root.add(this.add.text(132,149,'SPIN OUT SCRATCH',{fontFamily:displayFont,fontSize:'26px',fontStyle:'800',color:'#f3dfbd',letterSpacing:1.1}));
      root.add(this.add.text(860,153,'MATCH 3',{fontFamily:displayFont,fontSize:'28px',fontStyle:'800',color:'#d8ac68'}).setOrigin(1,0));
      root.add(this.add.text(500,211,'REVEAL NINE PRIZE AMOUNTS',{fontFamily:uiFont,fontSize:'8px',fontStyle:'800',color:'#745b3c',letterSpacing:1.6}).setOrigin(.5));

      for(let i=0;i<9;i++){
        const x=308+(i%3)*192,y=277+Math.floor(i/3)*82;
        const back=this.add.rectangle(x+4,y+5,166,64,0x6a4a34,.22);
        const rect=this.add.rectangle(x,y,166,64,i%2===0?0x8d7153:0x775c45)
          .setStrokeStyle(2,0xc39b60,.9);
        const shine=this.add.rectangle(x,y-21,150,7,0xf4e3c0,.1);
        const text=this.add.text(x,y,'SCRATCH',{fontFamily:displayFont,fontSize:'17px',fontStyle:'800',color:'#ebd6b2',letterSpacing:1}).setOrigin(.5);
        root.add([back,rect,shine,text]);
        this.ticketCells.push({rect,text});
      }

      // Coin/scrape cue.
      root.add(this.add.circle(815,443,34,0xc69a55,.88).setStrokeStyle(4,0x76502a,.86));
      root.add(this.add.circle(815,443,25,0x9e7139,.76).setStrokeStyle(1,0xe6c27d,.5));
      root.add(this.add.text(815,443,'S',{fontFamily:displayFont,fontSize:'20px',fontStyle:'800',color:'#f0d59c'}).setOrigin(.5));
      root.add(this.add.text(500,480,'MATCH THREE IDENTICAL AMOUNTS',{fontFamily:uiFont,fontSize:'8px',fontStyle:'800',color:'#745b3c',letterSpacing:1.35}).setOrigin(.5));
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
      try {
        this.showResult(outcome);
      } catch {
        // Result presentation is decorative. It must never block run state,
        // Reality Pings, exits, or the intervention director.
        const label = outcome.netCents > 0 ? '+' + money(outcome.netCents) : outcome.netCents === 0 ? 'PUSH' : money(outcome.netCents);
        this.resultPlate?.setAlpha?.(0);
        this.outcomeGlow?.setAlpha?.(0);
        this.resultText?.setText?.(label)?.setColor?.(outcome.netCents > 0 ? '#f0d28f' : '#caa39b')?.setAlpha?.(1);
      }
    }

    private showResult(outcome: AnimatedOutcome) {
      let prefix = '';
      if (outcome.visual?.kind === 'slots') prefix = outcome.visual.paylinesWon ? `${outcome.visual.paylinesWon} LINE${outcome.visual.paylinesWon === 1 ? '' : 'S'} · ` : '';
      if (outcome.visual?.kind === 'roulette') prefix = `${outcome.visual.number} ${outcome.visual.color.toUpperCase()} · `;
      if (outcome.visual?.kind === 'sports') prefix = `${outcome.visual.winner} · `;
      if (outcome.visual?.kind === 'poker') prefix = `${outcome.visual.handName} · `;
      if (outcome.visual?.kind === 'scratch') prefix = outcome.visual.won ? 'MATCH 3 · ' : 'NO MATCH · ';

      const label = outcome.netCents > 0 ? '+' + money(outcome.netCents) : money(outcome.netCents);
      const result = prefix + (outcome.netCents === 0 ? 'PUSH' : label);
      const isWin = outcome.netCents > 0;
      const isBig = outcome.band === 'big-win';
      const isNear = outcome.nearMiss === true;
      const resultColor = isWin ? '#f0d28f' : outcome.netCents < 0 ? '#caa39b' : '#bfb4a5';
      const plateColor = isWin ? 0x25160d : outcome.netCents < 0 ? 0x1c0d0d : 0x13100d;
      const glowColor = isWin ? 0xd4aa67 : isNear ? 0xc47f4b : 0x7a2e2b;

      this.tweens.killTweensOf([this.resultText, this.resultPlate, this.outcomeGlow]);
      this.resultText.setText(result).setColor(resultColor).setAlpha(0).setScale(.94).setY(546);
      this.resultPlate.setFillStyle(plateColor, .92).setStrokeStyle(1, isWin ? 0xe1b66f : 0x9a6b4c, isWin ? .55 : .28).setAlpha(0);
      this.outcomeGlow.setFillStyle(glowColor, 1).setAlpha(0);

      const duration = options.reducedMotion ? 0 : 180;
      this.tweens.add({ targets:this.resultPlate, alpha:.92, duration });
      this.tweens.add({ targets:this.resultText, alpha:1, y:542, scale:1, duration, ease:'Back.Out' });

      if (!options.reducedMotion) {
        this.tweens.add({
          targets:this.outcomeGlow,
          alpha:{ from:0, to:isBig ? .19 : isWin ? .11 : isNear ? .065 : .028 },
          duration:isBig ? 220 : 150,
          yoyo:true,
          hold:isBig ? 90 : 0,
          ease:'Sine.easeOut',
        });
        if (isBig) {
          this.tweens.add({ targets:this.resultText, scale:{ from:1, to:1.055 }, duration:180, yoyo:true, ease:'Sine.easeInOut' });
        }
      }
    }

    private animateSlots(outcome: AnimatedOutcome) {
      const grid = outcome.visual?.kind === 'slots' ? outcome.visual.grid : defaultSlotGrid();
      const { reelW, rowH, startX, startY, symbolSize } = SLOT_LAYOUT;
      const finalize = () => {
        for (let col = 0; col < 5; col++) {
          const reel = this.reelContainers[col];
          if (!reel) continue;
          reel.y = startY;
          reel.removeAll(true);
          for (let row=0; row<3; row++) reel.add(this.add.image(reelW/2,row*rowH+rowH/2,grid[row][col]).setDisplaySize(symbolSize,symbolSize));
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
        sequence.forEach((symbol,i)=>reel.add(this.add.image(reelW/2,i*rowH+rowH/2,symbol).setDisplaySize(symbolSize,symbolSize)));
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
