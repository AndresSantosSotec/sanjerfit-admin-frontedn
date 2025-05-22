import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Package, ArrowUpIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AdminHeader from '@/components/AdminHeader';
import ActivityTable from '@/components/ActivityTable';
import ActivityMiniList from '@/components/ActivityMiniList';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats();

  /* protección de ruta */
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) navigate('/login');
  }, [navigate]);

  if (loading || !stats) return <p className="p-6">Cargando…</p>;

  const totalLevels = Object.values(stats.level_distribution).reduce(
    (a, b) => a + b,
    0
  );
  const levelTop =
    Object.entries(stats.level_distribution).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'N/A';

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title="Dashboard"
        subtitle="Bienvenido al panel administrativo de SanjerFIT"
      />

      <div className="p-6 flex-1">
        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Colaboradores"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            value={stats.total_collaborators.toLocaleString()}
          />
          <StatCard
            title="CoinFits Otorgados"
            icon={<Award className="h-4 w-4 text-muted-foreground" />}
            value={stats.total_coinfits.toLocaleString()}
          />
          <StatCard
            title="Premios Canjeados"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            value={stats.redeemed_items.toLocaleString()}
          />
          <StatCard
            title="Nivel más común"
            icon={<ArrowUpIcon className="h-4 w-4 text-muted-foreground" />}
            value={levelTop}
          />
        </div>

        {/* distribución + actividad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Niveles</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-3">
                {Object.entries(stats.level_distribution).map(([lvl, qty]) => (
                  <div key={lvl}>
                    <p className="text-xs mb-1">
                      {lvl}: {qty}
                    </p>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div
                        className="bg-sanjer-green h-2 rounded"
                        style={{ width: `${(qty / totalLevels) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityMiniList list={stats.recent_activities} />
            </CardContent>
          </Card>
        </div>

        {/* tabla completa */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades (últimas páginas)</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* Card reutilizable */
const StatCard = ({
  title,
  icon,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  value: string | number;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;
