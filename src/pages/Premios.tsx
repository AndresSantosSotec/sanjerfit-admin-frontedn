import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import { Paginated, Premio } from '@/types/premio';
import PremioCard from '@/components/premios/PremioCard';
import PremioFormModal from '@/components/premios/PremioFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { notifyError, notifySuccess } from '@/utils/notifications';


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
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    action: (() => Promise<void>) | null;
  }>({ open: false, title: '', action: null });

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Paginated<Premio>>('/webadmin/premios', { params: { page, limit, search: query || undefined } });
      let data = res.data.data;

      if (status !== 'todos') {
        data = data.filter(p => status === 'activos' ? p.is_active : !p.is_active);
      }

      setItems(data);
      setMeta({ total: res.data.total, last_page: res.data.last_page });
    } catch (e: any) {

      const data = e?.response?.data;
      console.error('fetchList error', data);
      setError(data?.message ?? 'Error cargando premios');

    } finally {
      setLoading(false);
    }
  }, [page, limit, status, query]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openCreate = () => { setCurrent(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (p: Premio) => { setCurrent(p); setModalMode('edit'); setModalOpen(true); };
  const openView = (p: Premio) => { setCurrent(p); setModalMode('view'); setModalOpen(true); };


  const createItem = async (payload: FormData | Record<string, any>) => {
    setSubmitting(true);
    try {
      await api.post('/webadmin/premios', payload);

      notifySuccess('Premio creado');
      setModalOpen(false);
      await fetchList();
    } catch (e: any) {

      const data = e?.response?.data;
      console.error('422 DETAILS', data);
      const firstFieldError =
        data?.errors && (Object.values<string[]>(data.errors)[0]?.[0]);
      notifyError(firstFieldError || data?.message || 'Error al crear premio');

    } finally {
      setSubmitting(false);
    }
  };

  const updateItem = async (payload: FormData | Record<string, any>) => {
    if (!current) return;
    setSubmitting(true);
    try {

      await api.put(`/webadmin/premios/${current.id}`, payload);
      notifySuccess('Premio actualizado');
      setModalOpen(false);
      setCurrent(null);
      await fetchList();
    } catch (e: any) {

      const data = e?.response?.data;
      console.error('422 DETAILS', data);
      const firstFieldError =
        data?.errors && (Object.values<string[]>(data.errors)[0]?.[0]);
      notifyError(firstFieldError || data?.message || 'Error al actualizar premio');

    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = (p: Premio) => {
    setConfirm({
      open: true,
      title: p.is_active ? '¿Desactivar premio?' : '¿Activar premio?',
      description: p.is_active
        ? 'No aparecerá como canjeable.'
        : 'Se mostrará como disponible si tiene stock.',
      confirmText: p.is_active ? 'Desactivar' : 'Activar',
      action: async () => {
        try {
          await api.patch(`/webadmin/premios/${p.id}/toggle`);
          notifySuccess('Estado actualizado');
          await fetchList();
        } catch (e: any) {

          console.error('toggleItem error', e?.response?.data || e);

          notifyError(e?.response?.data?.message ?? 'No se pudo actualizar el estado');
        }
      },
    });
  };

  const deleteItem = (p: Premio) => {
    setConfirm({
      open: true,
      title: '¿Eliminar este premio?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      action: async () => {
        try {
          await api.delete(`/webadmin/premios/${p.id}`);
          notifySuccess('Premio eliminado');
          await fetchList();
        } catch (e: any) {

          console.error('deleteItem error', e?.response?.data || e);

          notifyError(e?.response?.data?.message ?? 'No se pudo eliminar');
        }
      },
    });
  };

  const headerTitle = useMemo(() => 'Catálogo de Premios', []);

  const handleConfirm = async () => {
    if (confirm.action) {
      await confirm.action();
    }
    setConfirm((c) => ({ ...c, open: false }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{headerTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona el catálogo de premios de CoosajerFIT.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-glow-green text-white font-semibold rounded-xl text-sm px-4 py-2 flex items-center gap-1.5 transition-all duration-200" onClick={openCreate}>
            + Nuevo Premio
          </button>
        </div>
      </header>

      <section className="glass-card shadow-sm rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Buscar por nombre…"
              className="rounded-xl border px-3 py-2 w-72 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sanjer-green/50 outline-none transition-all"
              value={query}
              onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
            />
            <select
              className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-sanjer-green/50 transition-all"
              value={status}
              onChange={(e)=>{ setStatus(e.target.value as StatusFilter); setPage(1); }}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Ítems por pág:</span>
            <select
              className="rounded-xl border px-2 py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-sanjer-green/50 transition-all"
              value={limit}
              onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading && <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">Cargando…</div>}
        {error && !loading && <div className="text-center text-sm text-red-650 dark:text-red-400 py-6">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">Sin resultados</div>
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

      <section className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
        <div className="text-sm text-slate-500 dark:text-slate-400">{meta.total} registros • Página {page} de {meta.last_page}</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200" disabled={page<=1} onClick={()=>setPage(page-1)}>
            Anterior
          </button>
          <button className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200" disabled={page>=meta.last_page} onClick={()=>setPage(page+1)}>
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
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmText={confirm.confirmText}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={handleConfirm}
      />
    </div>
  );

}
