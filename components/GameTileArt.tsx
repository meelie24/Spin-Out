import Image from 'next/image';
import type { GamblingType } from '@/lib/types';

export function GameTileArt({ game, sizes = '(max-width: 700px) 92vw, (max-width: 1100px) 55vw, 42vw' }: { game: GamblingType; sizes?: string }) {
  return (
    <div className="tile-art tile-scene" data-game-art={game} aria-hidden="true">
      <Image
        src={`/game-art/${game}-scene.webp`}
        alt=""
        fill
        sizes={sizes}
      />
    </div>
  );
}
