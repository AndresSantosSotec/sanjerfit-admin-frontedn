import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export interface Activity {
  id: number;
  user: { id: number; name: string };
  exercise_type: string;
  duration: number;
  duration_unit: string;
  calories: number;
  created_at: string;
}

interface Paginated<T> {
  data: T[];
  total: number;
}

export function useActivities(page = 1, userId?: number) {
  const [data, setData]   = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const url = userId
      ? `/webadmin/users/${userId}/activities?page=${page}`
      : `/webadmin/activities?page=${page}`;

    api.get<Paginated<Activity>>(url)
       .then(res => {
         setData(res.data.data);
         setTotal(res.data.total);
       })
       .finally(() => setLoading(false));
  }, [page, userId]);

  return { data, total, loading, page, setPage: (p: number) => setPageState(p) };
}
function setPageState(p: number) {
    throw new Error('Function not implemented.');
}

