import fs from 'fs-extra';

export async function downloadFile(url: string, destPath: string, onProgress?: (percent: number) => void): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Failed to download ${url}: ${response.statusText}`);

  const reader = response.body.getReader();
  const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
  let receivedLength = 0;
  const chunks = [];

  let done = false;
  while(!done) {
    const result = await reader.read();
    done = result.done;
    if (result.value) {
        chunks.push(result.value);
        receivedLength += result.value.length;
        if (onProgress && contentLength) {
            onProgress(Math.round((receivedLength / contentLength) * 100));
        }
    }
  }

  const buffer = Buffer.concat(chunks);
  await fs.writeFile(destPath, buffer);
}
