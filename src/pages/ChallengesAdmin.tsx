import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Edit, Calendar, Coins, CheckCircle, XCircle } from 'lucide-react';
import api from '@/api/client';
import { toast } from 'sonner';

interface Challenge {
  id: number;
  title: string;
  description: string | null;
  badge_icon: string | null;
  reward_fitcoins: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  posts_count?: number;
}

export default function ChallengesAdmin() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge_icon: '🏆',
    reward_fitcoins: 50,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/webadmin/social/challenges');
      setChallenges(response.data.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Error al cargar la lista de retos.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData({
      title: '',
      description: '',
      badge_icon: '🏆',
      reward_fitcoins: 50,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description || '',
      badge_icon: challenge.badge_icon || '🏆',
      reward_fitcoins: challenge.reward_fitcoins,
      start_date: challenge.start_date || '',
      end_date: challenge.end_date || '',
      is_active: challenge.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChallenge) {
        await api.put(`/webadmin/social/challenges/${editingChallenge.id}`, formData);
        toast.success('Reto actualizado correctamente.');
      } else {
        await api.post('/webadmin/social/challenges', formData);
        toast.success('Nuevo reto creado exitosamente.');
      }
      setShowModal(false);
      fetchChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('No se pudo guardar el reto.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este reto?')) return;
    try {
      await api.delete(`/webadmin/social/challenges/${id}`);
      toast.success('Reto eliminado.');
      setChallenges(challenges.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('No se pudo eliminar el reto.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-500" /> Retos Comunitarios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crea y administra los retos deportivos y de bienestar para recompensar a los colaboradores con Fitcoins.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm"
        >
          <Plus className="h-5 w-5" /> Crear Nuevo Reto
        </button>
      </div>

      {/* Challenges List Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No hay retos creados todavía. ¡Crea el primero!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{c.badge_icon || '🏆'}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                      c.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {c.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                    {c.description}
                  </p>
                )}

                <div className="space-y-2 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      +{c.reward_fitcoins} Fitcoins de Recompensa
                    </span>
                  </div>
                  {c.start_date && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {c.start_date} {c.end_date ? `hasta ${c.end_date}` : ''}
                      </span>
                    </div>
                  )}
                  <div className="text-slate-400">
                    📹 {c.posts_count || 0} publicaciones vinculadas
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingChallenge ? 'Editar Reto' : 'Nuevo Reto Comunitario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Reto</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej. Reto 100 Lagartijas"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre cómo completar el reto..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ícono / Emoji</label>
                  <input
                    type="text"
                    value={formData.badge_icon}
                    onChange={(e) => setFormData({ ...formData, badge_icon: e.target.value })}
                    placeholder="🏆"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recompensa (Fitcoins)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reward_fitcoins}
                    onChange={(e) => setFormData({ ...formData, reward_fitcoins: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Reto Activo (Visible en App Móvil)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl"
                >
                  Guardar Reto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
