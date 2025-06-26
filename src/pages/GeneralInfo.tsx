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
  const [form, setForm] = useState({ title: '', content: '', category: '' });

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
    setForm({ title: '', content: '', category: '' });
    setShowDialog(true);
  };

  const openEdit = (info: GeneralInfo) => {
    setEditing(info);
    setForm({
      title: info.title,
      content: info.content,
      category: info.category || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) return;
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category || null,
    };
    const req = editing
      ? api.put<GeneralInfo>(`/webadmin/info/${editing.id}`, payload)
      : api.post<GeneralInfo>('/webadmin/info', payload);
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
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {infos.map((info) => (
                    <tr key={info.id} className="border-t">
                      <td className="p-2 font-medium">{info.title}</td>
                      <td className="p-2">{info.content}</td>
                      <td className="p-2">{info.category || '-'}</td>
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
