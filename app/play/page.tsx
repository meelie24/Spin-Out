import { PlayExperience } from '@/components/PlayExperience';
import type { GamblingType } from '@/lib/types';

export const metadata = { title: 'Reality Run | Spin Out' };

const validGames = new Set<GamblingType>(['slots','sports','casino','poker','lottery','other']);

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawGame = Array.isArray(params.game) ? params.game[0] : params.game;
  const initialGame = rawGame && validGames.has(rawGame as GamblingType) ? rawGame as GamblingType : null;
  return <PlayExperience initialGame={initialGame} />;
}
