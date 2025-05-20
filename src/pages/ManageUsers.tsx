import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { CollaboratorModal } from '@/components/collaborators/CollaboratorModal';
import { CollaboratorView } from '@/components/collaborators/CollaboratorView';
import { Collaborator } from '@/types/collaborator';

// Tipo tal cual devuelve tu Controller@index
interface BackendColaborator {
  id: number;
  nombre: string;
  telefono: string;
  area: string;
  nivel_asignado: string;
  peso: number;
  altura: number;
  tipo_sangre: string;
  alergias: string;
  padecimientos: string;
  indice_masa_corporal: number;
  photo_url: string | null;
  user: {
    email: string;
    status: string;
    last_active_at?: string;
  };
}

export const ManageUsers: React.FC = () => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('⚠️ No se encontró "auth_token" en localStorage.');
    toast({
      title: 'Error de autenticación',
      description: 'No se encontró token. Por favor inicia sesión.',
      variant: 'destructive'
    });
  }

  // VITE_API_URL ya termina en /api
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [currentCollaborator, setCurrentCollaborator] = useState<Collaborator | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1) Carga inicial
  useEffect(() => {
    console.debug('⏳ Cargando colaboradores desde API…');
    api.get<BackendColaborator[]>('/webadmin/colaborators')
      .then(({ data }) => {
        console.debug('✅ Respuesta cruda:', data);
        const mapped = data.map(col => {
          // normalizar nivel y castear
          const lvl = col.nivel_asignado
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const level = (['KoalaFit','JaguarFit','HalconFit'].includes(lvl)
            ? lvl : 'KoalaFit'
          ) as 'KoalaFit'|'JaguarFit'|'HalconFit';

          // normalizar status y castear
          const st = col.user.status.toLowerCase() === 'activo' ? 'Activo' : 'Inactivo';
          const status = st as 'Activo'|'Inactivo';

          return {
            id: String(col.id),
            name: col.nombre,
            email: col.user.email,
            phone: col.telefono,
            area: col.area,
            level,
            status,
            photo: col.photo_url ?? '',
            address: (col as any).direccion ?? '',
            occupation: (col as any).ocupacion ?? '',
            weight: col.peso,
            height: col.altura,
            bloodType: col.tipo_sangre,
            allergies: col.alergias,
            medicalConditions: col.padecimientos,
            bmi: String(col.indice_masa_corporal),
            coinFits: (col as any).coin_fits ?? 0,
            lastActive: col.user.last_active_at?.split('T')[0] ?? ''
          };
        });
        console.debug('✅ Mapeado:', mapped);
        setCollaborators(mapped);
      })
      .catch(err => {
        console.error('❌ Error al cargar colaboradores:', err);
        toast({ title: 'Error', description: 'No se pudo cargar colaboradores', variant: 'destructive' });
      });
  }, []);

  // 2) Filtro seguro
  const filtered = collaborators.filter(c =>
    (c.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.area ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers de modal, vista, creación/edición y borrado...
  const openAddModal = () => {
    setCurrentCollaborator(null);
    setEditMode(false);
    setIsModalOpen(true);
  };
  const openEditModal = (c: Collaborator) => {
    setCurrentCollaborator(c);
    setEditMode(true);
    setIsModalOpen(true);
  };
  const openViewModal = (c: Collaborator) => {
    setCurrentCollaborator(c);
    setIsViewModalOpen(true);
  };

  const handleSaveCollaborator = async (c: Collaborator) => {
    try {
      if (editMode && c.id) {
        console.debug(`✏️ Actualizando ${c.id}`, c);
        const payload = {
          nombre: c.name,
          sexo: (c as any).sexo,
          telefono: c.phone,
          direccion: c.address,
          ocupacion: c.occupation,
          area: c.area,
          peso: c.weight,
          altura: c.height,
          tipo_sangre: c.bloodType,
          alergias: c.allergies,
          padecimientos: c.medicalConditions,
          indice_masa_corporal: parseFloat(c.bmi),
          nivel_asignado: c.level,
        };
        const { data } = await api.put<BackendColaborator>(`/webadmin/colaborators/${c.id}`, payload);

        // normalizar de nuevo
        const lvl2 = data.nivel_asignado
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const level2 = (['KoalaFit','JaguarFit','HalconFit'].includes(lvl2)
          ? lvl2 : 'KoalaFit'
        ) as 'KoalaFit'|'JaguarFit'|'HalconFit';
        const st2 = data.user.status.toLowerCase() === 'activo' ? 'Activo' : 'Inactivo';
        const status2 = st2 as 'Activo'|'Inactivo';

        const updated: Collaborator = {
          id: String(data.id),
          name: data.nombre,
          email: data.user.email,
          phone: data.telefono,
          area: data.area,
          level: level2,
          status: status2,
          photo: data.photo_url ?? '',
          address: (data as any).direccion ?? '',
          occupation: (data as any).ocupacion ?? '',
          weight: data.peso,
          height: data.altura,
          bloodType: data.tipo_sangre,
          allergies: data.alergias,
          medicalConditions: data.padecimientos,
          bmi: String(data.indice_masa_corporal),
          coinFits: (data as any).coin_fits ?? 0,
          lastActive: data.user.last_active_at?.split('T')[0] ?? ''
        };

        setCollaborators(prev => prev.map(x => x.id === updated.id ? updated : x));
        toast({ title: 'Actualizado', description: `${updated.name} actualizado.` });

      } else {
        console.debug('➕ Añadiendo…', c);
        const payload = {
          nombre: c.name,
          email: c.email,
          password: (c as any).password,
          password_confirmation: (c as any).passwordConfirmation,
          sexo: (c as any).sexo,
          telefono: c.phone,
          direccion: c.address,
          ocupacion: c.occupation,
          area: c.area,
          peso: c.weight,
          altura: c.height,
          tipo_sangre: c.bloodType,
          alergias: c.allergies,
          padecimientos: c.medicalConditions,
          indice_masa_corporal: parseFloat(c.bmi),
          nivel_asignado: c.level,
        };
        const { data } = await api.post<BackendColaborator>('/webadmin/colaborators', payload);

        const lvl3 = data.nivel_asignado
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const level3 = (['KoalaFit','JaguarFit','HalconFit'].includes(lvl3)
          ? lvl3 : 'KoalaFit'
        ) as 'KoalaFit'|'JaguarFit'|'HalconFit';
        const st3 = data.user.status.toLowerCase() === 'activo' ? 'Activo' : 'Inactivo';
        const status3 = st3 as 'Activo'|'Inactivo';

        const added: Collaborator = {
          id: String(data.id),
          name: data.nombre,
          email: data.user.email,
          phone: data.telefono,
          area: data.area,
          level: level3,
          status: status3,
          photo: data.photo_url ?? '',
          address: (data as any).direccion ?? '',
          occupation: (data as any).ocupacion ?? '',
          weight: data.peso,
          height: data.altura,
          bloodType: data.tipo_sangre,
          allergies: data.alergias,
          medicalConditions: data.padecimientos,
          bmi: String(data.indice_masa_corporal),
          coinFits: (data as any).coin_fits ?? 0,
          lastActive: data.user.last_active_at?.split('T')[0] ?? ''
        };

        setCollaborators(prev => [...prev, added]);
        toast({ title: 'Añadido', description: `${added.name} agregado.` });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('❌ Error al guardar:', err.response ?? err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo guardar',
        variant: 'destructive'
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsAlertDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/webadmin/colaborators/${deleteId}`);
      setCollaborators(prev => prev.filter(c => c.id !== deleteId));
      toast({ title: 'Eliminado', description: 'Se borró correctamente.' });
    } catch (err: any) {
      console.error('❌ Error al eliminar:', err.response ?? err);
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    } finally {
      setIsAlertDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Gestión de Colaboradores" subtitle="Administra los colaboradores registrados" />
      <div className="p-6 flex-1">
        <div className="bg-white rounded-lg shadow">
          {/* BARRA */}
          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openAddModal} className="bg-sanjer-green hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" /> Añadir
            </Button>
          </div>
          {/* TABLA */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>CoinFits</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0
                  ? <TableRow><TableCell colSpan={8} className="text-center py-10">No hay resultados</TableCell></TableRow>
                  : filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {c.photo
                              ? <AvatarImage src={c.photo} alt={c.name} />
                              : <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>}
                          </Avatar>
                          <div>{c.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.area}</TableCell>
                      <TableCell>
                        <Badge className={
                          c.level === 'HalconFit' ? 'bg-green-100 text-green-800'
                            : c.level === 'JaguarFit' ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                        }>
                          {c.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status==='Activo'?'default':'secondary'}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.coinFits}</TableCell>
                      <TableCell>{c.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openViewModal(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openEditModal(c)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => confirmDelete(c.id)}
                            className="hover:bg-red-100 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCollaborator}
        collaborator={currentCollaborator}
        isEditMode={editMode}
      />

      {currentCollaborator && (
        <CollaboratorView
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          collaborator={currentCollaborator}
        />
      )}

      {/* ALERT DIALOG */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar colaborador?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUsers;
