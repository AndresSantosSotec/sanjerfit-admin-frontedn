import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart2, Award, Search, RefreshCw, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import api from '@/api/client';

interface CollaboratorStat {
  id: number;
  nombre: string;
  email: string;
  area: string;
  nivel_asignado: string;
  total_activities: number;
  total_duration: number;
  total_distance: number;
  coins_earned: number;
  photo_url: string | null;
}

interface RankingItem {
  id: number;
  nombre: string;
  photo_url: string | null;
  nivel_asignado: string;
  total_activities?: number;
  total_distance?: number;
  total_duration?: number;
}

interface RankingsData {
  activities_ranking: RankingItem[];
  distance_ranking: RankingItem[];
  duration_ranking: RankingItem[];
  type_rankings: Record<string, RankingItem[]>;
}

const Reports = () => {
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState("all");
  const [reportSearch, setReportSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rankingType, setRankingType] = useState<'activities' | 'distance' | 'duration' | 'caminar' | 'correr' | 'gimnasio' | 'ciclismo'>('activities');

  const [collaborators, setCollaborators] = useState<CollaboratorStat[]>([]);
  const [rankings, setRankings] = useState<RankingsData | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [collabsRes, rankingsRes] = await Promise.all([
        api.get(`/webadmin/stats/collaborators?timeframe=${timeFrame}&search=${reportSearch}`),
        api.get(`/webadmin/stats/rankings?timeframe=${timeFrame}`)
      ]);
      setCollaborators(collabsRes.data.data || []);
      setRankings(rankingsRes.data.data || null);
    } catch (err: any) {
      console.error("Error loading reports statistics:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de reportes y estadísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeFrame, reportSearch]);

  const handleDownload = () => {
    if (collaborators.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay información disponible para exportar.",
        variant: "destructive"
      });
      return;
    }

    const headers = ["Colaborador", "Email", "Área", "Nivel", "Actividades Válidas", "Duración Total (minutos)", "Distancia Total (km)", "CoinFits Ganados"];
    const rows = collaborators.map(c => [
      c.nombre,
      c.email,
      c.area,
      c.nivel_asignado,
      c.total_activities,
      c.total_duration,
      c.total_distance,
      c.coins_earned
    ]);

    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ];
    
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_actividades_${timeFrame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Reporte exportado",
      description: `Se ha descargado el reporte CSV para el periodo seleccionado.`,
    });
  };

  // Cálculos globales basados en la lista cargada
  const totalActivities = collaborators.reduce((acc, curr) => acc + curr.total_activities, 0);
  const totalDurationMin = collaborators.reduce((acc, curr) => acc + curr.total_duration, 0);
  const totalDistanceKm = collaborators.reduce((acc, curr) => acc + curr.total_distance, 0);
  const totalCoins = collaborators.reduce((acc, curr) => acc + curr.coins_earned, 0);

  // Obtener la lista del ranking seleccionada
  const getSelectedRankingList = (): RankingItem[] => {
    if (!rankings) return [];
    if (rankingType === 'activities') return rankings.activities_ranking;
    if (rankingType === 'distance') return rankings.distance_ranking;
    if (rankingType === 'duration') return rankings.duration_ranking;
    return rankings.type_rankings[rankingType] || [];
  };

  const getRankingValueSuffix = (item: RankingItem) => {
    if (rankingType === 'activities' || ['caminar', 'correr', 'gimnasio', 'ciclismo'].includes(rankingType)) {
      const val = item.total_activities ?? 0;
      return `${val} ${val === 1 ? 'actividad' : 'actividades'}`;
    }
    if (rankingType === 'distance') {
      return `${(item.total_distance ?? 0).toFixed(2)} km`;
    }
    if (rankingType === 'duration') {
      const hrs = Math.floor((item.total_duration ?? 0) / 60);
      const mins = (item.total_duration ?? 0) % 60;
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }
    return '';
  };

  // Departamentos (data estática para mantener consistencia)
  const departmentData = [
    { name: "Recursos Humanos", active: collaborators.filter(c => c.area.toLowerCase().includes('recursos') || c.area.toLowerCase().includes('rrhh')).length, percentage: 84 },
    { name: "Operaciones", active: collaborators.filter(c => c.area.toLowerCase().includes('operacion')).length, percentage: 74 },
    { name: "Tecnología", active: collaborators.filter(c => c.area.toLowerCase().includes('tecnolog') || c.area.toLowerCase().includes('sistemas')).length, percentage: 88 },
    { name: "Finanzas", active: collaborators.filter(c => c.area.toLowerCase().includes('finanz') || c.area.toLowerCase().includes('contabil')).length, percentage: 70 },
    { name: "Ventas / Créditos", active: collaborators.filter(c => c.area.toLowerCase().includes('ventas') || c.area.toLowerCase().includes('credito')).length, percentage: 79 },
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Reportes y Estadísticas" 
        subtitle="Seguimiento del progreso, participación y rankings de los colaboradores"
      />
      
      <div className="p-6 flex-1">
        <Tabs defaultValue="activity" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger value="activity" className="px-6 rounded-lg">
                <Calendar className="h-4 w-4 mr-2" />
                Estadísticas de Colaboradores
              </TabsTrigger>
              <TabsTrigger value="rankings" className="px-6 rounded-lg">
                <Award className="h-4 w-4 mr-2" />
                Tablas de Rankings
              </TabsTrigger>
              <TabsTrigger value="departments" className="px-6 rounded-lg">
                <BarChart2 className="h-4 w-4 mr-2" />
                Departamentos
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Buscar colaborador..."
                  className="pl-9 w-full sm:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <Select 
                value={timeFrame} 
                onValueChange={setTimeFrame}
              >
                <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                  <SelectItem value="all">Histórico</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={loadData} disabled={loading} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              <Button variant="default" onClick={handleDownload} className="bg-sanjer-green hover:bg-sanjer-green/90 text-white rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          {/* Ficha 1: Estadísticas de Colaboradores */}
          <TabsContent value="activity">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actividades Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-sanjer-blue dark:text-blue-400">{totalActivities}</div>
                  <p className="text-[10px] text-slate-400 mt-1">Actividades totales del periodo</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tiempo de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-sanjer-green dark:text-emerald-400">
                    {Math.round(totalDurationMin / 60)} hrs
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{totalDurationMin} minutos totales acumulados</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Distancia Acumulada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-blue-500 dark:text-sky-400">{totalDistanceKm.toFixed(1)} km</div>
                  <p className="text-[10px] text-slate-400 mt-1">Recorridos a través de caminata/trote</p>
                </CardContent>
              </Card>

              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">CoinFits Otorgados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{totalCoins} CF</div>
                  <p className="text-[10px] text-slate-400 mt-1">Puntos ganados por metas cumplidas</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="glass-card border-slate-100 dark:border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen Detallado de Participación</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 text-slate-400 text-xs uppercase font-semibold">
                        <th className="h-12 px-6 text-left align-middle">Colaborador</th>
                        <th className="h-12 px-6 text-left align-middle">Área</th>
                        <th className="h-12 px-6 text-center align-middle">Nivel</th>
                        <th className="h-12 px-6 text-center align-middle">Actividades</th>
                        <th className="h-12 px-6 text-center align-middle">Duración</th>
                        <th className="h-12 px-6 text-center align-middle">Distancia</th>
                        <th className="h-12 px-6 text-right align-middle pr-8">CoinFits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-sanjer-green" />
                            Cargando información...
                          </td>
                        </tr>
                      ) : collaborators.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                            No se encontraron registros de colaboradores para este periodo.
                          </td>
                        </tr>
                      ) : (
                        collaborators.map((item, i) => (
                          <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 px-6 align-middle font-medium text-slate-800 dark:text-slate-100">{item.nombre}</td>
                            <td className="p-4 px-6 align-middle text-slate-600 dark:text-slate-400">{item.area}</td>
                            <td className="p-4 px-6 align-middle text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                                  item.nivel_asignado === "HalcónFit"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                    : item.nivel_asignado === "JaguarFit"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                                }`}
                              >
                                {item.nivel_asignado}
                              </span>
                            </td>
                            <td className="p-4 px-6 align-middle text-center font-bold text-slate-700 dark:text-slate-300">{item.total_activities}</td>
                            <td className="p-4 px-6 align-middle text-center text-slate-600 dark:text-slate-400">
                              {item.total_duration >= 60 
                                ? `${Math.floor(item.total_duration/60)}h ${item.total_duration%60}m` 
                                : `${item.total_duration} m`
                              }
                            </td>
                            <td className="p-4 px-6 align-middle text-center text-slate-600 dark:text-slate-400">{item.total_distance.toFixed(1)} km</td>
                            <td className="p-4 px-6 align-middle text-right pr-8 font-extrabold text-amber-500">{item.coins_earned} CF</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ficha 2: Tablas de Rankings */}
          <TabsContent value="rankings">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Opciones de filtro de ranking */}
              <Card className="lg:col-span-1 glass-card border-slate-100 dark:border-slate-800 p-4 h-fit">
                <CardHeader className="p-2 pb-4">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtrar Ranking</CardTitle>
                </CardHeader>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant={rankingType === 'activities' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('activities')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Total Actividades
                  </Button>
                  <Button 
                    variant={rankingType === 'distance' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('distance')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Distancia Recorrida
                  </Button>
                  <Button 
                    variant={rankingType === 'duration' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('duration')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Tiempo de Actividad
                  </Button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <p className="text-[10px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-1">Por tipo de ejercicio</p>

                  <Button 
                    variant={rankingType === 'caminar' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('caminar')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    🚶 Caminata
                  </Button>
                  <Button 
                    variant={rankingType === 'correr' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('correr')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    🏃 Running
                  </Button>
                  <Button 
                    variant={rankingType === 'gimnasio' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('gimnasio')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    🏋️ Gimnasio
                  </Button>
                  <Button 
                    variant={rankingType === 'ciclismo' ? 'default' : 'ghost'} 
                    onClick={() => setRankingType('ciclismo')}
                    className="justify-start font-medium text-xs rounded-xl"
                  >
                    🚴 Ciclismo
                  </Button>
                </div>
              </Card>

              {/* Tabla de clasificación */}
              <Card className="lg:col-span-3 glass-card border-slate-100 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tabla de Posiciones - {
                      rankingType === 'activities' ? 'Total de Actividades' :
                      rankingType === 'distance' ? 'Distancia en Kilómetros' :
                      rankingType === 'duration' ? 'Tiempo de Actividad Física' :
                      rankingType.toUpperCase()
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 text-slate-400 text-xs font-semibold">
                          <th className="h-10 px-6 text-center align-middle w-16">Puesto</th>
                          <th className="h-10 px-6 text-left align-middle">Colaborador</th>
                          <th className="h-10 px-6 text-center align-middle">Nivel</th>
                          <th className="h-10 px-6 text-right align-middle pr-8">Total Acumulado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400">
                              Cargando ranking...
                            </td>
                          </tr>
                        ) : getSelectedRankingList().length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400">
                              Sin registros en este periodo para esta categoría.
                            </td>
                          </tr>
                        ) : (
                          getSelectedRankingList().map((item, index) => {
                            const rank = index + 1;
                            const isTop3 = rank <= 3;
                            
                            return (
                              <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                                <td className="p-4 px-6 text-center align-middle font-bold">
                                  {isTop3 ? (
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${
                                      rank === 1 ? 'bg-amber-400 font-extrabold shadow' :
                                      rank === 2 ? 'bg-slate-300 font-extrabold shadow' :
                                      'bg-amber-600 font-extrabold shadow'
                                    }`}>
                                      {rank}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">{rank}</span>
                                  )}
                                </td>
                                <td className="p-4 px-6 align-middle font-medium text-slate-800 dark:text-slate-100">{item.nombre}</td>
                                <td className="p-4 px-6 align-middle text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                      item.nivel_asignado === "HalcónFit"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : item.nivel_asignado === "JaguarFit"
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-purple-50 text-purple-700 border border-purple-200"
                                    }`}
                                  >
                                    {item.nivel_asignado}
                                  </span>
                                </td>
                                <td className="p-4 px-6 align-middle text-right pr-8 font-extrabold text-sanjer-blue dark:text-blue-400">
                                  {getRankingValueSuffix(item)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Ficha 3: Departamentos */}
          <TabsContent value="departments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Áreas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">5</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Colaboradores Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-sanjer-green dark:text-emerald-400">
                    {collaborators.filter(c => c.total_activities > 0).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card shadow-sm border-slate-100 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Área Líder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-extrabold text-amber-500">Tecnología</div>
                  <p className="text-[10px] text-slate-400 mt-1">88% de participación en retos</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="glass-card border-slate-100 dark:border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Participación por Departamento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 text-slate-400 text-xs font-semibold">
                        <th className="h-12 px-6 text-left align-middle">Departamento / Área</th>
                        <th className="h-12 px-6 text-center align-middle">Colaboradores Activos</th>
                        <th className="h-12 px-6 text-right align-middle pr-8">Participación Estimada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                          <td className="p-4 px-6 align-middle font-medium text-slate-800 dark:text-slate-100">{dept.name}</td>
                          <td className="p-4 px-6 align-middle text-center font-bold text-slate-700 dark:text-slate-300">{dept.active}</td>
                          <td className="p-4 px-6 align-middle text-right pr-8">
                            <div className="flex items-center justify-end">
                              <div className="mr-2 font-bold text-slate-700 dark:text-slate-300">{dept.percentage}%</div>
                              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div 
                                  className="h-full bg-sanjer-blue"
                                  style={{ width: `${dept.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
