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
      <div className="p-4 sm:p-6 flex-1 space-y-6">
        {/* Búsqueda + Añadir */}
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <Button onClick={() => { resetForm(); setShowAdd(true); }} className="btn-glow-green text-white font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all duration-200">
            <Plus className="w-4 h-4"/> Añadir Usuario
          </Button>
        </div>

        {/* Tabla paginada */}
        <Card className="glass-card shadow-sm rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-6 text-sm">Cargando...</p>
            ) : (
              <>
                <div className="overflow-auto">
                  <table className="w-full text-sm table-auto">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 dark:text-slate-500">
                        {["Nombre","Email","Rol","Estado","Último Login","Acciones"].map(h =>
                          <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      {paginated.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{u.name}</td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">{u.role.name}</td>
                          <td className="px-6 py-4">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleToggleStatus(u)}
                              className="p-1 h-8 w-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              {u.status === "Activo"
                                ? <CheckCircle2 className="text-green-500 h-5 w-5" />
                                : <XCircle className="text-red-500 h-5 w-5" />}
                            </Button>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-550">{new Date(u.last_login).toLocaleString()}</td>
                          <td className="px-6 py-4 space-x-2 text-right">
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => openEdit(u)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDelete(u.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 text-xs disabled:opacity-30"
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Página {page} de {totalPages}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 h-8 text-xs disabled:opacity-30"
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
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-800 dark:text-slate-100">Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full grid grid-cols-2">
                <TabsTrigger value="info" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Info</TabsTrigger>
                <TabsTrigger value="cred" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Credenciales</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Nombre</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Rol</Label>
                  <Select value={String(form.role_id)} onValueChange={v => setForm({ ...form, role_id: Number(v) })}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                      <SelectItem value="1">Administrador</SelectItem>
                      <SelectItem value="2">Editor</SelectItem>
                      <SelectItem value="3">Visualizador</SelectItem>
                      <SelectItem value="4">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="cred" className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Contraseña</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500">
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Confirmar Contraseña</Label>
                  <Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleAdd} disabled={!form.name||!form.email||!form.password||form.password!==form.confirmPassword} className="bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl text-sm">
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEdit} onOpenChange={o => !o && setShowEdit(false)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-800 dark:text-slate-100">Editar Usuario</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full grid grid-cols-2">
                <TabsTrigger value="info" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Rol</TabsTrigger>
                <TabsTrigger value="cred" className="rounded-lg dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Contraseña</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Rol</Label>
                  <Select value={String(form.role_id)} onValueChange={v => setForm({ ...form, role_id: Number(v) })}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                      <SelectItem value="1">Administrador</SelectItem>
                      <SelectItem value="2">Editor</SelectItem>
                      <SelectItem value="3">Visualizador</SelectItem>
                      <SelectItem value="4">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="cred" className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500">
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">Confirmar Contraseña</Label>
                  <Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleEdit} className="bg-sanjer-green hover:bg-green-600 text-white font-semibold rounded-xl text-sm">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Roles y Permisos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-slate-700 dark:text-slate-300">
              <div><h3 className="font-semibold text-slate-800 dark:text-slate-200">Administrador</h3><p className="text-xs text-slate-500 dark:text-slate-400">Acceso total al sistema…</p></div>
              <div><h3 className="font-semibold text-slate-800 dark:text-slate-200">Editor</h3><p className="text-xs text-slate-500 dark:text-slate-400">Gestiona inventario y premios…</p></div>
              <div><h3 className="font-semibold text-slate-800 dark:text-slate-200">Visualizador</h3><p className="text-xs text-slate-500 dark:text-slate-400">Solo lectura de datos…</p></div>
              <div><h3 className="font-semibold text-slate-800 dark:text-slate-200">Colaborador</h3><p className="text-xs text-slate-500 dark:text-slate-400">Acceso limitado de usuario…</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-sm rounded-2xl border-slate-100 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Registro de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 p-6 text-sm text-slate-700 dark:text-slate-350">
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
