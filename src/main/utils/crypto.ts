import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const SALT_LENGTH = 16;

export async function encrypt(text: string, password: string): Promise<Buffer> {
  const salt = randomBytes(SALT_LENGTH);
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Format: salt (16) + iv (16) + encrypted (hex string converted to buffer? No, let's store raw buffer)
  // Let's store everything as Buffer
  const encryptedBuffer = Buffer.from(encrypted, 'hex');
  
  return Buffer.concat([salt, iv, encryptedBuffer]);
}

export async function decrypt(data: Buffer, password: string): Promise<string> {
  // Extract salt, iv, encrypted
  if (data.length < SALT_LENGTH + IV_LENGTH) throw new Error('Invalid data length');
  
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedText = data.subarray(SALT_LENGTH + IV_LENGTH);
  
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}
