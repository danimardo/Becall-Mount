import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MigrationService } from '../../src/main/utils/migration';
import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(),
  },
}));

describe('MigrationService', () => {
  const mockAppData = path.join(__dirname, 'temp_appdata');
  const oldPath = path.join(mockAppData, 'cloud-mount');
  const newPath = path.join(mockAppData, 'becall-mount');

  beforeEach(async () => {
    await fs.ensureDir(oldPath);
    await fs.ensureDir(newPath);
    // Mock app.getPath
    (app.getPath as any).mockImplementation((name: string) => {
      if (name === 'appData') return mockAppData;
      if (name === 'userData') return newPath;
      return '';
    });
  });

  afterEach(async () => {
    await fs.remove(mockAppData);
    vi.clearAllMocks();
  });

  it('should migrate data if old path exists and new path is empty', async () => {
    // Setup old data
    await fs.writeFile(path.join(oldPath, 'rclone.conf'), 'old config');
    
    // Check initial state
    expect(fs.existsSync(path.join(newPath, 'rclone.conf'))).toBe(false);

    const migrated = await MigrationService.migrateIfNeeded();
    
    expect(migrated).toBe(true);
    expect(fs.existsSync(path.join(newPath, 'rclone.conf'))).toBe(true);
    const content = await fs.readFile(path.join(newPath, 'rclone.conf'), 'utf-8');
    expect(content).toBe('old config');
  });

  it('should not migrate if old path does not exist', async () => {
    await fs.remove(oldPath);
    
    const migrated = await MigrationService.migrateIfNeeded();
    
    expect(migrated).toBe(false);
  });

  it('should cleanup old data', async () => {
    await fs.ensureDir(oldPath);
    expect(fs.existsSync(oldPath)).toBe(true);

    await MigrationService.cleanupOldData();
    
    expect(fs.existsSync(oldPath)).toBe(false);
  });
});
