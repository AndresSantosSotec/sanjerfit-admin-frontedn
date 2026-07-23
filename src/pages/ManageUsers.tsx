import React, { useState, useEffect, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  ArrowUpDown
} from 'lucide-react';
import { CollaboratorModal } from '@/components/collaborators/CollaboratorModal';
import { CollaboratorView } from '@/components/collaborators/CollaboratorView';
import { Collaborator } from '@/types/collaborator';

// Tipo tal cual devuelve tu Controller@index
interface BackendColaborator {
  id: number;
  nombre: string;
  fecha_nacimiento?: string | null;
  fecha_ingreso?: string | null;
  edad?: number | null;
  tiempo_laborando?: number | null;
  grupo_edad?: '18-24' | '25-34' | '35-44' | '45-54' | '55+' | 'Sin clasificar';
  nickname?: string;
  telefono: string;
  area: string;
  nivel_asignado: string;
  peso: number;
  altura: number;
  IMC_objetivo?: number;
  peso_objetivo?: number;
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

// Tipos para filtros
interface FilterState {
  search: string;
  area: string;
  level: string;
  ageGroup: string;
  minAge: string;
  maxAge: string;
  hireDateFrom: string;
  hireDateTo: string;
  bloodType: string;
}

// Tipo para ordenamiento
type SortField = 'name' | 'email' | 'area' | 'level' | 'age' | 'coinFits' | 'lastActive' | 'hireDate' | 'yearsAtInstitution';
type SortOrder = 'asc' | 'desc';
const ALL_OPTION = '__all__';

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

  // Estados principales
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [currentCollaborator, setCurrentCollaborator] = useState<Collaborator | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    area: '',
    level: '',
    ageGroup: '',
    minAge: '',
    maxAge: '',
    hireDateFrom: '',
    hireDateTo: '',
    bloodType: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Loading state
  const [loading, setLoading] = useState(true);

  const mapBackendCollaborator = (col: BackendColaborator): Collaborator => {
    const lvl = col.nivel_asignado
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const level = (['KoalaFit','JaguarFit','HalconFit'].includes(lvl)
      ? lvl : 'KoalaFit'
    ) as 'KoalaFit'|'JaguarFit'|'HalconFit';

    const st = col.user.status.toLowerCase() === 'activo' ? 'Activo' : 'Inactivo';
    const status = st as 'Activo'|'Inactivo';

    return {
      id: String(col.id),
      name: col.nombre,
      nickname: (col as any).nickname ?? '',
      birthDate: col.fecha_nacimiento ?? '',
      hireDate: col.fecha_ingreso ?? '',
      age: col.edad ?? undefined,
      yearsAtInstitution: col.tiempo_laborando ?? undefined,
      ageGroup: col.grupo_edad ?? 'Sin clasificar',
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
      imcObjective: col.IMC_objetivo ?? 24,
      weightObjective: col.peso_objetivo ?? 0,
      bloodType: col.tipo_sangre,
      allergies: col.alergias,
      medicalConditions: col.padecimientos,
      bmi: String(col.indice_masa_corporal),
      coinFits: (col as any).coin_fits ?? 0,
      lastActive: col.user.last_active_at?.split('T')[0] ?? ''
    };
  };

  const fetchCollaborators = async () => {
    const { data } = await api.get<BackendColaborator[]>('/webadmin/colaborators');
    const mapped = data.map(mapBackendCollaborator);
    setCollaborators(mapped);
  };

  // 1) Carga inicial
  useEffect(() => {
    console.debug('⏳ Cargando colaboradores desde API…');
    setLoading(true);
    fetchCollaborators()
      .catch(err => {
        console.error('❌ Error al cargar colaboradores:', err);
        toast({ title: 'Error', description: 'No se pudo cargar colaboradores', variant: 'destructive' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Obtener valores únicos para filtros
  const uniqueAreas = useMemo(() => {
    const areas = [...new Set(collaborators.map(c => c.area).filter(Boolean))];
    return areas.sort();
  }, [collaborators]);

  const uniqueBloodTypes = useMemo(() => {
    const bloodTypes = [...new Set(collaborators.map(c => c.bloodType).filter(Boolean))];
    return bloodTypes.sort();
  }, [collaborators]);

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = collaborators.filter(c => {
      const matchesSearch = 
        (c.name ?? '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.nickname ?? '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (c.phone ?? '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesArea = !filters.area || c.area === filters.area;
      const matchesLevel = !filters.level || c.level === filters.level;
      const matchesAgeGroup = !filters.ageGroup || c.ageGroup === filters.ageGroup;
      const ageValue = c.age ?? -1;
      const minAge = filters.minAge ? Number(filters.minAge) : null;
      const maxAge = filters.maxAge ? Number(filters.maxAge) : null;
      const matchesMinAge = minAge == null || ageValue >= minAge;
      const matchesMaxAge = maxAge == null || ageValue <= maxAge;

      const hireDate = c.hireDate || '';
      const matchesHireDateFrom = !filters.hireDateFrom || (hireDate && hireDate >= filters.hireDateFrom);
      const matchesHireDateTo = !filters.hireDateTo || (hireDate && hireDate <= filters.hireDateTo);
      const matchesBloodType = !filters.bloodType || c.bloodType === filters.bloodType;

      return matchesSearch
        && matchesArea
        && matchesLevel
        && matchesAgeGroup
        && matchesMinAge
        && matchesMaxAge
        && matchesHireDateFrom
        && matchesHireDateTo
        && matchesBloodType;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Manejar valores numéricos
      if (sortField === 'coinFits') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortField === 'age') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Manejar fechas
      if (sortField === 'lastActive') {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      }

      if (sortField === 'hireDate') {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      }

      if (sortField === 'yearsAtInstitution') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Comparar
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [collaborators, filters, sortField, sortOrder]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Información de paginación
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Función para manejar cambio de filtros
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Resetear a primera página
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      area: '',
      level: '',
      ageGroup: '',
      minAge: '',
      maxAge: '',
      hireDateFrom: '',
      hireDateTo: '',
      bloodType: ''
    });
    setCurrentPage(1);
  };

  // Función para manejar ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Función para cambiar página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
          nickname: c.nickname,
          fecha_nacimiento: c.birthDate || null,
          fecha_ingreso: c.hireDate || null,
          sexo: (c as any).sexo,
          telefono: c.phone,
          direccion: c.address,
          ocupacion: c.occupation,
          area: c.area,
          peso: c.weight,
          altura: c.height,
          IMC_objetivo: c.imcObjective,
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
          nickname: (data as any).nickname ?? '',
          birthDate: data.fecha_nacimiento ?? '',
          hireDate: data.fecha_ingreso ?? '',
          age: data.edad ?? undefined,
          yearsAtInstitution: data.tiempo_laborando ?? undefined,
          ageGroup: data.grupo_edad ?? 'Sin clasificar',
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
          imcObjective: data.IMC_objetivo ?? 24,
          weightObjective: data.peso_objetivo ?? 0,
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
          nickname: c.nickname,
          fecha_nacimiento: c.birthDate || null,
          fecha_ingreso: c.hireDate || null,
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
          IMC_objetivo: c.imcObjective,
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
          nickname: (data as any).nickname ?? '',
          birthDate: data.fecha_nacimiento ?? '',
          hireDate: data.fecha_ingreso ?? '',
          age: data.edad ?? undefined,
          yearsAtInstitution: data.tiempo_laborando ?? undefined,
          ageGroup: data.grupo_edad ?? 'Sin clasificar',
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
          imcObjective: data.IMC_objetivo ?? 24,
          weightObjective: data.peso_objetivo ?? 0,
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

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <AdminHeader title="Gestión de Colaboradores" subtitle="Administra los colaboradores registrados" />
        <div className="p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sanjer-green mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando colaboradores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Gestión de Colaboradores" subtitle="Administra los colaboradores registrados" />
      <div className="p-6 flex-1">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{collaborators.length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Edad Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-sanjer-green">
                {(() => {
                  const withAge = collaborators.filter(c => c.age != null);
                  if (!withAge.length) return 0;
                  return Math.round(withAge.reduce((acc, c) => acc + (c.age ?? 0), 0) / withAge.length);
                })()}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Antigüedad Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">
                {(() => {
                  const withTenure = collaborators.filter(c => c.yearsAtInstitution != null);
                  if (!withTenure.length) return 0;
                  return Math.round(withTenure.reduce((acc, c) => acc + (c.yearsAtInstitution ?? 0), 0) / withTenure.length);
                })()}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Áreas Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-sanjer-blue dark:text-blue-450">{uniqueAreas.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="glass-card shadow-sm rounded-2xl">
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(prev => !prev)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? 'Ocultar filtros' : 'Más filtros'}
                </Button>
                <Button onClick={openAddModal} className="bg-sanjer-green hover:bg-green-600 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Añadir
                </Button>
              </div>
            </div>

            {/* FILTROS AVANZADOS */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl mb-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Área</label>
                  <Select value={filters.area || ALL_OPTION} onValueChange={(value) => handleFilterChange('area', value === ALL_OPTION ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_OPTION}>Todas las áreas</SelectItem>
                      {uniqueAreas.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nivel</label>
                  <Select value={filters.level || ALL_OPTION} onValueChange={(value) => handleFilterChange('level', value === ALL_OPTION ? '' : value)}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-105">
                      <SelectItem value={ALL_OPTION}>Todos los niveles</SelectItem>
                      <SelectItem value="KoalaFit">KoalaFit</SelectItem>
                      <SelectItem value="JaguarFit">JaguarFit</SelectItem>
                      <SelectItem value="HalconFit">HalconFit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Grupo de Edad</label>
                  <Select value={filters.ageGroup || ALL_OPTION} onValueChange={(value) => handleFilterChange('ageGroup', value === ALL_OPTION ? '' : value)}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <SelectValue placeholder="Todos los grupos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-105">
                      <SelectItem value={ALL_OPTION}>Todos los grupos</SelectItem>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                      <SelectItem value="Sin clasificar">Sin clasificar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tipo de Sangre</label>
                  <Select value={filters.bloodType || ALL_OPTION} onValueChange={(value) => handleFilterChange('bloodType', value === ALL_OPTION ? '' : value)}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-105">
                      <SelectItem value={ALL_OPTION}>Todos los tipos</SelectItem>
                      {uniqueBloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Edad mínima</label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.minAge}
                    onChange={e => handleFilterChange('minAge', e.target.value)}
                    placeholder="Ej. 25"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Edad máxima</label>
                  <Input
                    type="number"
                    min="0"
                    value={filters.maxAge}
                    onChange={e => handleFilterChange('maxAge', e.target.value)}
                    placeholder="Ej. 45"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Ingreso desde</label>
                  <Input
                    type="date"
                    value={filters.hireDateFrom}
                    onChange={e => handleFilterChange('hireDateFrom', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Ingreso hasta</label>
                  <Input
                    type="date"
                    value={filters.hireDateTo}
                    onChange={e => handleFilterChange('hireDateTo', e.target.value)}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}

            {/* INFORMACIÓN DE RESULTADOS */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                Mostrando {startItem} - {endItem} de {totalItems} colaboradores
                {Object.values(filters).some(filter => filter) && (
                  <span className="ml-2 text-sanjer-blue dark:text-blue-400 font-semibold">(filtrado de {collaborators.length} total)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Mostrar:</span>
                <Select value={String(itemsPerPage)} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-18 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-250">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-805 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-105">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>por página</span>
              </div>
            </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Colaborador
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Correo
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('area')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Área
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Nivel
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Edad
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1 font-semibold">
                      Grupo Edad
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('hireDate')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Fecha Ingreso
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('yearsAtInstitution')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Antigüedad
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('coinFits')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      CoinFits
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => handleSort('lastActive')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Última Actividad
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-800 dark:text-slate-200">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <div className="text-gray-500">
                        {totalItems === 0 ? 'No hay colaboradores disponibles' : 'No hay resultados para los filtros aplicados'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map(c => (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            {c.photo
                              ? <AvatarImage src={c.photo} alt={c.name} />
                              : <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>}
                          </Avatar>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            {c.nickname && (
                              <div className="text-xs text-gray-500 italic">{c.nickname}</div>
                            )}
                            <div className="text-sm text-gray-500">{c.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.area}</Badge>
                      </TableCell>
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
                        <div className="text-sm font-medium">{c.age ?? 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.ageGroup || 'Sin clasificar'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.hireDate || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.yearsAtInstitution != null ? `${c.yearsAtInstitution} años` : 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{c.coinFits}</span>
                          <span className="text-xs text-yellow-600">🪙</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{c.lastActive || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openViewModal(c)}
                            title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openEditModal(c)}
                            title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => confirmDelete(c.id)}
                            className="hover:bg-red-100 hover:text-red-600"
                            title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Página {currentPage} de {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Botón Anterior */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Números de página */}
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-2 text-slate-400 dark:text-slate-600">...</span>
                      ) : (
                        <Button
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => goToPage(Number(pageNum))}
                          className={`h-8 w-8 ${currentPage === pageNum ? 'bg-sanjer-green hover:bg-green-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Botón Siguiente */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {startItem}-{endItem} de {totalItems}
                </div>
              </div>

              {/* Navegación rápida (opcional) */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Primera
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(Math.max(1, currentPage - 5))}
                  disabled={currentPage <= 5}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  -5
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 5))}
                  disabled={currentPage >= totalPages - 4}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  +5
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Última
                </Button>
              </div>
            </div>
          )}
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
          onMedicalDataUpdated={fetchCollaborators}
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