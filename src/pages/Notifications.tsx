import React, { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const Notifications: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('Recordatorio');
  const [body, setBody] = useState('¡No olvides hacer ejercicio hoy!');
  const [filter, setFilter] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    api
      .post('/webadmin/notifications/send', { title, body, filter })
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
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="koala">Equipo KoalaFit</option>
              </select>
            </div>
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
