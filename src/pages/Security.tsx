
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const Security = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin Principal', email: 'admin@sanjerfit.com', role: 'Administrador', status: 'Activo', lastLogin: '16/05/2025' },
    { id: 2, name: 'Juan Martínez', email: 'j.martinez@sanjerfit.com', role: 'Editor', status: 'Activo', lastLogin: '15/05/2025' },
    { id: 3, name: 'Sofía Ramírez', email: 's.ramirez@sanjerfit.com', role: 'Visualizador', status: 'Inactivo', lastLogin: '10/05/2025' },
    { id: 4, name: 'Carlos Dominguez', email: 'c.dominguez@sanjerfit.com', role: 'Editor', status: 'Activo', lastLogin: '14/05/2025' },
  ]);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Editor'
  });
  
  const handleAddUser = () => {
    const newId = Math.max(...users.map(u => u.id)) + 1;
    
    setUsers([
      ...users,
      {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Activo',
        lastLogin: '—'
      }
    ]);
    
    setNewUser({
      name: '',
      email: '',
      role: 'Editor'
    });
    
    toast({
      title: "Usuario añadido",
      description: "El nuevo usuario ha sido añadido al sistema",
    });
  };
  
  const handleRemoveUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
    });
  };
  
  const handleChangeStatus = (id: number) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: user.status === 'Activo' ? 'Inactivo' : 'Activo'
        };
      }
      return user;
    }));
    
    toast({
      title: "Estado actualizado",
      description: "El estado del usuario ha sido actualizado",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Seguridad" 
        subtitle="Gestión de accesos y usuarios del sistema"
      />
      
      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Usuarios Administrativos</h2>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-sanjer-green hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Ingresa la información del nuevo usuario administrativo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Ej: juan.perez@sanjerfit.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddUser}
                  disabled={!newUser.name || !newUser.email}
                  className="bg-sanjer-green hover:bg-green-600"
                >
                  Añadir Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-medium">Usuario</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Correo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Rol</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Estado</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Último Login</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4 align-middle">{user.name}</td>
                      <td className="p-4 align-middle">{user.email}</td>
                      <td className="p-4 align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "Administrador"
                              ? "bg-blue-100 text-blue-700"
                              : user.role === "Editor"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === "Activo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle">{user.lastLogin}</td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="icon" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => handleChangeStatus(user.id)}
                          >
                            <span className="text-xs">
                              {user.status === "Activo" ? "❌" : "✓"}
                            </span>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => handleRemoveUser(user.id)}
                            className="hover:bg-red-100 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold">Administrador</h3>
                <p className="text-sm text-muted-foreground">
                  Acceso total al sistema. Puede crear, editar y eliminar usuarios, gestionar todos los módulos.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold">Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Puede registrar colaboradores, gestionar inventario y entregar premios. No puede acceder a reportes avanzados.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold">Visualizador</h3>
                <p className="text-sm text-muted-foreground">
                  Solo puede visualizar información. No puede realizar cambios en el sistema.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Admin Principal", action: "Inició sesión", time: "16/05/2025, 10:23 AM" },
                  { user: "Juan Martínez", action: "Registró entrega de premio", time: "15/05/2025, 03:45 PM" },
                  { user: "Carlos Dominguez", action: "Actualizó inventario", time: "14/05/2025, 11:12 AM" },
                  { user: "Admin Principal", action: "Generó reporte de actividad", time: "14/05/2025, 09:30 AM" },
                  { user: "Sofía Ramírez", action: "Inició sesión", time: "10/05/2025, 02:15 PM" },
                ].map((item, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium">{item.user}</div>
                    <div className="text-muted-foreground flex justify-between">
                      <span>{item.action}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;
