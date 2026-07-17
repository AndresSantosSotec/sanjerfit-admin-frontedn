import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type CollaboratorRow = {
  id: number;
  nombre: string;
  coin_fits?: number;
};

type Campaign = {
  id: number;
  name: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
};

const REASON_OPTIONS = [
  { value: 'invalid_activity', label: 'Actividad inválida' },
  { value: 'repeated_activity', label: 'Actividad repetida' },
  { value: 'other_incident', label: 'Otra incidencia' },
  { value: 'manual_adjustment', label: 'Ajuste manual' },
] as const;

const CoinManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [colaboratorId, setColaboratorId] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [reasonCode, setReasonCode] = useState('invalid_activity');
  const [amount, setAmount] = useState('1');
  const [description, setDescription] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [coinSearchTerm, setCoinSearchTerm] = useState('');
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);

  const [campaignName, setCampaignName] = useState('');
  const [campaignStart, setCampaignStart] = useState('');
  const [campaignEnd, setCampaignEnd] = useState('');
  const [campaignActive, setCampaignActive] = useState<'true' | 'false'>('false');

  const loadData = async () => {
    setLoading(true);
    try {
      const [colRes, campRes] = await Promise.all([
        api.get<CollaboratorRow[]>('/webadmin/colaborators'),
        api.get<Campaign[]>('/webadmin/campaigns'),
      ]);
      setCollaborators(colRes.data);
      setCampaigns(campRes.data);

      const active = campRes.data.find(c => c.is_active);
      if (active) {
        setCampaignId(String(active.id));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar colaboradores/campañas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboratorId) {
      toast({ title: 'Selecciona un colaborador', description: 'Debes seleccionar un colaborador.', variant: 'destructive' });
      return;
    }

    try {
      await api.post(`/webadmin/fitcoin/accounts/${colaboratorId}/txns`, {
        type,
        amount: Number(amount),
        description: description || null,
        reason_code: type === 'debit' ? reasonCode : 'manual_adjustment',
        campaign_id: campaignId ? Number(campaignId) : null,
      });

      toast({ title: 'Transacción registrada', description: 'Se actualizó el saldo correctamente.' });
      setDescription('');
      setAmount('1');
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo registrar la transacción.',
        variant: 'destructive',
      });
    }
  };

  const resetAllPoints = async () => {
    const confirmed = window.confirm('Esto reiniciará a 0 los puntos de todos los colaboradores. ¿Deseas continuar?');
    if (!confirmed) return;

    try {
      await api.post('/webadmin/fitcoin/accounts/reset-all', {
        description: 'Reinicio masivo desde panel administrativo',
      });
      toast({ title: 'Puntos reiniciados', description: 'Todos los saldos quedaron en 0.' });
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo reiniciar los puntos.', variant: 'destructive' });
    }
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/webadmin/campaigns', {
        name: campaignName,
        start_date: campaignStart,
        end_date: campaignEnd || null,
        is_active: campaignActive === 'true',
      });

      toast({ title: 'Campaña creada', description: 'La campaña se guardó correctamente.' });
      setCampaignName('');
      setCampaignStart('');
      setCampaignEnd('');
      setCampaignActive('false');
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo crear la campaña.',
        variant: 'destructive',
      });
    }
  };

  const activateCampaign = async (id: number) => {
    try {
      await api.post(`/webadmin/campaigns/${id}/activate`);
      toast({ title: 'Campaña activa actualizada', description: 'Se activó la temporada seleccionada.' });
      await loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo activar la campaña.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Monedas y Campañas" subtitle="Deducciones, reinicios y temporadas" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Ajuste de Monedas</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitTransaction}>
                <div>
                  <label className="text-sm font-medium">Colaborador</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar colaborador por nombre..."
                      value={collaborators.find(c => String(c.id) === colaboratorId)?.nombre && !coinSearchTerm ? collaborators.find(c => String(c.id) === colaboratorId)!.nombre : coinSearchTerm}
                      onChange={(e) => {
                        setCoinSearchTerm(e.target.value);
                        if (!e.target.value) setColaboratorId('');
                      }}
                      onFocus={() => setCoinDropdownOpen(true)}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    {coinDropdownOpen && coinSearchTerm.length >= 1 && (
                      <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl z-10 max-h-48 overflow-y-auto">
                        {collaborators
                          .filter(c => c.nombre.toLowerCase().includes(coinSearchTerm.toLowerCase()))
                          .map(c => (
                            <div
                              key={c.id}
                              className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between transition-colors text-slate-800 dark:text-slate-200 text-sm"
                              onClick={() => {
                                setColaboratorId(String(c.id));
                                setCoinSearchTerm('');
                                setCoinDropdownOpen(false);
                              }}
                            >
                              <span className="font-medium">{c.nombre}</span>
                              <span className="text-xs text-sanjer-green font-semibold">{c.coin_fits ?? 0} CF</span>
                            </div>
                          ))}
                        {collaborators.filter(c => c.nombre.toLowerCase().includes(coinSearchTerm.toLowerCase())).length === 0 && (
                          <div className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                            No se encontraron colaboradores
                          </div>
                        )}
                      </div>
                    )}
                    {colaboratorId && !coinSearchTerm && (
                      <p className="text-xs text-sanjer-green mt-1 font-medium">
                        Seleccionado: {collaborators.find(c => String(c.id) === colaboratorId)?.nombre}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={type} onValueChange={(v) => setType(v as 'debit' | 'credit')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Deducción</SelectItem>
                        <SelectItem value="credit">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monto</label>
                    <Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />
                  </div>
                </div>

                {type === 'debit' && (
                  <div>
                    <label className="text-sm font-medium">Motivo de deducción</label>
                    <Select value={reasonCode} onValueChange={setReasonCode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REASON_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Campaña/Temporada</label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Campaña activa o sin campaña" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}{c.is_active ? ' (activa)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles de la incidencia o ajuste" />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-sanjer-green hover:bg-green-600">Guardar movimiento</Button>
                  <Button type="button" variant="destructive" onClick={resetAllPoints}>Reiniciar puntos globales</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>Nueva Campaña</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={createCampaign}>
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Temporada Julio 2026" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Inicio</label>
                    <Input type="date" value={campaignStart} onChange={e => setCampaignStart(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fin</label>
                    <Input type="date" value={campaignEnd} onChange={e => setCampaignEnd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={campaignActive} onValueChange={(v) => setCampaignActive(v as 'true' | 'false')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Guardar como inactiva</SelectItem>
                      <SelectItem value="true">Guardar como activa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="bg-sanjer-blue hover:bg-blue-600">Crear campaña</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Saldos Actuales</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>CoinFits</TableHead>
                    <TableHead>Campaña activa</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborators.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.coin_fits ?? 0}</TableCell>
                      <TableCell>{campaigns.find(x => x.is_active)?.name || 'Sin campaña activa'}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setColaboratorId(String(c.id))}>
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Temporadas/Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.start_date}</TableCell>
                    <TableCell>{c.end_date || 'Abierta'}</TableCell>
                    <TableCell>{c.is_active ? 'Activa' : 'Inactiva'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={c.is_active} onClick={() => activateCampaign(c.id)}>
                        Activar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoinManagement;
