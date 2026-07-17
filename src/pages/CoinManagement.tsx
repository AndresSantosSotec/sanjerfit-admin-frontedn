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
import { Search, ChevronLeft, ChevronRight, Coins, Calendar, History, ShieldAlert, RefreshCw } from 'lucide-react';

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

  // Filtros y Paginación para Saldos
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filtrado de la tabla de saldos
  const filteredCollabs = collaborators.filter(c => 
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredCollabs.length / itemsPerPage));
  const paginatedCollabs = filteredCollabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">
      <AdminHeader title="Monedas y Campañas" subtitle="Ajustes de CoinFits, deducciones por incidencias y temporadas de retos" />
      
      <div className="p-6 space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Card 1: Ajuste de Monedas */}
          <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">Ajuste de Monedas (Fitcoins)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={submitTransaction}>
                
                {/* Colaborador Autocomplete */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Seleccionar Colaborador:</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Escribe para buscar por nombre..."
                      value={collaborators.find(c => String(c.id) === colaboratorId)?.nombre && !coinSearchTerm ? collaborators.find(c => String(c.id) === colaboratorId)!.nombre : coinSearchTerm}
                      onChange={(e) => {
                        setCoinSearchTerm(e.target.value);
                        if (!e.target.value) setColaboratorId('');
                      }}
                      onFocus={() => setCoinDropdownOpen(true)}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl"
                    />
                    
                    {coinDropdownOpen && coinSearchTerm.length >= 1 && (
                      <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl z-20 max-h-48 overflow-y-auto">
                        {collaborators
                          .filter(c => c.nombre.toLowerCase().includes(coinSearchTerm.toLowerCase()))
                          .map(c => (
                            <div
                              key={c.id}
                              className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center justify-between transition-colors text-slate-800 dark:text-slate-200 text-sm"
                              onClick={() => {
                                setColaboratorId(String(c.id));
                                setCoinSearchTerm('');
                                setCoinDropdownOpen(false);
                              }}
                            >
                              <span className="font-semibold">{c.nombre}</span>
                              <span className="text-xs text-amber-500 font-bold">{c.coin_fits ?? 0} CF</span>
                            </div>
                          ))}
                        {collaborators.filter(c => c.nombre.toLowerCase().includes(coinSearchTerm.toLowerCase())).length === 0 && (
                          <div className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 text-center font-medium">
                            No se encontraron colaboradores
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {colaboratorId && !coinSearchTerm && (
                    <div className="flex items-center gap-1.5 mt-1 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 px-3 py-1.5 rounded-lg w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-sanjer-green"></span>
                      <p className="text-xs text-sanjer-green font-semibold">
                        Seleccionado: {collaborators.find(c => String(c.id) === colaboratorId)?.nombre} ({collaborators.find(c => String(c.id) === colaboratorId)?.coin_fits ?? 0} CF actuales)
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tipo de Movimiento:</label>
                    <Select value={type} onValueChange={(v) => setType(v as 'debit' | 'credit')}>
                      <SelectTrigger className="rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Deducción (-)</SelectItem>
                        <SelectItem value="credit">Crédito (+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Monto de CoinFits:</label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      required 
                      className="rounded-xl text-right font-extrabold text-amber-500"
                    />
                  </div>
                </div>

                {type === 'debit' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Motivo de la deducción:</label>
                    <Select value={reasonCode} onValueChange={setReasonCode}>
                      <SelectTrigger className="rounded-xl">
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

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Campaña / Temporada del movimiento:</label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger className="rounded-xl">
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

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Descripción / Observaciones:</label>
                  <Input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Detalles de la deducción, ej. Actividades repetidas el lunes" 
                    className="rounded-xl"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-sanjer-green hover:bg-sanjer-green/90 text-white rounded-xl">
                    Guardar Movimiento
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetAllPoints} 
                    className="border-red-200 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/20 dark:border-red-900/30 rounded-xl"
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Reiniciar Puntos Globales
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Nueva Campaña */}
          <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sanjer-blue" />
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">Nueva Campaña / Temporada</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={createCampaign}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre de la temporada:</label>
                  <Input 
                    value={campaignName} 
                    onChange={e => setCampaignName(e.target.value)} 
                    placeholder="Ej. Temporada Invierno 2026" 
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha de Inicio:</label>
                    <Input type="date" value={campaignStart} onChange={e => setCampaignStart(e.target.value)} required className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha de Fin (Opcional):</label>
                    <Input type="date" value={campaignEnd} onChange={e => setCampaignEnd(e.target.value)} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Estado de lanzamiento:</label>
                  <Select value={campaignActive} onValueChange={(v) => setCampaignActive(v as 'true' | 'false')}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Guardar como inactiva (Próximamente)</SelectItem>
                      <SelectItem value="true">Activar inmediatamente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-sanjer-blue hover:bg-sanjer-blue/90 text-white rounded-xl mt-2">
                  Crear e Inicializar Campaña
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

        {/* Card 3: Saldos Actuales (Con paginación y filtros) */}
        <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">Saldos Actuales de Colaboradores</CardTitle>
            </div>
            
            {/* Filtro de búsqueda */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar colaborador..."
                className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-sanjer-green" />
                Cargando información de saldos...
              </div>
            ) : paginatedCollabs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold">
                No se encontraron saldos de colaboradores.
              </div>
            ) : (
              <>
                <div className="relative w-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 text-slate-400 text-xs uppercase font-semibold">
                        <th className="h-12 px-6 text-left align-middle pl-8">Colaborador</th>
                        <th className="h-12 px-6 text-left align-middle">Saldo en CoinFits</th>
                        <th className="h-12 px-6 text-left align-middle">Temporada Vigente</th>
                        <th className="h-12 px-6 text-right align-middle pr-8">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCollabs.map(c => (
                        <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 px-6 align-middle font-medium text-slate-800 dark:text-slate-100 pl-8">{c.nombre}</td>
                          <td className="p-4 px-6 align-middle font-bold text-amber-500">{c.coin_fits ?? 0} CF</td>
                          <td className="p-4 px-6 align-middle text-slate-500 dark:text-slate-400">
                            {campaigns.find(x => x.is_active)?.name || 'Sin campaña activa'}
                          </td>
                          <td className="p-4 px-6 align-middle text-right pr-8">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setColaboratorId(String(c.id));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                toast({
                                  title: 'Colaborador seleccionado',
                                  description: `Se seleccionó a ${c.nombre} para ajuste de puntos.`,
                                });
                              }}
                              className="rounded-lg text-xs"
                            >
                              Seleccionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Controles de Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                      Mostrando {Math.min(filteredCollabs.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(filteredCollabs.length, currentPage * itemsPerPage)} de {filteredCollabs.length} colaboradores
                    </p>
                    
                    {/* Selector de cantidad por página */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Por pág:</span>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(v) => {
                          setItemsPerPage(Number(v));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-7 w-20 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Pág. {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="h-8 w-8 rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Temporadas/Campañas */}
        <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">Historial de Temporadas / Campañas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 text-slate-400 text-xs uppercase font-semibold">
                    <th className="h-12 px-6 text-left pl-8">Nombre de Temporada</th>
                    <th className="h-12 px-6 text-left">Fecha de Inicio</th>
                    <th className="h-12 px-6 text-left">Fecha de Fin</th>
                    <th className="h-12 px-6 text-center">Estado</th>
                    <th className="h-12 px-6 text-right pr-8">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 px-6 align-middle font-medium text-slate-800 dark:text-slate-100 pl-8">{c.name}</td>
                      <td className="p-4 px-6 align-middle text-slate-600 dark:text-slate-400">{c.start_date}</td>
                      <td className="p-4 px-6 align-middle text-slate-600 dark:text-slate-400">{c.end_date || 'En curso (Abierta)'}</td>
                      <td className="p-4 px-6 align-middle text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          c.is_active 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                        }`}>
                          {c.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="p-4 px-6 align-middle text-right pr-8">
                        <Button 
                          size="sm" 
                          variant="default" 
                          disabled={c.is_active} 
                          onClick={() => activateCampaign(c.id)}
                          className={`rounded-lg text-xs ${c.is_active ? 'bg-slate-100 text-slate-400' : 'bg-sanjer-blue hover:bg-sanjer-blue/90 text-white'}`}
                        >
                          Activar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CoinManagement;
