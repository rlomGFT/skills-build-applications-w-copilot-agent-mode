import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => setRankings(data.leaderboard))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      status={loading ? 'loading' : 'ready'}
      error={error}
      emptyText={rankings.length === 0 ? 'No leaderboard rankings available.' : undefined}
    >
      <ol>{rankings.map((ranking) => <li key={ranking.rank}>{ranking.teamName}: {ranking.totalPoints}</li>)}</ol>
    </CapabilityCard>
  );
}
