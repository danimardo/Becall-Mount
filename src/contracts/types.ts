export interface AppSettings {
  theme: "light" | "dark" | "system";
  rclonePath: string;
  firstRun: boolean;
  passwordHash?: string;
}

export interface MountState {
  serviceName: string;
  driveLetter?: string; // Kept for backward compat or if type is 'drive'
  mountPoint: string;   // The actual path or letter
  mountType: 'drive' | 'folder';
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