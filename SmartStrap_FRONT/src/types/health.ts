export type Severity = 'info' | 'warning' | 'critical';

export interface Diagnosis {
  status: string;
  message: string;
  severity: Severity;
}

export interface HealthData {
  bpm: number;
  spo2: number;
  rpm: number;
  ir: number;
  stateLabel: string;
}

export interface WSResponse {
  type: 'SENSOR_DATA';
  healthData: HealthData;
  diagnosis?: Diagnosis;
}