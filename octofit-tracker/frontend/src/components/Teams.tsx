import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      status={loading ? 'loading' : 'ready'}
      error={error}
      emptyText={teams.length === 0 ? 'No teams available.' : undefined}
    >
      <ul>{teams.map((team, index) => <li key={index}>{team.name}</li>)}</ul>
    </CapabilityCard>
  );
}
