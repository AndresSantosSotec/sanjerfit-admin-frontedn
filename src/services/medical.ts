import { api } from '@/services/api';
import type {
  CollaboratorMedicalInfo,
  AdminMedicalRecord,
  AdminWeightLog,
} from '@/types/medical';

export async function fetchCollaboratorMedicalInfo(colaboratorId: string | number): Promise<CollaboratorMedicalInfo> {
  const { data } = await api.get(`/webadmin/medical/${colaboratorId}`);
  return data.data;
}

export async function updateCollaboratorMedicalRecord(
  colaboratorId: string | number,
  payload: Pick<AdminMedicalRecord, 'estado_inmunizacion' | 'historial_vacunacion' | 'historial_medico'>
): Promise<AdminMedicalRecord> {
  const { data } = await api.put(`/webadmin/medical/${colaboratorId}`, payload);
  return data.data;
}

export async function addCollaboratorWeightLog(
  colaboratorId: string | number,
  payload: Pick<AdminWeightLog, 'peso' | 'fecha_registro'>
): Promise<AdminWeightLog> {
  const { data } = await api.post(`/webadmin/medical/${colaboratorId}/weight`, payload);
  return data.data;
}

export async function deleteCollaboratorWeightLog(weightLogId: string | number): Promise<void> {
  await api.delete(`/webadmin/medical/weight/${weightLogId}`);
}
