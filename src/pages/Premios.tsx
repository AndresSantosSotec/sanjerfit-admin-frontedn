import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import { Paginated, Premio } from '@/types/premio';
import PremioCard from '@/components/premios/PremioCard';
import PremioFormModal from '@/components/premios/PremioFormModal';
import { confirmAction, toastError, toastSuccess } from '@/utils/alerts';

type StatusFilter = 'todos' | 'activos' | 'inactivos';

export default function PremiosPage() {
  const [items, setItems] = useState<Premio[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [current, setCurrent] = useState<Premio | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Paginated<Premio>>('/webadmin/premios', { params: { page, limit, q: query || undefined } });
      let data = res.data.data;

      if (status !== 'todos') {
        data = data.filter(p => status === 'activos' ? p.is_active : !p.is_active);
      }

      if (query) {
        const q = query.toLowerCase();
        data = data.filter(p => p.nombre.toLowerCase().includes(q));
      }

      setItems(data);
      setMeta({ total: res.data.total, last_page: res.data.last_page });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Error cargando premios');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, query]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openCreate = () => { setCurrent(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (p: Premio) => { setCurrent(p); setModalMode('edit'); setModalOpen(true); };
  const openView = (p: Premio) => { setCurrent(p); setModalMode('view'); setModalOpen(true); };

  const createItem = async (payload: Partial<Premio>) => {
    setSubmitting(true);
    try {
      await api.post('/webadmin/premios', payload);
      toastSuccess('Premio creado');
      setModalOpen(false);
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message ?? 'Error al crear premio');
    } finally {
      setSubmitting(false);
    }
  };

  const updateItem = async (payload: Partial<Premio>) => {
    if (!current) return;
    setSubmitting(true);
    try {
      await api.put(`/webadmin/premios/${current.id}`, payload);
      toastSuccess('Premio actualizado');
      setModalOpen(false);
      setCurrent(null);
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message ?? 'Error al actualizar premio');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = async (p: Premio) => {
    const ok = await confirmAction(
      p.is_active ? '¿Desactivar premio?' : '¿Activar premio?',
      p.is_active ? 'No aparecerá como canjeable.' : 'Se mostrará como disponible si tiene stock.'
    );
    if (!ok) return;

    try {
      await api.patch(`/webadmin/premios/${p.id}/toggle`);
      toastSuccess('Estado actualizado');
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message ?? 'No se pudo actualizar el estado');
    }
  };

  const deleteItem = async (p: Premio) => {
    const ok = await confirmAction('¿Eliminar este premio?', 'Esta acción no se puede deshacer.', 'Sí, eliminar');
    if (!ok) return;

    try {
      await api.delete(`/webadmin/premios/${p.id}`);
      toastSuccess('Premio eliminado');
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message ?? 'No se pudo eliminar');
    }
  };

  const headerTitle = useMemo(() => 'Premios (cards)', []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{headerTitle}</h1>
          <p className="text-sm text-gray-500">Gestiona el catálogo de premios de CoosajerFIT.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-black text-white" onClick={openCreate}>+ Nuevo</button>
        </div>
      </header>

      <section className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex gap-2">
            <input
              placeholder="Buscar por nombre…"
              className="rounded-lg border px-3 py-2 w-72"
              value={query}
              onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
            />
            <select
              className="rounded-lg border px-3 py-2"
              value={status}
              onChange={(e)=>{ setStatus(e.target.value as StatusFilter); setPage(1); }}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ítems por pág:</span>
            <select
              className="rounded-lg border px-2 py-1"
              value={limit}
              onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading && <div className="text-center text-sm text-gray-600">Cargando…</div>}
        {error && !loading && <div className="text-center text-sm text-red-600">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-center text-sm text-gray-600">Sin resultados</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {items.map((p) => (
            <PremioCard
              key={p.id}
              premio={p}
              onEdit={openEdit}
              onToggle={toggleItem}
              onDelete={deleteItem}
              onView={openView}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{meta.total} registros • Página {page} de {meta.last_page}</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(page-1)}>
            Anterior
          </button>
          <button className="px-3 py-1.5 rounded-lg border disabled:opacity-50" disabled={page>=meta.last_page} onClick={()=>setPage(page+1)}>
            Siguiente
          </button>
        </div>
      </section>

      <PremioFormModal
        open={modalOpen}
        mode={modalMode}
        initial={current ?? undefined}
        submitting={submitting}
        onClose={() => { setModalOpen(false); setCurrent(null); }}
        onSubmit={modalMode === 'create' ? createItem : updateItem}
      />
    </div>
  );
}
