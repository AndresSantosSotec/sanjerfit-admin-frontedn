import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export interface BasicCollaborator {
  id: number;
  nombre: string;
}

export interface CollaboratorOption {
  id: number;
  name: string;
}

export function useCollaborators() {
  const [data, setData] = useState<CollaboratorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<BasicCollaborator[]>('/webadmin/colaborators')
      .then(res =>
        setData(res.data.map(c => ({ id: c.id, name: c.nombre })))
      )
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
