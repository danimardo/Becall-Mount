# Feature Quickstart: UI & Mount Enhancements

## Overview
This feature introduces a visual overhaul and advanced mounting capabilities. Key components include a Splash Screen, a dedicated Export/Import system, and folder-based mounting.

## Development Setup

1.  **Tailwind Config**:
    Ensure `tailwind.config.js` is updated with the new `brand` color palette.
    ```javascript
    colors: { brand: { blue: ..., green: ..., ... } }
    ```

2.  **Splash Screen**:
    The splash screen runs in a separate window. To debug it:
    - In `src/main/main.ts`, temporarily comment out the `splash.close()` line or increase the timeout.
    - Inspect the `src/renderer/pages/splash.html` file directly in a browser if needed.

3.  **Config Export**:
    - Encryption uses `aes-256-cbc`.
    - Generated files are binary/base64. Do not try to edit them manually.

## Testing Flows

### Mount to Folder
1.  Create a test folder: `C:\Temp\TestMount`.
2.  In the app, select "Mount to Folder" and choose this path.
3.  Verify files appear in Explorer.
4.  **Edge Case**: Put a dummy text file in `C:\Temp\TestMount` BEFORE mounting. Verify the app warns you.

### Export/Import
1.  Configure a service "TestS3".
2.  Settings -> Export -> Password "1234".
3.  Delete "TestS3" from the app.
4.  Settings -> Import -> Select file -> Password "1234".
5.  Verify "TestS3" is restored.

### Splash Screen
1.  Restart the app.
2.  Verify splash appears for ~2 seconds.
3.  Verify version number matches `package.json`.
