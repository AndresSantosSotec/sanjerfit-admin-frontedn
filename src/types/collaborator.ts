
export interface Collaborator {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  level: 'KoalaFit' | 'JaguarFit' | 'HalconFit';
  status: 'Activo' | 'Inactivo';
  photo: string;
  address: string;
  occupation: string;
  weight: number;
  height: number;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  bmi: string;
  coinFits: number;
  lastActive: string;
  imcObjective?: number;
  weightObjective?: number;
  password?: string;
  passwordConfirmation?: string;
}
