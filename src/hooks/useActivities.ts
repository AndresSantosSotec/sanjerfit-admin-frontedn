import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export interface Activity {
  id: number;
  user: { id: number; name: string };
  exercise_type: string;
  duration: number;
  duration_unit: string;
  calories: number;
  /** URL de selfie o evidencia */
  selfie_url?: string | null;
  /** Imagen del dispositivo (reloj, app, etc.) */
  device_image_url?: string | null;
  /** Archivos adjuntos */
  attachments_url?: string[] | null;
  /** Notas opcionales */
  notes?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  /** Estado de validación: 'pendiente', 'aprobada', 'rechazada' */
  status?: string;
  /** Marca si la actividad se considera válida */
  is_valid?: boolean;
  created_at: string;
}

interface Paginated<T> {
  data: T[];
  total: number;
}

export function useActivities(
  page = 1,
  userId?: number,
  search?: string
) {
  const [data, setData] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);

    const query = new URLSearchParams();
    query.set('page', String(page));
    if (userId) query.set('user_id', String(userId));
    if (search) query.set('search', search);

    const url = `/webadmin/activities?${query.toString()}`;

    api
      .get<Paginated<Activity>>(url)
      .then(res => {
        setData(res.data.data);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, userId, search]);

  return { data, total, loading, reload: fetchData };
}

