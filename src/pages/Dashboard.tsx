import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Package, TrendingUp, Heart } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import ActivityTable from '@/components/ActivityTable';
import ActivityMiniList from '@/components/ActivityMiniList';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  PageTransition,
  StaggerList,
  StaggerItem,
  ScaleHover,
  AnimatedNumber,
  AnimatedBar,
  FadeUp,
} from '@/components/ui/animated';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading } = useDashboardStats();

  /* protección de ruta */
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) navigate('/login');
  }, [navigate]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sanjer-green" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const totalLevels = Object.values(stats.age_distribution || {}).reduce(
    (a, b) => a + b,
    0
  );
  const topAgeGroup =
    Object.entries(stats.age_distribution || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'N/A';

  const statCards = [
    {
      title: "Total Colaboradores",
      value: stats.total_collaborators,
      icon: <Users className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      title: "CoinFits Otorgados",
      value: stats.total_coinfits,
      icon: <Award className="h-5 w-5" />,
      color: "blue" as const,
    },
    {
      title: "Premios Canjeados",
      value: stats.redeemed_items,
      icon: <Package className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      title: "Temporada Activa",
      value: stats.active_campaign?.name ?? topAgeGroup,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "blue" as const,
    },
  ];

  return (
    <PageTransition className="flex flex-col min-h-full">
      <AdminHeader />

      <div className="p-4 sm:p-6 flex-1 space-y-6">

        {/* Stat cards — stagger animation */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StaggerItem key={card.title}>
              <StatCard {...card} />
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Medical annual tracking */}
        <FadeUp delay={0.25}>
          <div className="glass-card shadow-sm rounded-2xl p-5 border border-red-100/60 dark:border-red-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-50 text-red-500 dark:bg-red-900/25">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Seguimiento Medico Anual
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Registra inmunizacion, historial de vacunacion, historial medico y control gradual de peso por colaborador.
                  </p>
                </div>
              </div>
              <ScaleHover>
                <button
                  type="button"
                  onClick={() => navigate('/usuarios/gestionar')}
                  className="inline-flex items-center justify-center rounded-lg bg-sanjer-green px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                >
                  Ver perfiles de colaboradores
                </button>
              </ScaleHover>
            </div>
          </div>
        </FadeUp>

        {/* Distribution + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Age distribution */}
          <FadeUp delay={0.35}>
            <div className="glass-card shadow-sm rounded-2xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Distribución por Edad</h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Clasificación de colaboradores por grupos etarios</p>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.age_distribution || {}).map(([lvl, qty], i) => {
                  const pct = totalLevels > 0 ? (qty / totalLevels) * 100 : 0;
                  return (
                    <div key={lvl}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{lvl}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-400">{qty} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <AnimatedBar
                          pct={pct}
                          delay={0.5 + i * 0.1}
                          className="h-2 rounded-full bg-sanjer-green"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeUp>

          {/* Recent activity */}
          <FadeUp delay={0.4}>
            <div className="glass-card shadow-sm rounded-2xl p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Actividad Reciente</h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Últimas acciones del sistema</p>
              </div>
              <ActivityMiniList list={stats.recent_activities} />
            </div>
          </FadeUp>
        </div>

        {/* Full activity table */}
        <FadeUp delay={0.5}>
          <div className="glass-card shadow-sm rounded-2xl p-5 overflow-x-auto">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Registro de Actividades</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Historial paginado de actividades</p>
            </div>
            <ActivityTable />
          </div>
        </FadeUp>

      </div>
    </PageTransition>
  );
};

/* ── Reusable StatCard con animaciones ── */
const StatCard = ({
  title,
  icon,
  value,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  color: 'green' | 'blue';
}) => {
  return (
    <ScaleHover>
      <div className={`glass-card shadow-sm rounded-2xl p-5 transition-all hover:shadow-lg duration-200 ${
        color === 'green' ? 'stat-card-green' : 'stat-card-blue'
      }`}>
        {/* Icon + title row */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{title}</p>
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            color === 'green'
              ? 'bg-sanjer-green/10 text-sanjer-green'
              : 'bg-sanjer-blue/10 text-sanjer-blue'
          }`}>
            {icon}
          </div>
        </div>

        {/* Animated value */}
        <AnimatedNumber
          value={typeof value === 'number' ? value.toLocaleString() : value}
          className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100"
        />
      </div>
    </ScaleHover>
  );
};

export default Dashboard;
