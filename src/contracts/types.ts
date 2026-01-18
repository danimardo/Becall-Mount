export interface AppSettings {
  theme: "light" | "dark" | "system";
  rclonePath: string;
  firstRun: boolean;
  passwordHash?: string;
}

export interface MountState {
  serviceName: string;
  driveLetter: string;
  pid: number;
  startTime: string;
  status: "mounted" | "error" | "unmounted";
}

export type ServiceType = 'b2' | 's3' | 'drive' | 'dropbox' | 'other';

export interface Service {
  name: string;
  type: ServiceType;
  icon?: string;
  isMounted: boolean;
  mountPoint?: string;
}

export interface MountConfig {
  serviceName: string;
  driveLetter: string;
  subPath?: string;
}

export interface AppState {
  isAuthenticated: boolean;
  isRcloneInstalled: boolean;
  isWinFspInstalled: boolean;
  services: Service[];
  activeMounts: MountConfig[];
}

// Tipos para el esquema de configuración de remotos
export type RemoteFieldType = 'string' | 'number' | 'boolean';

export interface RemoteFieldConfig {
  label?: string;
  type?: RemoteFieldType;
  required?: boolean;
  placeholder?: string;
  value?: string | boolean;
  hidden?: boolean;
}

export interface RemoteConfig {
  [key: string]: RemoteFieldConfig;
}

export interface RemoteSchema {
  name: string;
  type: string;
  icon?: string;
  config: RemoteConfig;
}

export interface RemotesSchema {
  remotes: RemoteSchema[];
}
