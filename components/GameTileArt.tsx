import Image from 'next/image';
import type { GamblingType } from '@/lib/types';

export function GameTileArt({ game }: { game: GamblingType }) {
  if (game === 'slots') {
    return (
      <div className="tile-art tile-art-slots" data-game-art="slots" aria-hidden="true">
        <div className="slots-arch"><span>SPIN OUT</span><i /></div>
        <div className="slots-cabinet">
          <div className="slots-reels">
            <span><Image src="/symbols/seven.svg" alt="" width={132} height={132} /></span>
            <span><Image src="/symbols/cherry.svg" alt="" width={132} height={132} /></span>
            <span><Image src="/symbols/bar.svg" alt="" width={132} height={132} /></span>
          </div>
          <div className="slots-tray"><i /><i /><i /></div>
        </div>
        <Image className="art-float art-coin-one" src="/symbols/cash-coin.svg" alt="" width={108} height={108} />
        <Image className="art-float art-coin-two" src="/symbols/cash-coin.svg" alt="" width={76} height={76} />
      </div>
    );
  }

  if (game === 'sports') {
    return (
      <div className="tile-art tile-art-sports" data-game-art="sports" aria-hidden="true">
        <div className="stadium-rim"><i /><i /><i /><i /><i /></div>
        <div className="odds-board"><span>+145</span><span>-110</span><span>2.5</span></div>
        <Image className="sports-slip" src="/symbols/sports-ticket.svg" alt="" width={210} height={210} />
        <Image className="sports-coin" src="/symbols/cash-coin.svg" alt="" width={94} height={94} />
        <div className="sports-field"><i /><b /></div>
      </div>
    );
  }

  if (game === 'casino') {
    return (
      <div className="tile-art tile-art-roulette" data-game-art="casino" aria-hidden="true">
        <div className="roulette-felt"><span>17</span><span>22</span><span>29</span></div>
        <Image className="roulette-wheel-art" src="/symbols/roulette.svg" alt="" width={260} height={260} />
        <span className="roulette-ball" />
        <Image className="roulette-chip roulette-chip-one" src="/symbols/cash-coin.svg" alt="" width={84} height={84} />
        <Image className="roulette-chip roulette-chip-two" src="/symbols/gem.svg" alt="" width={72} height={72} />
      </div>
    );
  }

  if (game === 'poker') {
    return (
      <div className="tile-art tile-art-poker" data-game-art="poker" aria-hidden="true">
        <div className="poker-felt-line" />
        <Image className="poker-cards-art" src="/symbols/cards.svg" alt="" width={250} height={250} />
        <div className="chip-stack chip-stack-a"><i /><i /><i /><i /></div>
        <div className="chip-stack chip-stack-b"><i /><i /><i /></div>
        <span className="poker-suit poker-heart">♥</span>
        <span className="poker-suit poker-spade">♠</span>
      </div>
    );
  }

  if (game === 'lottery') {
    return (
      <div className="tile-art tile-art-scratch" data-game-art="lottery" aria-hidden="true">
        <div className="scratch-shadow" />
        <Image className="scratch-ticket-art" src="/symbols/scratch-ticket.svg" alt="" width={240} height={240} />
        <Image className="scratch-coin" src="/symbols/cash-coin.svg" alt="" width={104} height={104} />
        <span className="foil-patch foil-one" />
        <span className="foil-patch foil-two" />
        <span className="foil-patch foil-three" />
      </div>
    );
  }

  return (
    <div className="tile-art tile-art-other" data-game-art="other" aria-hidden="true">
      <div className="other-lattice"><i /><i /><i /><i /></div>
      <Image className="fortune-plaque" src="/symbols/fu.svg" alt="" width={220} height={220} />
      <Image className="fortune-sycee" src="/symbols/sycee.svg" alt="" width={130} height={130} />
      <Image className="fortune-coin" src="/symbols/cash-coin.svg" alt="" width={92} height={92} />
      <span className="lantern-line lantern-line-a" />
      <span className="lantern-line lantern-line-b" />
    </div>
  );
}
