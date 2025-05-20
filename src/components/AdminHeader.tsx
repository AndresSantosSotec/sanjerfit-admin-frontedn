import React from 'react';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  title: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      // Limpia el almacenamiento local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      toast({
        title: 'Sesión cerrada',
        description: 'Has sido desconectado correctamente.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error al cerrar sesión',
        description: 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Configuración</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Preferencias</DropdownMenuItem>
            <DropdownMenuItem>Configuración de cuenta</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sanjer-blue flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                {JSON.parse(localStorage.getItem('auth_user') || '{}').name || 'Admin'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Cambiar contraseña</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
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
