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
