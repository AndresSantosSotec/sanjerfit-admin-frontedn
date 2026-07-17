import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { GeneralInfo } from '@/types/general-info';
import GeneralInfoDetailModal from '@/components/GeneralInfoDetailModal';

const GeneralInfoPage: React.FC = () => {
  const { toast } = useToast();
  const [infos, setInfos] = useState<GeneralInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<GeneralInfo | null>(null);
  const [detail, setDetail] = useState<GeneralInfo | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [infoSearch, setInfoSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState<{
    title: string;
    content: string;
    category: string;
    imageFile: File | null;
    imagePreview: string;
    videoFile: File | null;
    videoPreview: string;
  }>({
    title: '',
    content: '',
    category: '',
    imageFile: null,
    imagePreview: '',
    videoFile: null,
    videoPreview: '',
  });

  const fetchInfo = () => {
    setLoading(true);
    api
      .get<GeneralInfo[]>('/webadmin/info')
      .then((r) => setInfos(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      content: '',
      category: '',
      imageFile: null,
      imagePreview: '',
      videoFile: null,
      videoPreview: '',
    });
    setShowDialog(true);
  };

  const openDetail = (info: GeneralInfo) => {
    setDetail(info);
    setShowDetail(true);
  };

  const openEdit = (info: GeneralInfo) => {
    setEditing(info);
    setForm({
      title: info.title,
      content: info.content,
      category: info.category || '',
      imageFile: null,
      imagePreview: info.image_url || '',
      videoFile: null,
      videoPreview: info.video_url || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) return;

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    if (form.category) fd.append('category', form.category);
    if (form.imageFile) fd.append('image', form.imageFile);
    if (form.videoFile) fd.append('video', form.videoFile);

    let req: Promise<any>;
    if (editing) {
      fd.append('_method', 'PUT');
      req = api.post(`/webadmin/info/${editing.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      req = api.post('/webadmin/info', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    req.then((r) => {
      if (editing) {
        setInfos(infos.map((i) => (i.id === editing.id ? r.data : i)));
        toast({ title: 'Información actualizada' });
      } else {
        setInfos([r.data, ...infos]);
        toast({ title: 'Información creada' });
      }
      setShowDialog(false);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, imageFile: file, imagePreview: URL.createObjectURL(file) });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, videoFile: file, videoPreview: URL.createObjectURL(file) });
  };

  const handleDelete = (id: number) => {
    api.delete(`/webadmin/info/${id}`).then(() => {
      setInfos(infos.filter((i) => i.id !== id));
      toast({ title: 'Registro eliminado' });
    });
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(infos.map(i => i.category).filter(Boolean) as string[])).sort();
  }, [infos]);

  const filteredInfos = useMemo(() => {
    return infos.filter(info => {
      const q = infoSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        info.title.toLowerCase().includes(q) ||
        info.content.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || info.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [infos, infoSearch, categoryFilter]);

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Información General" subtitle="Mensajes para la app" />
      <div className="p-6 flex-1 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Buscar por título o contenido..."
              value={infoSearch}
              onChange={(e) => setInfoSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          {uniqueCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-sanjer-green/50 transition-all text-sm"
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          <Button className="bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Añadir
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Título</th>
                    <th className="p-2">Contenido</th>
                    <th className="p-2">Categoría</th>
                    <th className="p-2">Multimedia</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInfos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : filteredInfos.map((info) => (
                    <tr key={info.id} className="border-t">
                      <td className="p-2 font-medium">{info.title}</td>
                      <td className="p-2">{info.content}</td>
                      <td className="p-2">{info.category || '-'}</td>
                      <td className="p-2">
                        {info.image_url || info.video_url ? (
                          info.video_url ? (
                            <video
                              src={info.video_url}
                              className="w-16 h-10 object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={info.image_url!}
                              alt="recurso"
                              className="w-12 h-12 object-cover"
                            />
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-2 space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openDetail(info)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openEdit(info)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(info.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl p-0">
            <div className="flex flex-col max-h-[90vh]">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>
                  {editing ? 'Editar Información' : 'Nueva Información'}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <Input
                  placeholder="Título"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Textarea
                  placeholder="Contenido"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <Input
                  placeholder="Categoría (opcional)"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <div className="space-y-4">
                  {form.imagePreview && (
                    <img
                      src={form.imagePreview}
                      alt="preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  {form.videoPreview && (
                    <video
                      src={form.videoPreview}
                      className="w-full max-h-40 object-cover"
                      controls
                    />
                  )}
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="px-6 pb-6 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button className="bg-sanjer-green" onClick={handleSubmit}>
                  Guardar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <GeneralInfoDetailModal
          open={showDetail}
          info={detail}
          onClose={() => setShowDetail(false)}
        />
      </div>
    </div>
  );
};

export default GeneralInfoPage;
