import fs from 'fs-extra';

export async function downloadFile(url: string, destPath: string, onProgress?: (percent: number) => void): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Failed to download ${url}: ${response.statusText}`);

  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length')!;
  let receivedLength = 0;
  const chunks = [];

  while(true) {
    const {done, value} = await reader.read();
    if (done) break;
    chunks.push(value);
    receivedLength += value.length;
    if (onProgress && contentLength) {
        onProgress(Math.round((receivedLength / contentLength) * 100));
    }
  }

  const buffer = Buffer.concat(chunks);
  await fs.writeFile(destPath, buffer);
}
