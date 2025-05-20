import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Edit, Trash2, EyeOff, Eye, CheckCircle2, XCircle
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminHeader from "@/components/AdminHeader";

interface User {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string };
  status: string;
  last_login: string;
}

const emptyForm = { name: "", email: "", role_id: 2, password: "", confirmPassword: "" };

const Security = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const perPage = 5;

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
  });

  useEffect(() => {
    api.get('/webadmin/users')
      .then(r => setUsers(r.data))
      .catch(e => {
        if (e.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          toast({ title: "Error", description: "No se pudo cargar usuarios", variant: 'destructive' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtro + paginación
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const resetForm = () => setForm(emptyForm);

  const handleAdd = () => {
    const { name, email, password, confirmPassword, role_id } = form;
    if (!name || !email || !password || password !== confirmPassword) return;
    api.post('/webadmin/users', { name, email, password, role_id, status: "Activo" })
      .then(r => {
        setUsers([r.data, ...users]);
        toast({ title: "Usuario creado" });
        setShowAdd(false);
        resetForm();
      })
      .catch(() => toast({ title: "Error al crear", variant: 'destructive' }));
  };

  const openEdit = (u: User) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, role_id: u.role.id, password: "", confirmPassword: "" });
    setShowEdit(true);
  };

  const handleEdit = () => {
    if (!selected) return;
    const payload: any = { role_id: form.role_id };
    if (form.password && form.password === form.confirmPassword) {
      payload.password = form.password;
    }
    api.put(`/webadmin/users/${selected.id}`, payload)
      .then(r => {
        setUsers(users.map(u => u.id === selected.id ? r.data : u));
        toast({ title: "Usuario actualizado" });
        setShowEdit(false);
        resetForm();
      })
      .catch(() => toast({ title: "Error al actualizar", variant: 'destructive' }));
  };

  const handleDelete = (id: number) => {
    api.delete(`/webadmin/users/${id}`)
      .then(() => {
        setUsers(users.filter(u => u.id !== id));
        toast({ title: "Usuario eliminado" });
      })
      .catch(() => toast({ title: "Error al eliminar", variant: 'destructive' }));
  };

  const handleToggleStatus = (u: User) => {
    api.put(`/webadmin/users/${u.id}`, { status: u.status === "Activo" ? "Inactivo" : "Activo" })
      .then(r => {
        setUsers(users.map(x => x.id === u.id ? r.data : x));
        toast({ title: "Estado actualizado" });
      })
      .catch(() => toast({ title: "Error al actualizar", variant: 'destructive' }));
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Seguridad" subtitle="Gestión de usuarios" />
      <div className="p-6 flex-1 space-y-6">
        {/* Búsqueda + Añadir */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="max-w-md"
          />
          <Button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-sanjer-green">
            <Plus className="w-4 h-4 mr-2"/> Añadir Usuario
          </Button>
        </div>

        {/* Tabla paginada */}
        <Card>
          <CardHeader><CardTitle>Usuarios</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <>
                <div className="overflow-auto">
                  <table className="w-full text-sm table-auto">
                    <thead className="bg-gray-100">
                      <tr>
                        {[
                          "Nombre","Email","Rol","Estado","Último Login","Acciones"
                        ].map(h =>
                          <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((u, idx) => (
                        <tr key={u.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-4">{u.name}</td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">{u.role.name}</td>
                          <td className="px-6 py-4">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleToggleStatus(u)}
                              className="p-1"
                            >
                              {u.status === "Activo"
                                ? <CheckCircle2 className="text-green-500" />
                                : <XCircle className="text-red-500" />}
                            </Button>
                          </td>
                          <td className="px-6 py-4">{new Date(u.last_login).toLocaleString()}</td>
                          <td className="px-6 py-4 space-x-2 text-right">
                            <Button size="icon" variant="outline" onClick={() => openEdit(u)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleDelete(u.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span>Página {page} de {totalPages}</span>
                  <Button
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Modal */}
        <Dialog open={showAdd} onOpenChange={o => !o && setShowAdd(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Usuario</DialogTitle></DialogHeader>
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="cred">Credenciales</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div><Label>Nombre</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div>
                  <Label>Rol</Label>
                  <Select value={String(form.role_id)} onValueChange={v => setForm({ ...form, role_id: Number(v) })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Administrador</SelectItem>
                      <SelectItem value="2">Editor</SelectItem>
                      <SelectItem value="3">Visualizador</SelectItem>
                      <SelectItem value="4">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="cred" className="space-y-4">
                <div>
                  <Label>Contraseña</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2">
                      {showPassword ? <EyeOff/> : <Eye/>}
                    </button>
                  </div>
                </div>
                <div><Label>Confirmar</Label><Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={!form.name||!form.email||!form.password||form.password!==form.confirmPassword}>
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEdit} onOpenChange={o => !o && setShowEdit(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Usuario</DialogTitle></DialogHeader>
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Rol</TabsTrigger>
                <TabsTrigger value="cred">Contraseña</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div>
                  <Label>Rol</Label>
                  <Select value={String(form.role_id)} onValueChange={v => setForm({ ...form, role_id: Number(v) })}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Administrador</SelectItem>
                      <SelectItem value="2">Editor</SelectItem>
                      <SelectItem value="3">Visualizador</SelectItem>
                      <SelectItem value="4">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="cred" className="space-y-4">
                <div>
                  <Label>Nueva Contraseña</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2">
                      {showPassword ? <EyeOff/> : <Eye/>}
                    </button>
                  </div>
                </div>
                <div><Label>Confirmar</Label><Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={handleEdit}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader><CardTitle>Roles y Permisos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><h3 className="font-semibold">Administrador</h3><p className="text-sm text-muted-foreground">Acceso total al sistema…</p></div>
              <div><h3 className="font-semibold">Editor</h3><p className="text-sm text-muted-foreground">Gestiona inventario…</p></div>
              <div><h3 className="font-semibold">Visualizador</h3><p className="text-sm text-muted-foreground">Solo lectura…</p></div>
              <div><h3 className="font-semibold">Colaborador</h3><p className="text-sm text-muted-foreground">Acceso limitado…</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Registro de Actividad</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Admin Principal</strong> inició sesión — 16/05/2025</p>
              <p><strong>Juan Martínez</strong> registró entrega — 15/05/2025</p>
              <p><strong>Sofía Ramírez</strong> desactivó usuario — 14/05/2025</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;
