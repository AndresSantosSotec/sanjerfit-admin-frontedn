import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, Shield, Home, BookOpen, Gift,
  ChevronDown, ChevronUp, X,
  LayoutDashboard, UserPlus, UsersRound, Bell,
  Trophy, Truck, Package2, Coins,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import SanjerLogo from './SanjerLogo';

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  path: string;
  description: string;
  clickable?: boolean;
  subItems?: { title: string; path: string; icon?: React.ReactNode }[];
};

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminSidebar = ({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: AdminSidebarProps) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Dashboard",
      path: "/dashboard",
      description: "Panel principal",
      clickable: true,
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Usuarios",
      path: "/usuarios/registrar",
      description: "Colaboradores & Perfiles",
      clickable: false,
      subItems: [
        { title: "Registrar Colaborador", path: "/usuarios/registrar", icon: <UserPlus className="h-3.5 w-3.5" /> },
        { title: "Gestionar Colaboradores", path: "/usuarios/gestionar", icon: <UsersRound className="h-3.5 w-3.5" /> },
        { title: "Notificaciones", path: "/usuarios/notificaciones", icon: <Bell className="h-3.5 w-3.5" /> },
      ],
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: "Premios",
      path: "/premios",
      description: "Catálogo de premios",
      clickable: false,
      subItems: [
        { title: "Catálogo", path: "/premios", icon: <Trophy className="h-3.5 w-3.5" /> },
        { title: "Entregar Premio", path: "/premios/entregar", icon: <Truck className="h-3.5 w-3.5" /> },
        { title: "Inventario", path: "/premios/inventario", icon: <Package2 className="h-3.5 w-3.5" /> },
      ],
    },
    {
      icon: <Coins className="h-5 w-5" />,
      title: "Monedas",
      path: "/monedas",
      description: "Deducciones y campañas",
      clickable: true,
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Reportes",
      path: "/reportes",
      description: "Estadísticas y rankings",
      clickable: true,
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Información",
      path: "/informacion-general",
      description: "Contenido para la app",
      clickable: true,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Seguridad",
      path: "/seguridad",
      description: "Gestión de accesos",
      clickable: true,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isGroupActive = (item: MenuItem) => {
    if (isActive(item.path)) return true;
    return item.subItems?.some(s => isActive(s.path)) ?? false;
  };

  const toggleExpand = (title: string) => {
    setExpanded(prev => prev === title ? null : title);
  };

  return (
    <aside className={`
      sidebar-glass h-screen flex flex-col
      fixed left-0 top-0 z-40
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'}
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06] overflow-hidden">
        <Link to="/dashboard" onClick={onClose} className="flex-shrink-0">
          <SanjerLogo hideText={isCollapsed} />
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Menu label */}
      {!isCollapsed && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menú Principal
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 px-3 space-y-1 overflow-y-auto ${isCollapsed ? 'pt-5' : 'pb-4'}`}>
        {menuItems.map((item, idx) => {
          const groupActive = isGroupActive(item);
          const isExpanded = expanded === item.title;

          return (
            <div key={item.title} className="relative group/nav">
              {/* Main item */}
              <div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${groupActive
                    ? 'nav-active text-white'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center lg:px-2' : ''}
                `}
                onClick={() => item.subItems ? toggleExpand(item.title) : undefined}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 transition-colors duration-200
                  ${groupActive ? 'text-sanjer-green' : 'text-white/40 group-hover/nav:text-sanjer-green'}
                `}>
                  {item.icon}
                </div>

                {/* Label */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    {item.clickable ? (
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="block font-medium text-sm leading-tight"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="block font-medium text-sm leading-tight">{item.title}</span>
                    )}
                    <p className={`text-[11px] leading-tight mt-0.5 truncate transition-colors duration-200
                      ${groupActive ? 'text-white/50' : 'text-white/30 group-hover/nav:text-white/40'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Chevron */}
                {item.subItems && !isCollapsed && (
                  <div className={`flex-shrink-0 transition-all duration-200 ${groupActive ? 'text-sanjer-green' : 'text-white/30'}`}>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />
                    }
                  </div>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 whitespace-nowrap shadow-lg border border-white/[0.08]">
                    {item.title}
                  </div>
                )}
              </div>

              {/* Sub-items */}
              {item.subItems && isExpanded && !isCollapsed && (
                <div className="mt-1 ml-3 pl-4 border-l border-white/[0.08] space-y-0.5">
                  {item.subItems.map((subItem) => {
                    const subActive = isActive(subItem.path);
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                          transition-all duration-200
                          ${subActive
                            ? 'bg-sanjer-green/20 text-sanjer-green font-medium border border-sanjer-green/25'
                            : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        {subItem.icon && (
                          <span className={subActive ? 'text-sanjer-green' : 'text-white/35'}>
                            {subItem.icon}
                          </span>
                        )}
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button & Theme/Footer info */}
      <div className="p-4 border-t border-white/[0.06] flex flex-col gap-3">
        {/* Toggle Expand/Collapse Trigger (only visible on large screens) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all duration-200"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="h-2.5 w-2.5 rounded-full bg-sanjer-green animate-pulse-glow flex-shrink-0" />
          {!isCollapsed && (
            <div>
              <p className="text-white/40 text-[11px] font-medium">SanjerFIT Admin</p>
              <p className="text-white/25 text-[10px]">v1.0.0 — Activo</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;