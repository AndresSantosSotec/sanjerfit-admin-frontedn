import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface Stats {
  total_collaborators: number;
  total_coinfits: number;
  redeemed_items: number;
  level_distribution: Record<string, number>;
  recent_activities: {
    id: number;
    exercise_type: string;
    created_at: string;
    user: { id: number; name: string };
  }[];
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Stats>('/webadmin/stats')
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
};
