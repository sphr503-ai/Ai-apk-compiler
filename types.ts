
export enum SystemStatus {
  IDLE = 'IDLE',
  PROVISIONING = 'PROVISIONING',
  ANALYZING = 'ANALYZING',
  BUILDING = 'BUILDING',
  SELF_HEALING = 'SELF_HEALING',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'ai';
}

export interface ProvisioningState {
  java: boolean;
  androidStudio: boolean;
  sdk: boolean;
  avd: boolean;
}

export interface ProjectInfo {
  name: string;
  language: 'Java' | 'Kotlin' | 'Unknown';
  gradleCompatible: boolean;
}
