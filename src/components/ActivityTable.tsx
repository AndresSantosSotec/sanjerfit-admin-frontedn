import React, { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, X } from 'lucide-react';
import { useActivities, Activity } from '@/hooks/useActivities';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { api } from '@/services/api';
import ActivityDetailModal from './ActivityDetailModal';

export default function ActivityTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [userFilter, setUserFilter] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<
    { id: number; name: string } | null
  >(null);

  const [validFilter, setValidFilter] = useState<'all' | 'valid' | 'invalid'>('valid');
  const [selected, setSelected] = useState<Activity | null>(null);
  const { toast } = useToast();
  const { data: collaborators } = useCollaborators();

  const userId = userFilter ? parseInt(userFilter) : undefined;

  const isValidParam =
    validFilter === 'all' ? undefined : validFilter === 'valid';
  const { data, total, loading, reload } = useActivities(
    page,
    userId,
    debouncedSearch,
    isValidParam,
  );


  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, userFilter, validFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-sanjer-blue" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 15);

  const handleValidate = (id: number, ok: boolean) => {
    api
      .patch(`/webadmin/activities/${id}/validate`, { is_valid: ok })
      .then(() => {
        toast({
          title: ok ? 'Actividad validada' : 'Actividad invalidada',
        });
        reload();
      })
      .catch(() =>
        toast({ title: 'Error al actualizar', variant: 'destructive' })
      )
      .finally(() => setSelected(null));
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
            placeholder="Ejercicio, notas o usuario"
          />
        </div>
        <div className="space-y-1 relative">
          <Label htmlFor="userSearch">Colaborador</Label>
          {selectedUser ? (
            <div className="flex items-center gap-1">
              <Input id="userSearch" value={selectedUser.name} disabled />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setSelectedUser(null);
                  setUserFilter('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Input
                id="userSearch"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Todos"
              />
              {userSearch && (
                <div className="absolute z-10 bg-white border shadow w-full mt-1">
                  {collaborators
                    .filter(c =>
                      c.name.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedUser(c);
                          setUserFilter(String(c.id));
                          setUserSearch('');
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="space-y-1">
          <Label>Validez</Label>
          <Select value={validFilter} onValueChange={v => setValidFilter(v as 'all' | 'valid' | 'invalid')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="valid">Válidas</SelectItem>
              <SelectItem value="invalid">Inválidas</SelectItem>
            </SelectContent>
          </Select>
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
              <th className="px-4 py-2 text-left">Validez</th>
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

                <td className="px-4 py-2">
                  <Badge variant={a.is_valid ? 'default' : 'destructive'}>
                    {a.is_valid ? 'Válida' : 'Inválida'}
                  </Badge>
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
                    variant={a.is_valid ? 'destructive' : 'default'}

                    onClick={() => handleValidate(a.id, !a.is_valid)}
                  >
                    {a.is_valid ? 'Invalidar' : 'Validar'}
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
      />
    </>
  );
}
