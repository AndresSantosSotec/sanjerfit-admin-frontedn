import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Shield, Home } from 'lucide-react';
import SanjerLogo from './SanjerLogo';

type MenuItem = {
  icon: React.ReactNode;
  title: string;
  path: string;
  description: string;
  clickable?: boolean;
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
      clickable: true,
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Usuarios",
      path: "/usuarios/registrar",
      description: "Registrar Colaboradores | Perfiles",
      clickable: false,
      subItems: [
        { title: "Registrar Colaborador", path: "/usuarios/registrar" },
        { title: "Gestionar Colaboradores", path: "/usuarios/gestionar" },
      ],
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
                className={`flex items-center p-2 rounded-md transition-colors ${
                  isActive(item.path) ? "bg-sanjer-blue text-white bg-opacity-80" : "hover:bg-blue-800"
                } ${item.subItems ? "cursor-pointer" : ""}`}
                onClick={() => item.subItems && toggleExpand(item.title)}
              >
                <div className="mr-2 text-sanjer-green">
                  {item.icon}
                </div>
                <div className="flex-1">
                  {item.clickable ? (
                    <Link to={item.path} className="font-medium text-sm">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-sm">{item.title}</span>
                  )}
                  <p className="text-xs text-blue-200">{item.description}</p>
                </div>
                {item.subItems && item.subItems.length > 0 && (
                  <span className="text-xs">
                    {expanded === item.title ? "▲" : "▼"}
                  </span>
                )}
              </div>
              
              {expanded === item.title && item.subItems && item.subItems.length > 0 && (
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