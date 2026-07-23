import React, { useState, useEffect } from 'react';
import { Bell, Settings, User, LogOut, Menu, ChevronDown, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

const usePageTitle = () => {
  const location = useLocation();
  const path = location.pathname;
  const titles: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Panel de control principal' },
    '/usuarios/registrar': { title: 'Registrar Colaborador', subtitle: 'Gestión de usuarios' },
    '/usuarios/gestionar': { title: 'Gestionar Colaboradores', subtitle: 'Gestión de usuarios' },
    '/usuarios/notificaciones': { title: 'Notificaciones', subtitle: 'Centro de avisos' },
    '/premios': { title: 'Catálogo de Premios', subtitle: 'Gestión de premios' },
    '/premios/entregar': { title: 'Entregar Premio', subtitle: 'Asignación de premios' },
    '/premios/inventario': { title: 'Inventario', subtitle: 'Control de stock' },
    '/informacion-general': { title: 'Información General', subtitle: 'Contenido de la app' },
    '/seguridad': { title: 'Seguridad', subtitle: 'Gestión de accesos y roles' },
    '/reportes': { title: 'Reportes', subtitle: 'Análisis y estadísticas' },
  };
  return titles[path] ?? { title: 'SanjerFIT Admin', subtitle: '' };
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, onMenuToggle }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pageInfo = usePageTitle();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const displayTitle = title || pageInfo.title;
  const displaySubtitle = subtitle || pageInfo.subtitle;

  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const userName = authUser.name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    toast({
      title: `Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
      duration: 1500,
    });
  };

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle();
    } else {
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/webadmin/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
    } catch (error) {
      // Aunque falle el servidor, limpiamos sesión local
      console.warn('Logout server error (session cleared locally):', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      toast({
        title: 'Sesión cerrada',
        description: 'Has sido desconectado correctamente.',
      });
      navigate('/login');
    }
  };

  return (
    <header className="header-glass sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Hamburger + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — visible only on mobile */}
        <button
          onClick={handleMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200 flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">{displaySubtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

        {/* Theme Switcher Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </Button>

        {/* Notifications bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-sanjer-green rounded-full animate-pulse-glow" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 shadow-lg rounded-xl"
          >
            <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">
              Notificaciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-sm py-3 rounded-lg">
              Sin notificaciones nuevas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200 hidden sm:flex"
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 shadow-lg rounded-xl"
          >
            <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">
              Configuración
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-lg">
              Preferencias
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-lg">
              Configuración de cuenta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar & menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-9 px-2 sm:px-3 rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sanjer-blue to-sanjer-green flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0">
                {userInitial}
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                {userName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 shadow-lg rounded-xl"
          >
            <DropdownMenuLabel className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">
              Mi cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-lg">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-lg">
              <Settings className="mr-2 h-4 w-4" />
              Cambiar contraseña
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
