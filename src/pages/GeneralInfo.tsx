import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { GeneralInfo } from '@/types/general-info';

const GeneralInfoPage: React.FC = () => {
  const { toast } = useToast();
  const [infos, setInfos] = useState<GeneralInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<GeneralInfo | null>(null);
  const [form, setForm] = useState<{
    title: string;
    content: string;
    category: string;
    file: File | null;
    filePreview: string;
  }>({
    title: '',
    content: '',
    category: '',
    file: null,
    filePreview: '',
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
    setForm({ title: '', content: '', category: '', file: null, filePreview: '' });
    setShowDialog(true);
  };

  const openEdit = (info: GeneralInfo) => {
    setEditing(info);
    setForm({
      title: info.title,
      content: info.content,
      category: info.category || '',
      file: null,
      filePreview: info.image_path || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) return;

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    if (form.category) fd.append('category', form.category);
    if (form.file) fd.append('image_path', form.file);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, file, filePreview: URL.createObjectURL(file) });
  };

  const handleDelete = (id: number) => {
    api.delete(`/webadmin/info/${id}`).then(() => {
      setInfos(infos.filter((i) => i.id !== id));
      toast({ title: 'Registro eliminado' });
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Información General" subtitle="Mensajes para la app" />
      <div className="p-6 flex-1 space-y-6">
        <div className="flex justify-end">
          <Button className="bg-sanjer-green" onClick={openCreate}>
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
                    <th className="p-2">Imagen</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {infos.map((info) => (
                    <tr key={info.id} className="border-t">
                      <td className="p-2 font-medium">{info.title}</td>
                      <td className="p-2">{info.content}</td>
                      <td className="p-2">{info.category || '-'}</td>
                      <td className="p-2">
                        {info.image_path ? (
                          /(mp4|webm|ogg)$/i.test(info.image_path) ? (
                            <video
                              src={info.image_path}
                              className="w-16 h-10 object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={info.image_path}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Editar Información' : 'Nueva Información'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
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
              <div className="space-y-2">
                {form.filePreview && (
                  /(mp4|webm|ogg)$/i.test(form.filePreview) ? (
                    <video
                      src={form.filePreview}
                      className="w-full max-h-40 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={form.filePreview}
                      alt="preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )
                )}
                <Input type="file" accept="image/*,video/*" onChange={handleFileUpload} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button className="bg-sanjer-green" onClick={handleSubmit}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GeneralInfoPage;
