import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  level: string;
  area: string;
}

const Notifications: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('Recordatorio');
  const [body, setBody] = useState('¡No olvides hacer ejercicio hoy!');
  const [filter, setFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/webadmin/colaborators').then(r => {
      const mapped: User[] = (r.data || []).map((c: any) => ({
        id: c.id,
        name: c.nombre,
        email: c.user?.email || '',
        level: c.nivel_asignado || 'KoalaFit',
        area: c.area || 'Sin área',
      }));
      setUsers(mapped);
    });
  }, []);

  const handleSend = () => {
    setSending(true);
    const payload: any = { title, body, filter };
    if (filter === 'user' && selectedUser) {
      payload.user_id = selectedUser.id;
    }
    api
      .post('/webadmin/notifications/send', payload)
      .then(() => toast({ title: 'Notificaciones enviadas' }))
      .catch(() => toast({ title: 'Error al enviar', variant: 'destructive' }))
      .finally(() => setSending(false));
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Notificaciones" subtitle="Enviar a colaboradores" />
      <div className="p-4 sm:p-6 flex-1 space-y-6">
        <Card className="max-w-xl glass-card shadow-sm rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Enviar Notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-600 dark:text-slate-400 font-medium">Título</label>
              <Input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm text-slate-600 dark:text-slate-400 font-medium">Mensaje</label>
              <Textarea
                placeholder="Mensaje"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-slate-600 dark:text-slate-400 font-medium">Destinatarios</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-sanjer-green/50 transition-all"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setSelectedUser(null);
                  setSearchTerm('');
                }}
              >
                <option value="all">Todos</option>
                <option value="koala">Equipo KoalaFit</option>
                <option value="user">Usuario específico</option>
              </select>
            </div>

            {filter === 'user' && (
              <div className="space-y-1.5">
                <label className="block text-sm text-slate-600 dark:text-slate-400 font-medium">Buscar usuario</label>
                <div className="relative">
                  <Input
                    placeholder="Nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  {searchTerm.length >= 2 && (
                    <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl z-10 max-h-40 overflow-auto">
                      {users
                        .filter(u =>
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.area.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .length > 0 ? users
                        .filter(u =>
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.area.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(u => (
                          <div
                            key={u.id}
                            className="px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm transition-colors flex items-center justify-between"
                            onClick={() => {
                              setSelectedUser(u);
                              setSearchTerm('');
                            }}
                          >
                            <div>
                              <span className="font-medium">{u.name}</span>
                              <div className="text-xs text-slate-400 dark:text-slate-500">{u.email}</div>
                              <div className="text-xs text-slate-450 dark:text-slate-500">{u.level} • {u.area}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                            No se encontraron usuarios
                          </div>
                        )}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <p className="text-xs text-sanjer-green mt-1.5 font-medium">Seleccionado: {selectedUser.name}</p>
                )}
              </div>
            )}
            <div className="pt-2">
              <Button
                className="btn-glow-green text-white font-semibold rounded-xl text-sm"
                onClick={handleSend}
                disabled={sending}
              >
                Enviar Notificación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
