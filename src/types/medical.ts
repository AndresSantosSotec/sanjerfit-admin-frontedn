export interface AdminMedicalRecord {
  id: number;
  colaborator_id: number;
  estado_inmunizacion: string | null;
  historial_vacunacion: string | null;
  historial_medico: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminWeightLog {
  id: number;
  colaborator_id: number;
  peso: number;
  imc: number | null;
  fecha_registro: string;
  recorded_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CollaboratorMedicalInfo {
  record: AdminMedicalRecord;
  weight_history: AdminWeightLog[];
}
