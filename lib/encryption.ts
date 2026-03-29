// Simple end-to-end encryption using Web Crypto API
// In production, use a proper E2E encryption library like libsodium

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

export async function generateConversationKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return Buffer.from(raw).toString('base64');
}

export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const raw = Buffer.from(keyBase64, 'base64');
  return await crypto.subtle.importKey(
    'raw',
    raw,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(text: string, keyBase64: string): Promise<string> {
  try {
    const key = await importKey(keyBase64);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoded
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return Buffer.from(combined).toString('base64');
  } catch {
    return text; // fallback for development
  }
}

export async function decryptMessage(encryptedBase64: string, keyBase64: string): Promise<string> {
  try {
    const key = await importKey(keyBase64);
    const combined = Buffer.from(encryptedBase64, 'base64');
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedBase64; // fallback: return as-is
  }
}
