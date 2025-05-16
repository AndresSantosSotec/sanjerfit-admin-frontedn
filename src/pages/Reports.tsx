
import React, { useState } from 'react';
import { Download, Calendar, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';

// Mock data for charts
const activityData = {
  months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  values: [245, 320, 410, 370, 500, 480],
};

const departmentData = [
  { name: "Recursos Humanos", active: 92, total: 110, percentage: 84 },
  { name: "Operaciones", active: 184, total: 250, percentage: 74 },
  { name: "Tecnología", active: 67, total: 80, percentage: 84 },
  { name: "Finanzas", active: 42, total: 60, percentage: 70 },
  { name: "Marketing", active: 28, total: 40, percentage: 70 },
  { name: "Ventas", active: 75, total: 95, percentage: 79 },
];

const Reports = () => {
  const { toast } = useToast();
  const [timeFrame, setTimeFrame] = useState("month");
  
  const handleDownload = (reportType: string) => {
    toast({
      title: "Descargando reporte",
      description: `El reporte de ${reportType} se está descargando`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Reportes y Estadísticas" 
        subtitle="Seguimiento del progreso y participación"
      />
      
      <div className="p-6 flex-1">
        <Tabs defaultValue="activity" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="activity" className="px-6">
                <Calendar className="h-4 w-4 mr-2" />
                Actividad
              </TabsTrigger>
              <TabsTrigger value="departments" className="px-6">
                <BarChart2 className="h-4 w-4 mr-2" />
                Departamentos
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-4">
              <Select 
                defaultValue={timeFrame} 
                onValueChange={setTimeFrame}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => handleDownload("actividad")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          <TabsContent value="activity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Participación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">
                    +5% desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">CoinFits Otorgados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,580</div>
                  <p className="text-xs text-muted-foreground">
                    +2,340 desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Premios Canjeados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">285</div>
                  <p className="text-xs text-muted-foreground">
                    +42 desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Actividad Mensual</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-end space-x-2 pt-4">
                  {activityData.values.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-sanjer-blue rounded-t-md transition-all duration-500"
                        style={{ 
                          height: `${(value / Math.max(...activityData.values)) * 80}%` 
                        }}
                      ></div>
                      <div className="mt-2 text-xs">{activityData.months[index]}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Colaboradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Colaborador</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Nivel</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Días Activo</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">CoinFits</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Premios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Ana Gutiérrez", level: "HalcónFit", days: 28, coins: 850, prizes: 2 },
                        { name: "Carlos Mendez", level: "JaguarFit", days: 25, coins: 720, prizes: 1 },
                        { name: "Mariana López", level: "JaguarFit", days: 24, coins: 690, prizes: 2 },
                        { name: "Roberto Sánchez", level: "HalcónFit", days: 23, coins: 650, prizes: 1 },
                        { name: "Juan Pérez", level: "KoalaFit", days: 20, coins: 520, prizes: 1 },
                      ].map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle">{item.name}</td>
                          <td className="p-4 align-middle">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.level === "HalcónFit"
                                  ? "bg-green-100 text-green-700"
                                  : item.level === "JaguarFit"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {item.level}
                            </span>
                          </td>
                          <td className="p-4 align-middle">{item.days}</td>
                          <td className="p-4 align-middle">{item.coins}</td>
                          <td className="p-4 align-middle">{item.prizes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Departamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Promedio Participación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mejor Departamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Recursos Humanos</div>
                  <p className="text-xs text-muted-foreground">
                    84% participación
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Participación por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left align-middle font-medium">Departamento</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Colaboradores Activos</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Total Colaboradores</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Participación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle">{dept.name}</td>
                          <td className="p-4 align-middle">{dept.active}</td>
                          <td className="p-4 align-middle">{dept.total}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center justify-end">
                              <div className="mr-2">{dept.percentage}%</div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
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
