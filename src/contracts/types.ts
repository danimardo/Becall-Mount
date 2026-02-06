export interface DomainInfo {
  SamAccountName: string;
  DisplayName: string;
  EmailAddress: string;
  DistinguishedName: string;
  Department: string;
  Title: string;
  MemberOf: string[];
  lastUpdated: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  rclonePath: string;
  firstRun: boolean;
  passwordHash?: string;
  autoLaunch?: boolean;
  adIntegrationEnabled?: boolean;
  adConfPath?: string;
  autologinEnabled?: boolean;
  infoDominio?: DomainInfo;
}

export interface MountState {
  serviceName: string;
  driveLetter?: string; // Kept for backward compat or if type is 'drive'
  mountPoint: string;   // The actual path or letter
  mountType: 'drive' | 'folder';
  pid: number;
  startTime: string;
  status: "mounted" | "error" | "unmounted";
  iconPath?: string;
  extraArgs?: string[];
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
  mountArgs?: string[];
  config: RemoteConfig;
}

export interface MountFlagConfig {
  label: string;
  type: 'string' | 'select' | 'number' | 'boolean';
  options?: string[];
  default?: string | boolean;
  placeholder?: string;
  description?: string;
}

export interface RemotesSchema {
  remotes: RemoteSchema[];
  globalMountFlags: Record<string, MountFlagConfig>;
}