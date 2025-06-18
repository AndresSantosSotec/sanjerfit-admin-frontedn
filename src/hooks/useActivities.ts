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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
  }, [page, userId, search]);

  const validateActivity = async (id: number, ok: boolean) => {
    setSaving(true);
    try {
      await api.patch(`/webadmin/activities/${id}`, {
        status: ok ? 'aprobada' : 'rechazada',
      });
      setData(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: ok ? 'aprobada' : 'rechazada' } : a,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return { data, total, loading, saving, validateActivity };
}

