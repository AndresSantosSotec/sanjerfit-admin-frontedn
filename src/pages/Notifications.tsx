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
    api.get('/webadmin/users').then(r => setUsers(r.data));
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
      <div className="p-6 flex-1 space-y-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Enviar Notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Mensaje"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div>
              <label className="block text-sm mb-1">Destinatarios</label>
              <select
                className="w-full border rounded p-2 text-sm"
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
              <div>
                <label className="block text-sm mb-1">Buscar usuario</label>
                <div className="relative">
                  <Input
                    placeholder="Nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {searchTerm && (
                    <div className="absolute w-full mt-1 bg-white shadow-lg rounded-md border z-10 max-h-40 overflow-auto">
                      {users
                        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(u => (
                          <div
                            key={u.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(u);
                              setSearchTerm('');
                            }}
                          >
                            {u.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <p className="text-sm text-gray-600 mt-1">Seleccionado: {selectedUser.name}</p>
                )}
              </div>
            )}
            <Button
              className="bg-sanjer-green"
              onClick={handleSend}
              disabled={sending}
            >
              Enviar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
