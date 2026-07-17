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

  const debouncedSearch = useDebounce(search.trim(), 300);

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
        <Loader2 className="h-6 w-6 animate-spin text-sanjer-green" />
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
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="space-y-1.5">
          <Label htmlFor="search" className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buscar</Label>
          <Input
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ejercicio, notas o usuario"
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sanjer-green/50 h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5 relative">
          <Label htmlFor="userSearch" className="text-xs text-slate-500 dark:text-slate-400 font-medium">Colaborador</Label>
          {selectedUser ? (
            <div className="flex items-center gap-1">
              <Input id="userSearch" value={selectedUser.name} disabled className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 h-9 text-sm" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9"
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
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sanjer-green/50 h-9 text-sm"
              />
              {userSearch && (
                <div className="absolute z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full mt-1 shadow-lg overflow-hidden">
                  {collaborators
                    .filter(c =>
                      c.name.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        className="px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-sm transition-colors"
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
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validez</Label>
          <Select value={validFilter} onValueChange={v => setValidFilter(v as 'all' | 'valid' | 'invalid')}>
            <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-9 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-md">
              <SelectItem value="all" className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700">Todas</SelectItem>
              <SelectItem value="valid" className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700">Válidas</SelectItem>
              <SelectItem value="invalid" className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700">Inválidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Ejercicio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Duración</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Kcal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Validez</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{a.user.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.exercise_type}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {a.duration} {a.duration_unit}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{a.calories}</td>
                <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs">
                  {new Date(a.created_at).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant={a.is_valid ? 'default' : 'destructive'}
                    className={a.is_valid
                      ? 'bg-sanjer-green/10 text-sanjer-green hover:bg-sanjer-green/20 border border-sanjer-green/20 shadow-none'
                      : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100/50 border border-red-200 dark:border-red-900/50 shadow-none'
                    }
                  >
                    {a.is_valid ? 'Válida' : 'Inválida'}
                  </Badge>
                </td>

                <td className="px-4 py-3 space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white border-none h-7 text-xs"
                    onClick={() => setSelected(a)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant={a.is_valid ? 'destructive' : 'default'}
                    className={a.is_valid
                      ? 'bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 hover:bg-red-100/80 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900 h-7 text-xs shadow-none'
                      : 'bg-sanjer-green/10 dark:bg-sanjer-green/20 text-sanjer-green dark:text-sanjer-green hover:bg-sanjer-green/20 border border-sanjer-green/20 h-7 text-xs shadow-none'
                    }
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

      {/* Paginador */}
      <div className="flex justify-between items-center gap-2 mt-5">
        <span className="text-xs text-slate-400 dark:text-slate-500">{total} registros totales</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 text-xs disabled:opacity-30"
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 text-xs disabled:opacity-30"
          >
            Siguiente
          </Button>
        </div>
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
