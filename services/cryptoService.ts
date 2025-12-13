
// ---------------------------------------------------------
// CLIENT-SIDE CRYPTOGRAPHY SERVICE (Web Crypto API)
// Standard: AES-GCM 256-bit with PBKDF2 Key Derivation
// ---------------------------------------------------------

interface EncryptedPayload {
  salt: string; // Hex string
  iv: string;   // Hex string
  data: string; // Base64 string
}

const ENC_ALGO = 'AES-GCM';
const KDF_ALGO = 'PBKDF2';
const HASH_ALGO = 'SHA-256';
const ITERATIONS = 100000; // High iteration count for security against brute-force
const SALT_LEN = 16;
const IV_LEN = 12;

// Helper: ArrayBuffer to Hex
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper: Hex to Uint8Array
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// 1. Derive Key from Password
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: KDF_ALGO },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: KDF_ALGO,
      salt: salt,
      iterations: ITERATIONS,
      hash: HASH_ALGO,
    },
    keyMaterial,
    { name: ENC_ALGO, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// 2. Encrypt Data (Object -> Encrypted JSON String)
export const encryptVault = async (data: any, password: string): Promise<string> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: ENC_ALGO, iv: iv },
    key,
    encodedData
  );

  const payload: EncryptedPayload = {
    salt: bufferToHex(salt.buffer),
    iv: bufferToHex(iv.buffer),
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedContent)))
  };

  return JSON.stringify(payload);
};

// 3. Decrypt Data (Encrypted JSON String -> Object)
export const decryptVault = async (jsonString: string, password: string): Promise<any> => {
  try {
    const payload: EncryptedPayload = JSON.parse(jsonString);
    const salt = hexToBytes(payload.salt);
    const iv = hexToBytes(payload.iv);
    const encryptedData = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0));

    const key = await deriveKey(password, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: ENC_ALGO, iv: iv },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent));
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("Senha incorreta ou arquivo corrompido.");
  }
};
