import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Heart, Plus, Trash2, CheckCircle2, CalendarDays, Edit2, X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Colaborator {
  id: number;
  nombre: string;
  nivel_asignado: string;
  area: string;
}

interface RoutineTemplate {
  id: number;
  nombre: string;
  tipo_plan: 'bienestar' | 'dieta' | 'ejercicio';
  descripcion: string | null;
  rutina_detalle: string | null;
  is_active: boolean;
}

interface RoutineAssignment {
  id: number;
  tipo_plan: 'bienestar' | 'dieta' | 'ejercicio';
  fecha_asignacion: string;
  notas: string | null;
  is_active: boolean;
  routine?: {
    id: number;
    nombre: string;
    descripcion: string | null;
    rutina_detalle: string | null;
  };
}

interface ExerciseCatalogItem {
  id: number;
  nombre: string;
  grupo: string;
  nivel: 'Basico' | 'Intermedio' | 'Avanzado';
  tipo: 'Fuerza' | 'Cardio' | 'Movilidad' | 'Core';
  equipo: string;
  formula: string;
  is_active?: boolean;
}

interface FoodCatalogItem {
  id: number;
  alimento: string;
  categoria: 'Proteina' | 'Carbohidrato' | 'Grasa Saludable' | 'Vegetal' | 'Fruta' | 'Lacteo';
  porcion: string;
  recomendado_en: 'Desayuno' | 'Merienda AM' | 'Almuerzo' | 'Merienda PM' | 'Cena';
  is_active?: boolean;
}

interface GroupWorkoutAdminItem {
  id: number;
  title: string;
  description: string | null;
  status: 'open' | 'closed' | 'cancelled';
  planned_for: string | null;
  ended_at: string | null;
  coin_reward: number;
  participants_count: number;
  confirmed_count: number;
  total_coins_awarded: number;
  creator: {
    id: number | null;
    nombre: string | null;
  };
  participants: Array<{
    id: number;
    colaborator_id: number;
    nombre: string | null;
    joined_at: string | null;
    confirmed_at: string | null;
    reward_amount: number;
    rewarded_at: string | null;
  }>;
}

const TIPO_PLAN_LABEL: Record<'bienestar' | 'dieta' | 'ejercicio', string> = {
  bienestar: 'Bienestar',
  dieta: 'Dieta',
  ejercicio: 'Ejercicio',
};

const TIPO_PLAN_BADGE: Record<'bienestar' | 'dieta' | 'ejercicio', string> = {
  bienestar: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dieta: 'bg-amber-100 text-amber-700 border-amber-200',
  ejercicio: 'bg-blue-100 text-blue-700 border-blue-200',
};

const EXERCISE_LEVELS: Array<ExerciseCatalogItem['nivel']> = ['Basico', 'Intermedio', 'Avanzado'];
const EXERCISE_TYPES: Array<ExerciseCatalogItem['tipo']> = ['Fuerza', 'Cardio', 'Movilidad', 'Core'];
const FOOD_CATEGORIES: Array<FoodCatalogItem['categoria']> = ['Proteina', 'Carbohidrato', 'Grasa Saludable', 'Vegetal', 'Fruta', 'Lacteo'];
const FOOD_MEAL_TIMES: Array<FoodCatalogItem['recomendado_en']> = ['Desayuno', 'Merienda AM', 'Almuerzo', 'Merienda PM', 'Cena'];
const WEEK_DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const;

export default function WellnessPlans() {
  const { toast } = useToast();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [colaborators, setColaborators] = useState<Colaborator[]>([]);

  // Flujo de rutinas por colaborador
  const [routineType, setRoutineType] = useState<'dieta' | 'ejercicio'>('ejercicio');
  const [routineTemplates, setRoutineTemplates] = useState<RoutineTemplate[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [creatingRoutine, setCreatingRoutine] = useState(false);
  const [newRoutineForm, setNewRoutineForm] = useState({
    nombre: '',
    tipo_plan: 'ejercicio' as 'dieta' | 'ejercicio',
    descripcion: '',
    rutina_detalle: '',
    is_active: true,
  });

  const [collabSearch, setCollabSearch] = useState('');
  const [collabPage, setCollabPage] = useState(1);
  const collabPageSize = 6;
  const [selectedRoutineColabId, setSelectedRoutineColabId] = useState<string>('');
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignNotes, setAssignNotes] = useState('');
  const [assigningRoutine, setAssigningRoutine] = useState(false);

  const [routineAssignments, setRoutineAssignments] = useState<RoutineAssignment[]>([]);
  const [loadingRoutineAssignments, setLoadingRoutineAssignments] = useState(false);
  const [routineSearch, setRoutineSearch] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedWeekDay, setSelectedWeekDay] = useState<(typeof WEEK_DAYS)[number]>('Lunes');
  const [selectedMealTime, setSelectedMealTime] = useState<FoodCatalogItem['recomendado_en']>('Desayuno');
  const [quickScheduleText, setQuickScheduleText] = useState('');
  const [exercisePage, setExercisePage] = useState(1);
  const [foodPage, setFoodPage] = useState(1);
  const catalogPageSize = 10;

  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogItem[]>([]);
  const [foodCatalog, setFoodCatalog] = useState<FoodCatalogItem[]>([]);
  const [groupWorkouts, setGroupWorkouts] = useState<GroupWorkoutAdminItem[]>([]);
  const [loadingGroupWorkouts, setLoadingGroupWorkouts] = useState(false);

  const [savingExerciseCatalog, setSavingExerciseCatalog] = useState(false);
  const [savingFoodCatalog, setSavingFoodCatalog] = useState(false);
  const [editingExerciseCatalogId, setEditingExerciseCatalogId] = useState<number | null>(null);
  const [editingFoodCatalogId, setEditingFoodCatalogId] = useState<number | null>(null);

  const [newExerciseCatalogForm, setNewExerciseCatalogForm] = useState({
    nombre: '',
    grupo: '',
    nivel: 'Basico' as ExerciseCatalogItem['nivel'],
    tipo: 'Fuerza' as ExerciseCatalogItem['tipo'],
    equipo: '',
    formula: '',
  });

  const [newFoodCatalogForm, setNewFoodCatalogForm] = useState({
    alimento: '',
    categoria: 'Proteina' as FoodCatalogItem['categoria'],
    porcion: '',
    recomendado_en: 'Almuerzo' as FoodCatalogItem['recomendado_en'],
  });

  // ─── Load Data ──────────────────────────────────────────────────────────────

  const loadColaborators = async () => {
    try {
      const { data } = await api.get('/webadmin/colaborators');
      setColaborators(data.data || data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los colaboradores.', variant: 'destructive' });
    }
  };

  const loadRoutineTemplates = async (type: 'dieta' | 'ejercicio', searchText = '') => {
    setLoadingRoutines(true);
    try {
      const params = new URLSearchParams({ tipo_plan: type });
      if (searchText.trim()) {
        params.set('search', searchText.trim());
      }
      const { data } = await api.get(`/webadmin/wellness/routines?${params.toString()}`);
      setRoutineTemplates(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las rutinas.', variant: 'destructive' });
    } finally {
      setLoadingRoutines(false);
    }
  };

  const loadRoutineAssignments = async (colabId: string) => {
    if (!colabId) return;
    setLoadingRoutineAssignments(true);
    try {
      const { data } = await api.get(`/webadmin/wellness/routines/assignments/${colabId}`);
      setRoutineAssignments(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar historial de asignaciones.', variant: 'destructive' });
    } finally {
      setLoadingRoutineAssignments(false);
    }
  };

  const loadExerciseCatalog = async () => {
    try {
      const { data } = await api.get('/webadmin/wellness/catalog/exercises');
      setExerciseCatalog(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el catalogo de ejercicios.', variant: 'destructive' });
    }
  };

  const loadFoodCatalog = async () => {
    try {
      const { data } = await api.get('/webadmin/wellness/catalog/foods');
      setFoodCatalog(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el catalogo de alimentos.', variant: 'destructive' });
    }
  };

  const loadGroupWorkouts = async () => {
    setLoadingGroupWorkouts(true);
    try {
      const { data } = await api.get('/webadmin/wellness/group-workouts');
      setGroupWorkouts(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las actividades grupales.', variant: 'destructive' });
    } finally {
      setLoadingGroupWorkouts(false);
    }
  };

  useEffect(() => {
    loadColaborators();
    loadExerciseCatalog();
    loadFoodCatalog();
    loadGroupWorkouts();
  }, []);

  useEffect(() => {
    loadRoutineTemplates(routineType, routineSearch);
  }, [routineType, routineSearch]);

  useEffect(() => {
    if (selectedRoutineColabId) loadRoutineAssignments(selectedRoutineColabId);
    else setRoutineAssignments([]);
  }, [selectedRoutineColabId]);

  useEffect(() => {
    setExercisePage(1);
  }, [exerciseSearch]);

  useEffect(() => {
    setFoodPage(1);
  }, [foodSearch]);

  useEffect(() => {
    setExercisePage(1);
    setFoodPage(1);
  }, [routineType]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const createRoutineTemplate = async () => {
    if (!newRoutineForm.nombre.trim() || !newRoutineForm.rutina_detalle.trim()) {
      toast({ title: 'Campos incompletos', description: 'Ingresa nombre y detalle de rutina.', variant: 'destructive' });
      return;
    }

    setCreatingRoutine(true);
    try {
      if (editingRoutineId) {
        await api.put(`/webadmin/wellness/routines/${editingRoutineId}`, newRoutineForm);
        toast({ title: 'Rutina actualizada', description: 'Los cambios se guardaron correctamente.' });
      } else {
        await api.post('/webadmin/wellness/routines', newRoutineForm);
        toast({ title: '¡Rutina creada!', description: 'Ya puedes asignarla a colaboradores.' });
      }
      setNewRoutineForm({
        nombre: '',
        tipo_plan: routineType,
        descripcion: '',
        rutina_detalle: '',
        is_active: true,
      });
      setEditingRoutineId(null);
      await loadRoutineTemplates(routineType, routineSearch);
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear la rutina.', variant: 'destructive' });
    } finally {
      setCreatingRoutine(false);
    }
  };

  const startEditRoutine = (routine: RoutineTemplate) => {
    setEditingRoutineId(routine.id);
    setRoutineType(routine.tipo_plan === 'dieta' ? 'dieta' : 'ejercicio');
    setNewRoutineForm({
      nombre: routine.nombre,
      tipo_plan: routine.tipo_plan === 'dieta' ? 'dieta' : 'ejercicio',
      descripcion: routine.descripcion || '',
      rutina_detalle: routine.rutina_detalle || '',
      is_active: routine.is_active,
    });
  };

  const cancelEditRoutine = () => {
    setEditingRoutineId(null);
    setNewRoutineForm({
      nombre: '',
      tipo_plan: routineType,
      descripcion: '',
      rutina_detalle: '',
      is_active: true,
    });
  };

  const deactivateRoutine = async (routineId: number) => {
    if (!confirm('¿Desactivar esta rutina?')) return;
    try {
      await api.delete(`/webadmin/wellness/routines/${routineId}`);
      toast({ title: 'Rutina desactivada' });
      await loadRoutineTemplates(routineType, routineSearch);
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar la rutina.', variant: 'destructive' });
    }
  };

  const assignRoutineToCollaborator = async () => {
    if (!selectedRoutineColabId || !selectedRoutineId) {
      toast({ title: 'Campos incompletos', description: 'Selecciona colaborador y rutina.', variant: 'destructive' });
      return;
    }

    setAssigningRoutine(true);
    try {
      await api.post('/webadmin/wellness/routines/assign', {
        colaborator_id: Number(selectedRoutineColabId),
        wellness_routine_id: Number(selectedRoutineId),
        tipo_plan: routineType,
        fecha_asignacion: assignDate,
        notas: assignNotes || null,
      });
      toast({ title: '¡Asignación guardada!', description: 'La rutina ya fue asignada al colaborador.' });
      setSelectedRoutineId('');
      setAssignNotes('');
      await loadRoutineAssignments(selectedRoutineColabId);
    } catch {
      toast({ title: 'Error', description: 'No se pudo asignar la rutina.', variant: 'destructive' });
    } finally {
      setAssigningRoutine(false);
    }
  };

  const deactivateAssignment = async (assignmentId: number) => {
    if (!confirm('¿Desactivar esta asignación?')) return;
    try {
      await api.delete(`/webadmin/wellness/routines/assignments/${assignmentId}`);
      toast({ title: 'Asignación desactivada' });
      if (selectedRoutineColabId) {
        await loadRoutineAssignments(selectedRoutineColabId);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar la asignación.', variant: 'destructive' });
    }
  };

  const createExerciseCatalogItem = async () => {
    if (!newExerciseCatalogForm.nombre.trim() || !newExerciseCatalogForm.grupo.trim() || !newExerciseCatalogForm.formula.trim()) {
      toast({ title: 'Campos incompletos', description: 'Completa nombre, grupo y formula del ejercicio.', variant: 'destructive' });
      return;
    }

    setSavingExerciseCatalog(true);
    try {
      if (editingExerciseCatalogId) {
        await api.put(`/webadmin/wellness/catalog/exercises/${editingExerciseCatalogId}`, newExerciseCatalogForm);
        toast({ title: 'Ejercicio actualizado', description: 'Catalogo actualizado.' });
      } else {
        await api.post('/webadmin/wellness/catalog/exercises', newExerciseCatalogForm);
        toast({ title: 'Ejercicio agregado', description: 'Ya puedes usarlo para crear rutinas.' });
      }
      setNewExerciseCatalogForm({
        nombre: '',
        grupo: '',
        nivel: 'Basico',
        tipo: 'Fuerza',
        equipo: '',
        formula: '',
      });
      setEditingExerciseCatalogId(null);
      await loadExerciseCatalog();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el ejercicio.', variant: 'destructive' });
    } finally {
      setSavingExerciseCatalog(false);
    }
  };

  const createFoodCatalogItem = async () => {
    if (!newFoodCatalogForm.alimento.trim() || !newFoodCatalogForm.porcion.trim()) {
      toast({ title: 'Campos incompletos', description: 'Completa alimento y porcion.', variant: 'destructive' });
      return;
    }

    setSavingFoodCatalog(true);
    try {
      if (editingFoodCatalogId) {
        await api.put(`/webadmin/wellness/catalog/foods/${editingFoodCatalogId}`, newFoodCatalogForm);
        toast({ title: 'Alimento actualizado', description: 'Catalogo actualizado.' });
      } else {
        await api.post('/webadmin/wellness/catalog/foods', newFoodCatalogForm);
        toast({ title: 'Alimento agregado', description: 'Ya puedes usarlo para crear dietas.' });
      }
      setNewFoodCatalogForm({
        alimento: '',
        categoria: 'Proteina',
        porcion: '',
        recomendado_en: 'Almuerzo',
      });
      setEditingFoodCatalogId(null);
      await loadFoodCatalog();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el alimento.', variant: 'destructive' });
    } finally {
      setSavingFoodCatalog(false);
    }
  };

  const startEditExerciseCatalogItem = (item: ExerciseCatalogItem) => {
    setEditingExerciseCatalogId(item.id);
    setNewExerciseCatalogForm({
      nombre: item.nombre,
      grupo: item.grupo,
      nivel: item.nivel,
      tipo: item.tipo,
      equipo: item.equipo || '',
      formula: item.formula,
    });
  };

  const startEditFoodCatalogItem = (item: FoodCatalogItem) => {
    setEditingFoodCatalogId(item.id);
    setNewFoodCatalogForm({
      alimento: item.alimento,
      categoria: item.categoria,
      porcion: item.porcion,
      recomendado_en: item.recomendado_en,
    });
  };

  const deactivateExerciseCatalogItem = async (id: number) => {
    if (!confirm('¿Desactivar este ejercicio del catalogo?')) return;
    try {
      await api.delete(`/webadmin/wellness/catalog/exercises/${id}`);
      toast({ title: 'Ejercicio desactivado' });
      await loadExerciseCatalog();
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar el ejercicio.', variant: 'destructive' });
    }
  };

  const deactivateFoodCatalogItem = async (id: number) => {
    if (!confirm('¿Desactivar este alimento del catalogo?')) return;
    try {
      await api.delete(`/webadmin/wellness/catalog/foods/${id}`);
      toast({ title: 'Alimento desactivado' });
      await loadFoodCatalog();
    } catch {
      toast({ title: 'Error', description: 'No se pudo desactivar el alimento.', variant: 'destructive' });
    }
  };

  const appendExerciseToRoutine = (exercise: ExerciseCatalogItem) => {
    const line = `- ${exercise.nombre} (${exercise.grupo}) -> ${exercise.formula}`;
    setNewRoutineForm(prev => ({
      ...prev,
      rutina_detalle: prev.rutina_detalle.trim() ? `${prev.rutina_detalle}\n${line}` : line,
    }));
  };

  const appendFoodToRoutine = (food: FoodCatalogItem) => {
    const line = `- ${food.recomendado_en}: ${food.alimento} (${food.categoria}) -> porcion: ${food.porcion}`;
    setNewRoutineForm(prev => ({
      ...prev,
      rutina_detalle: prev.rutina_detalle.trim() ? `${prev.rutina_detalle}\n${line}` : line,
    }));
  };

  const appendChronologicalLine = () => {
    if (!quickScheduleText.trim()) {
      toast({ title: 'Falta detalle', description: 'Escribe la actividad o comida para ese dia.', variant: 'destructive' });
      return;
    }

    const line = routineType === 'dieta'
      ? `- ${selectedWeekDay} / ${selectedMealTime}: ${quickScheduleText.trim()}`
      : `- ${selectedWeekDay}: ${quickScheduleText.trim()}`;

    setNewRoutineForm(prev => ({
      ...prev,
      rutina_detalle: prev.rutina_detalle.trim() ? `${prev.rutina_detalle}\n${line}` : line,
    }));
    setQuickScheduleText('');
  };

  const insertWeeklyTemplate = () => {
    const template = routineType === 'dieta'
      ? [
          'SEMANA 1',
          'Lunes',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Martes',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Miercoles',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Jueves',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Viernes',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Sabado',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
          'Domingo',
          '  - Desayuno: ',
          '  - Merienda AM: ',
          '  - Almuerzo: ',
          '  - Merienda PM: ',
          '  - Cena: ',
        ].join('\n')
      : [
          'SEMANA 1',
          'Lunes: Fuerza tren inferior + core',
          'Martes: Cardio moderado',
          'Miercoles: Tren superior',
          'Jueves: Movilidad y recuperacion',
          'Viernes: Circuito funcional',
          'Sabado: Cardio largo',
          'Domingo: Descanso activo',
        ].join('\n');

    setNewRoutineForm(prev => ({
      ...prev,
      rutina_detalle: prev.rutina_detalle.trim() ? `${prev.rutina_detalle}\n\n${template}` : template,
    }));
  };

  // ─── Get all levels from plans ────────────────────────────────────────────
  const filteredCollabs = colaborators.filter(c => {
    const q = collabSearch.toLowerCase();
    return (
      (c.nombre || '').toLowerCase().includes(q)
      || (c.area || '').toLowerCase().includes(q)
      || (c.nivel_asignado || '').toLowerCase().includes(q)
    );
  });

  const totalCollabPages = Math.max(1, Math.ceil(filteredCollabs.length / collabPageSize));
  const currentCollabPage = Math.min(collabPage, totalCollabPages);
  const paginatedCollabs = filteredCollabs.slice(
    (currentCollabPage - 1) * collabPageSize,
    currentCollabPage * collabPageSize
  );

  const selectedRoutineColab = colaborators.find(c => c.id.toString() === selectedRoutineColabId);
  const filteredExercises = exerciseCatalog.filter(ex => {
    const q = exerciseSearch.toLowerCase();
    return (
      ex.nombre.toLowerCase().includes(q)
      || ex.grupo.toLowerCase().includes(q)
      || ex.tipo.toLowerCase().includes(q)
      || ex.nivel.toLowerCase().includes(q)
    );
  });

  const filteredFoods = foodCatalog.filter(food => {
    const q = foodSearch.toLowerCase();
    return (
      food.alimento.toLowerCase().includes(q)
      || food.categoria.toLowerCase().includes(q)
      || food.recomendado_en.toLowerCase().includes(q)
      || food.porcion.toLowerCase().includes(q)
    );
  });

  const totalExercisePages = Math.max(1, Math.ceil(filteredExercises.length / catalogPageSize));
  const currentExercisePage = Math.min(exercisePage, totalExercisePages);
  const paginatedExercises = filteredExercises.slice(
    (currentExercisePage - 1) * catalogPageSize,
    currentExercisePage * catalogPageSize
  );

  const totalFoodPages = Math.max(1, Math.ceil(filteredFoods.length / catalogPageSize));
  const currentFoodPage = Math.min(foodPage, totalFoodPages);
  const paginatedFoods = filteredFoods.slice(
    (currentFoodPage - 1) * catalogPageSize,
    currentFoodPage * catalogPageSize
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AdminHeader title="Planes de Bienestar" />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* HEADER INFO */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100">
            <Heart className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestión de Planes de Bienestar</h1>
            <p className="text-sm text-muted-foreground">
              Vista de Creación simplificada: crea rutinas y asígnalas por colaborador.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="default" disabled>
            Vista de Creación
          </Button>
        </div>

        {/* ─── SECCIÓN 3: Asignación de Rutinas (Dieta / Ejercicio) ────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-violet-500" />
              Asignación de Rutinas por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
                <h3 className="text-sm font-semibold">1) Crear rutina base</h3>
                {editingRoutineId && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center justify-between">
                    <span>Editando rutina existente</span>
                    <Button size="sm" variant="ghost" onClick={cancelEditRoutine}>
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancelar edición
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                    <Select
                      value={routineType}
                      onValueChange={(v) => {
                        const t = v as 'dieta' | 'ejercicio';
                        setRoutineType(t);
                        setNewRoutineForm(f => ({ ...f, tipo_plan: t }));
                      }}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ejercicio">Ejercicio</SelectItem>
                        <SelectItem value="dieta">Dieta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nombre rutina</label>
                    <Input
                      className="mt-1"
                      value={newRoutineForm.nombre}
                      onChange={e => setNewRoutineForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Ej: Rutina HIIT Inicial"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Descripción</label>
                  <Textarea
                    rows={2}
                    className="mt-1"
                    value={newRoutineForm.descripcion}
                    onChange={e => setNewRoutineForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Objetivo general de la rutina"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Detalle de ejecución</label>
                  <Textarea
                    rows={4}
                    className="mt-1 font-mono text-sm"
                    value={newRoutineForm.rutina_detalle}
                    onChange={e => setNewRoutineForm(f => ({ ...f, rutina_detalle: e.target.value }))}
                    placeholder={routineType === 'ejercicio'
                      ? 'Día 1: movilidad 10 min\nDía 2: fuerza tren inferior 4x12\nDía 3: cardio 25 min...'
                      : 'Desayuno: avena + fruta\nAlmuerzo: proteína + verduras\nCena: ligera y baja en grasa...'}
                  />
                </div>

                <div className="border rounded-lg p-3 bg-background space-y-2">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <p className="text-xs font-semibold">Cronograma por dias</p>
                    <Button size="sm" variant="outline" onClick={insertWeeklyTemplate}>
                      Insertar plantilla semanal
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Select value={selectedWeekDay} onValueChange={v => setSelectedWeekDay(v as (typeof WEEK_DAYS)[number])}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEEK_DAYS.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {routineType === 'dieta' ? (
                      <Select value={selectedMealTime} onValueChange={v => setSelectedMealTime(v as FoodCatalogItem['recomendado_en'])}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FOOD_MEAL_TIMES.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="h-8"
                        value="Actividad"
                        disabled
                      />
                    )}

                    <Input
                      className="h-8 md:col-span-2"
                      value={quickScheduleText}
                      onChange={e => setQuickScheduleText(e.target.value)}
                      placeholder={routineType === 'dieta' ? 'Ej: Pollo con arroz y ensalada' : 'Ej: Fuerza tren superior 4x12'}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={appendChronologicalLine}>Agregar al detalle</Button>
                  </div>
                </div>

                {routineType === 'ejercicio' && (
                  <div className="space-y-2 border rounded-lg p-3 bg-background">
                    <p className="text-xs font-semibold">Crear nuevo ejercicio (catalogo)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={newExerciseCatalogForm.nombre}
                        onChange={e => setNewExerciseCatalogForm(f => ({ ...f, nombre: e.target.value }))}
                        placeholder="Nombre del ejercicio"
                        className="h-8"
                      />
                      <Input
                        value={newExerciseCatalogForm.grupo}
                        onChange={e => setNewExerciseCatalogForm(f => ({ ...f, grupo: e.target.value }))}
                        placeholder="Grupo muscular (ej: Pierna)"
                        className="h-8"
                      />
                      <Select
                        value={newExerciseCatalogForm.nivel}
                        onValueChange={v => setNewExerciseCatalogForm(f => ({ ...f, nivel: v as ExerciseCatalogItem['nivel'] }))}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXERCISE_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newExerciseCatalogForm.tipo}
                        onValueChange={v => setNewExerciseCatalogForm(f => ({ ...f, tipo: v as ExerciseCatalogItem['tipo'] }))}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXERCISE_TYPES.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={newExerciseCatalogForm.equipo}
                        onChange={e => setNewExerciseCatalogForm(f => ({ ...f, equipo: e.target.value }))}
                        placeholder="Equipo (opcional)"
                        className="h-8"
                      />
                      <Input
                        value={newExerciseCatalogForm.formula}
                        onChange={e => setNewExerciseCatalogForm(f => ({ ...f, formula: e.target.value }))}
                        placeholder="Formula (ej: 4 series x 12 repeticiones)"
                        className="h-8"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={createExerciseCatalogItem} disabled={savingExerciseCatalog}>
                        {savingExerciseCatalog ? 'Guardando...' : 'Guardar nuevo ejercicio'}
                      </Button>
                    </div>

                    <div className="h-px bg-border my-2" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">Tabla de ejercicios para seleccionar</p>
                      <span className="text-[11px] text-muted-foreground">{filteredExercises.length} ejercicios</span>
                    </div>
                    <Input
                      value={exerciseSearch}
                      onChange={e => setExerciseSearch(e.target.value)}
                      placeholder="Buscar por nombre, grupo, nivel o tipo..."
                      className="h-8"
                    />
                    <div className="overflow-x-auto border rounded-md max-h-52">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left px-2 py-1.5">Ejercicio</th>
                            <th className="text-left px-2 py-1.5">Grupo</th>
                            <th className="text-left px-2 py-1.5">Nivel</th>
                            <th className="text-left px-2 py-1.5">Formula</th>
                            <th className="text-right px-2 py-1.5">Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedExercises.map(ex => (
                            <tr key={ex.id} className="border-t">
                              <td className="px-2 py-1.5 font-medium">{ex.nombre}</td>
                              <td className="px-2 py-1.5">{ex.grupo}</td>
                              <td className="px-2 py-1.5">{ex.nivel}</td>
                              <td className="px-2 py-1.5">{ex.formula}</td>
                              <td className="px-2 py-1.5 text-right">
                                <Button size="sm" variant="outline" onClick={() => appendExerciseToRoutine(ex)}>
                                  Agregar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Página {currentExercisePage} de {totalExercisePages}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setExercisePage(p => Math.max(1, p - 1))} disabled={currentExercisePage === 1}>
                          Anterior
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setExercisePage(p => Math.min(totalExercisePages, p + 1))} disabled={currentExercisePage === totalExercisePages}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {routineType === 'dieta' && (
                  <div className="space-y-2 border rounded-lg p-3 bg-background">
                    <p className="text-xs font-semibold">Crear nuevo alimento (catalogo)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={newFoodCatalogForm.alimento}
                        onChange={e => setNewFoodCatalogForm(f => ({ ...f, alimento: e.target.value }))}
                        placeholder="Nombre del alimento"
                        className="h-8"
                      />
                      <Input
                        value={newFoodCatalogForm.porcion}
                        onChange={e => setNewFoodCatalogForm(f => ({ ...f, porcion: e.target.value }))}
                        placeholder="Porcion (ej: 120 g o 1 taza)"
                        className="h-8"
                      />
                      <Select
                        value={newFoodCatalogForm.categoria}
                        onValueChange={v => setNewFoodCatalogForm(f => ({ ...f, categoria: v as FoodCatalogItem['categoria'] }))}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FOOD_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newFoodCatalogForm.recomendado_en}
                        onValueChange={v => setNewFoodCatalogForm(f => ({ ...f, recomendado_en: v as FoodCatalogItem['recomendado_en'] }))}
                      >
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FOOD_MEAL_TIMES.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={createFoodCatalogItem} disabled={savingFoodCatalog}>
                        {savingFoodCatalog ? 'Guardando...' : 'Guardar nuevo alimento'}
                      </Button>
                    </div>

                    <div className="h-px bg-border my-2" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">Tabla de alimentos para seleccionar</p>
                      <span className="text-[11px] text-muted-foreground">{filteredFoods.length} alimentos</span>
                    </div>
                    <Input
                      value={foodSearch}
                      onChange={e => setFoodSearch(e.target.value)}
                      placeholder="Buscar por alimento, categoria o tiempo de comida..."
                      className="h-8"
                    />
                    <div className="overflow-x-auto border rounded-md max-h-52">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left px-2 py-1.5">Alimento</th>
                            <th className="text-left px-2 py-1.5">Categoria</th>
                            <th className="text-left px-2 py-1.5">Porcion</th>
                            <th className="text-left px-2 py-1.5">Tiempo</th>
                            <th className="text-right px-2 py-1.5">Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedFoods.map(food => (
                            <tr key={food.id} className="border-t">
                              <td className="px-2 py-1.5 font-medium">{food.alimento}</td>
                              <td className="px-2 py-1.5">{food.categoria}</td>
                              <td className="px-2 py-1.5">{food.porcion}</td>
                              <td className="px-2 py-1.5">{food.recomendado_en}</td>
                              <td className="px-2 py-1.5 text-right">
                                <Button size="sm" variant="outline" onClick={() => appendFoodToRoutine(food)}>
                                  Agregar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Página {currentFoodPage} de {totalFoodPages}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setFoodPage(p => Math.max(1, p - 1))} disabled={currentFoodPage === 1}>
                          Anterior
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setFoodPage(p => Math.min(totalFoodPages, p + 1))} disabled={currentFoodPage === totalFoodPages}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={createRoutineTemplate} disabled={creatingRoutine}>
                    <Plus className="h-4 w-4 mr-1" />
                    {creatingRoutine ? 'Guardando...' : editingRoutineId ? 'Actualizar rutina' : 'Guardar rutina base'}
                  </Button>
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-background space-y-3">
                <h3 className="text-sm font-semibold">2) Rutinas disponibles ({routineType})</h3>
                <Input
                  value={routineSearch}
                  onChange={e => setRoutineSearch(e.target.value)}
                  placeholder="Filtrar por nombre, descripción o detalle..."
                  className="h-8"
                />
                {loadingRoutines ? (
                  <p className="text-sm text-muted-foreground">Cargando rutinas...</p>
                ) : routineTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay rutinas de este tipo.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {routineTemplates.map(r => (
                      <div key={r.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{r.nombre}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={TIPO_PLAN_BADGE[r.tipo_plan]}>
                              {TIPO_PLAN_LABEL[r.tipo_plan]}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => startEditRoutine(r)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deactivateRoutine(r.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {r.descripcion && <p className="text-xs text-muted-foreground mt-1">{r.descripcion}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">3) Seleccionar colaborador (tabla paginada)</h3>
                <Input
                  value={collabSearch}
                  onChange={e => {
                    setCollabSearch(e.target.value);
                    setCollabPage(1);
                  }}
                  placeholder="Buscar por nombre, área o nivel..."
                />

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2">Colaborador</th>
                        <th className="text-left px-3 py-2">Área</th>
                        <th className="text-left px-3 py-2">Nivel</th>
                        <th className="text-right px-3 py-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCollabs.map(c => (
                        <tr key={c.id} className="border-t">
                          <td className="px-3 py-2">{c.nombre}</td>
                          <td className="px-3 py-2">{c.area || 'N/A'}</td>
                          <td className="px-3 py-2">{c.nivel_asignado || 'N/A'}</td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              size="sm"
                              variant={selectedRoutineColabId === c.id.toString() ? 'default' : 'outline'}
                              onClick={() => setSelectedRoutineColabId(c.id.toString())}
                            >
                              {selectedRoutineColabId === c.id.toString() ? 'Seleccionado' : 'Seleccionar'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Página {currentCollabPage} de {totalCollabPages}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCollabPage(p => Math.max(1, p - 1))} disabled={currentCollabPage === 1}>Anterior</Button>
                    <Button size="sm" variant="outline" onClick={() => setCollabPage(p => Math.min(totalCollabPages, p + 1))} disabled={currentCollabPage === totalCollabPages}>Siguiente</Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">4) Asignar rutina seleccionada</h3>
                <p className="text-xs text-muted-foreground">
                  Colaborador: <span className="font-semibold text-foreground">{selectedRoutineColab?.nombre || 'Sin seleccionar'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Puedes asignar 1 rutina activa de dieta y 1 rutina activa de ejercicio al mismo colaborador.
                </p>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Rutina</label>
                  <Select value={selectedRoutineId} onValueChange={setSelectedRoutineId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecciona una rutina" /></SelectTrigger>
                    <SelectContent>
                      {routineTemplates.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fecha de asignación</label>
                  <Input type="date" className="mt-1" value={assignDate} onChange={e => setAssignDate(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Notas</label>
                  <Textarea rows={2} className="mt-1" value={assignNotes} onChange={e => setAssignNotes(e.target.value)} />
                </div>

                <div className="flex justify-end">
                  <Button onClick={assignRoutineToCollaborator} disabled={assigningRoutine || !selectedRoutineColabId || !selectedRoutineId}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {assigningRoutine ? 'Asignando...' : 'Asignar rutina'}
                  </Button>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-xs font-semibold mb-2">Historial de asignaciones</h4>
                  {loadingRoutineAssignments ? (
                    <p className="text-xs text-muted-foreground">Cargando historial...</p>
                  ) : routineAssignments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin asignaciones para este colaborador.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {routineAssignments.map(a => (
                        <div key={a.id} className="border rounded-lg p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{a.routine?.nombre || 'Rutina'}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={a.is_active ? 'default' : 'outline'}>
                                {a.is_active ? 'Activa' : 'Inactiva'}
                              </Badge>
                              {a.is_active && (
                                <Button size="sm" variant="ghost" onClick={() => deactivateAssignment(a.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{a.tipo_plan} - {a.fecha_asignacion}</p>
                          {a.notas && <p className="text-xs mt-1">{a.notas}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Actividades Grupales y Monedas Entregadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGroupWorkouts ? (
              <p className="text-sm text-muted-foreground">Cargando actividades grupales...</p>
            ) : groupWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aun no hay actividades grupales registradas.</p>
            ) : (
              <div className="space-y-3">
                {groupWorkouts.map(item => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge variant={item.status === 'open' ? 'default' : 'outline'}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creador: <span className="font-medium text-foreground">{item.creator?.nombre || 'N/A'}</span>
                      {' · '}Participantes confirmados: {item.confirmed_count}/{item.participants_count}
                      {' · '}Monedas por confirmado: {item.coin_reward}
                      {' · '}Total otorgado: {item.total_coins_awarded}
                    </p>
                    {!!item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}

                    <div className="overflow-x-auto border rounded-md">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-2 py-1.5">Colaborador</th>
                            <th className="text-left px-2 py-1.5">Se unio</th>
                            <th className="text-left px-2 py-1.5">Confirmo</th>
                            <th className="text-right px-2 py-1.5">Monedas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.participants.map(p => (
                            <tr key={p.id} className="border-t">
                              <td className="px-2 py-1.5">{p.nombre || 'N/A'}</td>
                              <td className="px-2 py-1.5">{p.joined_at || '-'}</td>
                              <td className="px-2 py-1.5">{p.confirmed_at || '-'}</td>
                              <td className="px-2 py-1.5 text-right font-medium">{p.reward_amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
