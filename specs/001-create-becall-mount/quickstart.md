# Quickstart: Becall-Mount Development

## Prerequisites
- Node.js 20+
- Git
- Windows 10/11

## Setup
1. **Clone & Install**
   ```powershell
   git clone <repo>
   cd becall-mount
   npm install
   ```

2. **Development Mode**
   Runs Main and Renderer processes with HMR.
   ```powershell
   npm start
   ```

3. **Production Build**
   Creates the executable via Electron Forge.
   ```powershell
   npm run make
   ```

## Key Commands
- `npm run lint`: Check code style.
- `npm test`: Run Vitest unit tests.
- `npm run clean`: Remove `%APPDATA%/becall-mount` (Warning: deletes data).

## Troubleshooting
- **Rclone missing**: The app should download it automatically to `%APPDATA%/becall-mount/bin/`. Check logs if it fails.
- **Mount fails**: Ensure WinFsp is installed. Check `specs/001-create-becall-mount/research.md` for details.
