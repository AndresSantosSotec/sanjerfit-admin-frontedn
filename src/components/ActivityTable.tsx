import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useActivities, Activity } from '@/hooks/useActivities';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ActivityDetailModal from './ActivityDetailModal';

export default function ActivityTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [selected, setSelected] = useState<Activity | null>(null);
  const { toast } = useToast();

  const userId = userFilter ? parseInt(userFilter) : undefined;
  const { data, total, loading, saving, validateActivity } = useActivities(page, userId, search);

  useEffect(() => {
    setPage(1);
  }, [search, userFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-sanjer-blue" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 15);

  const handleValidate = async (id: number, ok: boolean) => {
    try {
      await validateActivity(id, ok);
      toast({
        title: ok ? 'Actividad validada' : 'Actividad rechazada',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la actividad',
        variant: 'destructive',
      });
    } finally {
      setSelected(null);
    }
  };

  return (
    <>
      {/* filtros */}
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="space-y-1">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ejercicio o notas"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="userId">Usuario ID</Label>
          <Input
            id="userId"
            type="number"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            placeholder="Todos"
          />
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b font-medium">
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Ejercicio</th>
              <th className="px-4 py-2 text-left">Duración</th>
              <th className="px-4 py-2 text-left">Kcal</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr key={a.id} className="border-b">
                <td className="px-4 py-2">{a.user.name}</td>
                <td className="px-4 py-2">{a.exercise_type}</td>
                <td className="px-4 py-2">
                  {a.duration} {a.duration_unit}
                </td>
                <td className="px-4 py-2">{a.calories}</td>
                <td className="px-4 py-2">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 capitalize">
                  {a.status ?? 'pendiente'}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelected(a)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleValidate(a.id, true)}
                    disabled={saving}
                  >
                    Validar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* paginador mejorado */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Siguiente
        </Button>
      </div>

      <ActivityDetailModal
        activity={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onValidate={handleValidate}
        saving={saving}
      />
    </>
  );
}
