
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2 } from 'lucide-react';
import { Collaborator } from '@/types/collaborator';
import {
  addCollaboratorWeightLog,
  deleteCollaboratorWeightLog,
  fetchCollaboratorMedicalInfo,
  updateCollaboratorMedicalRecord,
} from '@/services/medical';
import type { AdminWeightLog } from '@/types/medical';

interface CollaboratorViewProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator;
  onMedicalDataUpdated?: () => void | Promise<void>;
}

export const CollaboratorView = ({ isOpen, onClose, collaborator, onMedicalDataUpdated }: CollaboratorViewProps) => {
  const [medicalLoading, setMedicalLoading] = useState(false);
  const [medicalError, setMedicalError] = useState<string | null>(null);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  const [deletingWeightId, setDeletingWeightId] = useState<number | null>(null);

  const [estadoInmunizacion, setEstadoInmunizacion] = useState('Incompleto');
  const [historialVacunacion, setHistorialVacunacion] = useState('');
  const [historialMedico, setHistorialMedico] = useState('');
  const [weightHistory, setWeightHistory] = useState<AdminWeightLog[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  const loadMedicalInfo = async () => {
    setMedicalLoading(true);
    setMedicalError(null);
    try {
      const data = await fetchCollaboratorMedicalInfo(collaborator.id);
      setEstadoInmunizacion(data.record.estado_inmunizacion || 'Incompleto');
      setHistorialVacunacion(data.record.historial_vacunacion || '');
      setHistorialMedico(data.record.historial_medico || '');
      setWeightHistory(data.weight_history || []);
    } catch (error: any) {
      setMedicalError(error?.response?.data?.message || 'No se pudo cargar la información médica.');
    } finally {
      setMedicalLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedicalInfo();
    }
  }, [isOpen, collaborator.id]);

  const latestWeight = useMemo(() => {
    if (!weightHistory.length) return null;
    const sorted = [...weightHistory].sort((a, b) => a.fecha_registro.localeCompare(b.fecha_registro));
    return sorted[sorted.length - 1];
  }, [weightHistory]);

  const currentWeight = latestWeight ? Number(latestWeight.peso) : Number(collaborator.weight);
  const currentImc = latestWeight?.imc != null ? Number(latestWeight.imc) : Number(collaborator.bmi);

  const chartData = useMemo(
    () =>
      [...weightHistory]
        .sort((a, b) => a.fecha_registro.localeCompare(b.fecha_registro))
        .map(item => ({
          fecha: item.fecha_registro.slice(5),
          peso: Number(item.peso),
          imc: item.imc != null ? Number(item.imc) : null,
        })),
    [weightHistory]
  );

  const handleSaveRecord = async () => {
    setSavingRecord(true);
    try {
      await updateCollaboratorMedicalRecord(collaborator.id, {
        estado_inmunizacion: estadoInmunizacion,
        historial_vacunacion: historialVacunacion,
        historial_medico: historialMedico,
      });
      await loadMedicalInfo();
      await onMedicalDataUpdated?.();
    } catch (error: any) {
      setMedicalError(error?.response?.data?.message || 'No se pudo guardar la ficha médica.');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleAddWeight = async () => {
    const parsedWeight = Number(newWeight);
    if (!parsedWeight || parsedWeight < 10 || parsedWeight > 500) {
      setMedicalError('El peso debe estar entre 10 y 500.');
      return;
    }
    if (!newWeightDate) {
      setMedicalError('La fecha de registro es obligatoria.');
      return;
    }

    setSavingWeight(true);
    setMedicalError(null);
    try {
      await addCollaboratorWeightLog(collaborator.id, {
        peso: parsedWeight,
        fecha_registro: newWeightDate,
      });
      setNewWeight('');
      await loadMedicalInfo();
      await onMedicalDataUpdated?.();
    } catch (error: any) {
      setMedicalError(error?.response?.data?.message || 'No se pudo registrar el control de peso.');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (weightLogId: number) => {
    const shouldDelete = window.confirm('Deseas eliminar este registro de peso?');
    if (!shouldDelete) return;

    setDeletingWeightId(weightLogId);
    setMedicalError(null);
    try {
      await deleteCollaboratorWeightLog(weightLogId);
      await loadMedicalInfo();
      await onMedicalDataUpdated?.();
    } catch (error: any) {
      setMedicalError(error?.response?.data?.message || 'No se pudo eliminar el registro de peso.');
    } finally {
      setDeletingWeightId(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HalconFit':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'JaguarFit':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'KoalaFit':
      default:
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Colaborador</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6">
          {/* Header with photo and basic info */}
          <div className="flex items-start space-x-4 pb-4 border-b">
            <Avatar className="w-24 h-24">
              {collaborator.photo ? (
                <AvatarImage src={collaborator.photo} alt={collaborator.name} />
              ) : (
                <AvatarFallback className="text-3xl">
                  {collaborator.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{collaborator.name}</h3>
              {collaborator.nickname && (
                <p className="text-sm text-gray-500">Alias: {collaborator.nickname}</p>
              )}
              <p className="text-gray-500">{collaborator.email}</p>
              <p className="text-sm text-gray-500">{collaborator.occupation}</p>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={collaborator.status === 'Activo' ? 'default' : 'secondary'}>
                  {collaborator.status}
                </Badge>
                <Badge className={getLevelColor(collaborator.level)}>
                  {collaborator.level}
                </Badge>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-sanjer-green">{collaborator.coinFits}</div>
              <div className="text-xs text-gray-500">CoinFits</div>
            </div>
          </div>
          
          {/* Information sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h4 className="font-medium mb-3 text-gray-600">Información Personal</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Área:</span>
                  <span className="col-span-2">{collaborator.area}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Nacimiento:</span>
                  <span className="col-span-2">{collaborator.birthDate || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Edad:</span>
                  <span className="col-span-2">{collaborator.age ?? 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Teléfono:</span>
                  <span className="col-span-2">{collaborator.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Dirección:</span>
                  <span className="col-span-2">{collaborator.address}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Ingreso:</span>
                  <span className="col-span-2">{collaborator.hireDate || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Antigüedad:</span>
                  <span className="col-span-2">
                    {collaborator.yearsAtInstitution != null
                      ? `${collaborator.yearsAtInstitution} años`
                      : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Última Actividad:</span>
                  <span className="col-span-2">{collaborator.lastActive}</span>
                </div>
              </div>
            </div>
            
            {/* Medical Information */}
            <div>
              <h4 className="font-medium mb-3 text-gray-600">Información Médica</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Altura:</span>
                  <span className="col-span-2">{collaborator.height} cm</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Peso:</span>
                  <span className="col-span-2">{Number.isFinite(currentWeight) ? currentWeight : collaborator.weight} kg</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">IMC:</span>
                  <span className="col-span-2">{Number.isFinite(currentImc) ? currentImc : collaborator.bmi}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Inmunización:</span>
                  <span className="col-span-2">{estadoInmunizacion || 'Incompleto'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Tipo Sangre:</span>
                  <span className="col-span-2">{collaborator.bloodType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 text-sm">Ultimo peso:</span>
                  <span className="col-span-2">
                    {latestWeight ? `${latestWeight.peso} kg (${latestWeight.fecha_registro})` : 'Sin registros'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha medica anual y control de peso */}
          <div className="space-y-4 border rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium text-gray-700">Ficha Medica Anual y Control de Peso</h4>
              {medicalLoading && <span className="text-xs text-gray-500">Cargando...</span>}
            </div>

            {medicalError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {medicalError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant={estadoInmunizacion === 'Completo' ? 'default' : 'outline'}
                onClick={() => setEstadoInmunizacion('Completo')}
              >
                Inmunizacion Completa
              </Button>
              <Button
                type="button"
                variant={estadoInmunizacion === 'Incompleto' ? 'default' : 'outline'}
                onClick={() => setEstadoInmunizacion('Incompleto')}
              >
                Inmunizacion Incompleta
              </Button>
              <Button type="button" onClick={handleSaveRecord} disabled={savingRecord || medicalLoading}>
                {savingRecord ? 'Guardando...' : 'Guardar ficha'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Historial de vacunacion</label>
                <Textarea
                  value={historialVacunacion}
                  onChange={e => setHistorialVacunacion(e.target.value)}
                  placeholder="Ej: Influenza, Tetanos, COVID-19"
                  className="min-h-[96px] bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Historial medico</label>
                <Textarea
                  value={historialMedico}
                  onChange={e => setHistorialMedico(e.target.value)}
                  placeholder="Alergias, condiciones cronicas, observaciones"
                  className="min-h-[96px] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-lg p-3 bg-white">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-gray-600">Nuevo peso (kg)</label>
                <Input
                  type="number"
                  min="10"
                  max="500"
                  step="0.1"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="Ej: 72.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Fecha registro</label>
                <Input
                  type="date"
                  value={newWeightDate}
                  onChange={e => setNewWeightDate(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleAddWeight} disabled={savingWeight || medicalLoading}>
                {savingWeight ? 'Guardando...' : 'Registrar peso'}
              </Button>
            </div>

            {chartData.length > 0 ? (
              <div className="h-[240px] rounded-lg border bg-white p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: -6, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Peso (kg)" />
                    <Line type="monotone" dataKey="imc" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="IMC" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-gray-500 bg-white">
                Sin historial de peso registrado.
              </div>
            )}

            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="grid grid-cols-4 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                <span>Fecha</span>
                <span>Peso (kg)</span>
                <span>IMC</span>
                <span className="text-right">Accion</span>
              </div>
              {weightHistory.length > 0 ? (
                [...weightHistory]
                  .sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro))
                  .slice(0, 12)
                  .map(item => (
                    <div key={item.id} className="grid grid-cols-4 items-center px-3 py-2 border-t text-sm">
                      <span>{item.fecha_registro}</span>
                      <span>{item.peso}</span>
                      <span>{item.imc ?? 'N/A'}</span>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWeight(item.id)}
                          disabled={deletingWeightId === item.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500">No hay registros de peso.</div>
              )}
            </div>
          </div>
          
          {/* Additional Information */}
          <div>
            <h4 className="font-medium mb-3 text-gray-600">Información Adicional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500 text-sm">Alergias:</span>
                <p>{collaborator.allergies || "Ninguna registrada"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500 text-sm">Padecimientos:</span>
                <p>{collaborator.medicalConditions || "Ninguno registrado"}</p>
              </div>
            </div>
          </div>
          
          {/* Level information */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium mb-2 text-blue-800">Información de Nivel: {collaborator.level}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collaborator.level === 'KoalaFit' && (
                <div className="border-l-4 border-purple-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>3,000 pasos</li>
                    <li>20 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
              
              {collaborator.level === 'JaguarFit' && (
                <div className="border-l-4 border-blue-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>6,000 pasos</li>
                    <li>30 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
              
              {collaborator.level === 'HalconFit' && (
                <div className="border-l-4 border-green-400 pl-3">
                  <p className="text-sm">Metas Diarias:</p>
                  <ul className="text-xs list-disc list-inside text-gray-700">
                    <li>10,000 pasos</li>
                    <li>45 minutos activos</li>
                    <li>10 CoinFits por día</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
