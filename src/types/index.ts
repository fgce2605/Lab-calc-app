export type UserRole = 'operator' | 'supervisor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  employeeId: string;
  avatarUrl?: string;
  department: string;
}

export type CalcType =
  | 'nco'
  | 'acid_value'
  | 'karl_fischer'
  | 'hplc'
  | 'viscosity'
  | 'hydroxyl'
  | 'nvm'
  | 'specific_gravity'
  | 'gel_time';

export interface CalcInfo {
  id: CalcType;
  name: string;
  shortName: string;
  symbol: string;
  unit: string;
  category: 'Chemical' | 'Physical' | 'Thermal/Kinetic' | 'Analytical';
  description: string;
  formulaDisplay: string;
  iconName: string;
  defaultMin: number;
  defaultMax: number;
  gaugeMin: number;
  gaugeMax: number;
}

export interface ViscositySpindleFactor {
  spindle: string; // e.g. 'LV-1', 'LV-2', 'RV-3'
  rpm: number;     // e.g. 6, 12, 30, 60
  factor: number;  // Multiplier for Brookfield dial reading
}

export interface ResinSpecification {
  id: string;
  gradeName: string; // e.g. "Epoxy Resin E-12", "Polyol P-2000"
  category: string;  // e.g. "Epoxy", "Polyurethane", "Alkyd", "Acrylic"
  specs: {
    [key in CalcType]?: {
      min: number;
      max: number;
      unit: string;
    };
  };
}

export interface TestResult {
  id: string;
  batchId: string;
  calcType: CalcType;
  calcName: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  inputs: Record<string, number | string>;
  resultValue: number;
  resultFormatted: string;
  unit: string;
  specMin?: number;
  specMax?: number;
  isPass: boolean;
  notes?: string;
}

export interface Batch {
  id: string; // e.g. "BAT-2026-0801"
  sampleName: string;
  resinGradeId: string;
  resinGradeName: string;
  lotNumber: string;
  quantityKg: number;
  createdAt: string;
  updatedAt: string;
  operatorId: string;
  operatorName: string;
  status: 'in_progress' | 'passed' | 'failed' | 'pending_approval';
  photoUrl?: string;
  notes?: string;
  supervisorNotes?: string;
  supervisorApprovedBy?: string;
  testResults: TestResult[];
}

export interface QualityAlert {
  id: string;
  batchId: string;
  calcType: CalcType;
  message: string;
  timestamp: string;
  severity: 'warning' | 'critical';
}
