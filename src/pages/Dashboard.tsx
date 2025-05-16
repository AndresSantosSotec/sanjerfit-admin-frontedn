
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, Users, Award, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminHeader from '@/components/AdminHeader';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Bienvenido al panel administrativo de SanjerFIT"
      />
      
      <div className="p-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">
                +180 desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CoinFits Otorgados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48,395</div>
              <p className="text-xs text-muted-foreground">
                +12% desde la semana pasada
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premios Canjeados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-muted-foreground">
                +8% desde la semana pasada
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nivel Promedio</CardTitle>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground">
                <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">JaguarFit</div>
              <div className="flex items-center pt-1">
                <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+15% HalcónFit</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Niveles</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-full flex items-end h-full pb-6 space-x-2">
                  <div className="flex-1 bg-sanjer-green h-[20%] rounded-t-md relative group">
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
                      HalcónFit: 20%
                    </div>
                  </div>
                  <div className="flex-1 bg-blue-500 h-[45%] rounded-t-md relative group">
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
                      JaguarFit: 45%
                    </div>
                  </div>
                  <div className="flex-1 bg-purple-500 h-[35%] rounded-t-md relative group">
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2">
                      KoalaFit: 35%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Carlos Mendez", action: "canjeó premio", item: "Audífonos Bluetooth", time: "Hace 10 minutos" },
                  { user: "Mariana López", action: "subió de nivel a", item: "JaguarFit", time: "Hace 1 hora" },
                  { user: "Roberto Sánchez", action: "registró actividad", item: "Running 5km", time: "Hace 2 horas" },
                  { user: "Ana Gutiérrez", action: "ganó reto", item: "Semana Activa", time: "Hace 1 día" },
                  { user: "Juan Pérez", action: "canjeó premio", item: "Gorra SanjerFit", time: "Hace 2 días" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-sanjer-blue flex items-center justify-center text-white mr-3">
                      {item.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span className="font-bold">{item.user}</span> {item.action} <span className="font-semibold">{item.item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Premios Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-medium">Premio</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Canjes</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">CoinFits</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Stock</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Audífonos Bluetooth", exchanges: 124, cost: 500, stock: 15, trend: "up" },
                    { name: "Gorra SanjerFit", exchanges: 98, cost: 200, stock: 42, trend: "up" },
                    { name: "Botella Deportiva", exchanges: 87, cost: 150, stock: 26, trend: "down" },
                    { name: "Chaqueta Deportiva", exchanges: 64, cost: 800, stock: 8, trend: "up" },
                    { name: "Vitaminas (30 días)", exchanges: 52, cost: 350, stock: 20, trend: "down" },
                  ].map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 align-middle">{item.name}</td>
                      <td className="p-4 align-middle">{item.exchanges}</td>
                      <td className="p-4 align-middle">{item.cost}</td>
                      <td className="p-4 align-middle">{item.stock}</td>
                      <td className="p-4 align-middle text-right">
                        {item.trend === "up" ? (
                          <span className="flex items-center justify-end text-green-500">
                            <ArrowUpIcon className="h-4 w-4 mr-1" /> +{Math.floor(Math.random() * 15) + 5}%
                          </span>
                        ) : (
                          <span className="flex items-center justify-end text-red-500">
                            <ArrowDownIcon className="h-4 w-4 mr-1" /> -{Math.floor(Math.random() * 10) + 2}%
                          </span>
                        )}
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

export default Dashboard;
