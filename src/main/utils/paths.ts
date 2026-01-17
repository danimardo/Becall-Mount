import { app } from 'electron';
import path from 'path';

export const USER_DATA_PATH = app.getPath('userData');
export const RCLONE_CONFIG_PATH = path.join(USER_DATA_PATH, 'rclone.conf');
export const BIN_PATH = path.join(USER_DATA_PATH, 'bin');
export const RCLONE_EXE_PATH = path.join(BIN_PATH, 'rclone.exe');
export const LOGS_PATH = path.join(USER_DATA_PATH, 'logs');
