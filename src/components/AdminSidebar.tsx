
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Award, Package, FileText, Shield, Home } from 'lucide-react';
import SanjerLogo from './SanjerLogo';

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  path: string;
  description: string;
  subItems?: { title: string; path: string }[];
};

const AdminSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Dashboard",
      path: "/dashboard",
      description: "Panel principal",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Usuarios",
      path: "/usuarios",
      description: "Registrar Colaboradores | Perfiles",
      subItems: [
        { title: "Registrar Colaborador", path: "/usuarios/registrar" },
        { title: "Gestionar Colaboradores", path: "/usuarios/gestionar" },
      ],
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Entregar Premios",
      path: "/premios/entregar",
      description: "Registrar entregas",
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Inventario Premios",
      path: "/premios/inventario",
      description: "Abastecer Premios",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Reportes",
      path: "/reportes",
      description: "Reportes Avances",
      subItems: [
        { title: "Reporte de Actividades", path: "/reportes/actividades" },
        { title: "Reporte por Departamentos", path: "/reportes/departamentos" },
      ],
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Seguridad",
      path: "/seguridad",
      description: "Gestión de accesos",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleExpand = (title: string) => {
    if (expanded === title) {
      setExpanded(null);
    } else {
      setExpanded(title);
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-sanjer-blue flex flex-col">
      <div className="p-4 border-b border-blue-800">
        <Link to="/dashboard">
          <SanjerLogo />
        </Link>
      </div>
      
      <div className="p-4 text-white text-sm">
        <h2 className="font-semibold mb-3">Menu Principal</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.title} className="space-y-1">
              <div 
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                  isActive(item.path) ? "bg-sanjer-blue text-white bg-opacity-80" : "hover:bg-blue-800"
                }`}
                onClick={() => item.subItems && toggleExpand(item.title)}
              >
                <div className="mr-2 text-sanjer-green">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <Link to={item.path} className="font-medium text-sm">
                    {item.title}
                  </Link>
                  <p className="text-xs text-blue-200">{item.description}</p>
                </div>
                {item.subItems && (
                  <span className="text-xs">
                    {expanded === item.title ? "▲" : "▼"}
                  </span>
                )}
              </div>
              
              {expanded === item.title && item.subItems && (
                <div className="pl-8 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block p-2 text-sm rounded ${
                        isActive(subItem.path)
                          ? "bg-sanjer-green text-white"
                          : "text-blue-200 hover:bg-blue-800"
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4 text-blue-200 text-xs border-t border-blue-800">
        <p>© 2025 SanjerFIT</p>
        <p>Versión 1.0.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
