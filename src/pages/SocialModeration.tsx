import React, { useState, useEffect } from 'react';
import {
  Video, Eye, EyeOff, Trash2, Search, Filter, MessageSquare, Heart, RefreshCw, ShieldAlert
} from 'lucide-react';
import api from '@/api/client';
import { toast } from 'sonner';

interface Post {
  id: number;
  user_id: number;
  type: 'video' | 'image' | 'text';
  caption: string;
  media_url: string | null;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  status: 'active' | 'hidden';
  created_at: string;
  user?: {
    name: string;
    email: string;
    colaborator?: {
      nombre: string;
      area?: string;
    };
  };
  challenge?: {
    title: string;
  };
}

function normalizeMediaUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const apiBase = import.meta.env.VITE_API_URL as string;
    if (!apiBase) return url;

    const apiUrl = new URL(apiBase);
    if (url.startsWith('/')) {
      return `${apiUrl.protocol}//${apiUrl.host}${url}`;
    }

    const mediaUrl = new URL(url);
    const isLocalHost = mediaUrl.hostname === 'localhost' || mediaUrl.hostname === '127.0.0.1';
    if (isLocalHost) {
      mediaUrl.protocol = apiUrl.protocol;
      mediaUrl.hostname = apiUrl.hostname;
      mediaUrl.port = apiUrl.port;
      return mediaUrl.toString();
    }

    return url;
  } catch {
    return url;
  }
}

export default function SocialModeration() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPostMedia, setSelectedPostMedia] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = '/webadmin/social/posts?per_page=30';
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await api.get(url);
      const normalized = (response.data.data.data as Post[]).map((post) => ({
        ...post,
        media_url: normalizeMediaUrl(post.media_url),
        thumbnail_url: normalizeMediaUrl(post.thumbnail_url),
      }));
      setPosts(normalized);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      toast.error('Error al cargar publicaciones sociales.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === 'active' ? 'hidden' : 'active';
    try {
      await api.patch(`/webadmin/social/posts/${post.id}/status`, { status: newStatus });
      toast.success(`Publicación ${newStatus === 'hidden' ? 'ocultada' : 'activada'} correctamente.`);
      setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('No se pudo cambiar el estado de la publicación.');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar permanentemente esta publicación?')) return;
    try {
      await api.delete(`/webadmin/social/posts/${postId}`);
      toast.success('Publicación eliminada.');
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('No se pudo eliminar la publicación.');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!search) return true;
    const term = search.toLowerCase();
    const author = (post.user?.colaborator?.nombre || post.user?.name || '').toLowerCase();
    const caption = (post.caption || '').toLowerCase();
    return author.includes(term) || caption.includes(term);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-emerald-500" /> Moderación Social (Comunidad)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa, aprueba u oculta los clips de video, imágenes y comentarios subidos desde la App Móvil.
          </p>
        </div>
        <button
          onClick={fetchPosts}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="hidden">Ocultos</option>
          </select>
        </div>
      </div>

      {/* Grid of Posts */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No se encontraron publicaciones con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const authorName = post.user?.colaborator?.nombre || post.user?.name || 'Usuario';
            return (
              <div
                key={post.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all overflow-hidden shadow-sm flex flex-col ${
                  post.status === 'hidden'
                    ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50/20'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                {/* Media Box */}
                <div className="relative aspect-[9/16] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {post.type === 'video' && post.media_url ? (
                    <video
                      src={post.media_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : post.type === 'image' && post.media_url ? (
                    <img
                      src={post.media_url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center text-white font-medium text-lg">
                      "{post.caption}"
                    </div>
                  )}

                  {/* Challenge Badge Overlay */}
                  {post.challenge && (
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                      🏆 {post.challenge.title}
                    </span>
                  )}

                  {/* Type Badge */}
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-0.5 rounded-md uppercase font-bold">
                    {post.type}
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-white text-sm">
                        @{authorName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {post.caption && post.type !== 'text' && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  {/* Stats & Moderation Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> {post.comments_count}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title={post.status === 'active' ? 'Ocultar publicación' : 'Aprobar publicación'}
                        className={`p-2 rounded-lg transition-colors ${
                          post.status === 'active'
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                        }`}
                      >
                        {post.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Eliminar permanentemente"
                        className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
