/**
 * 对称加密工具
 * 用于超管 token 的加密/解密
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// 从环境变量获取密钥
const getSecretKey = (): string => {
  return process.env.COZE_ADMIN_SECRET || 'lobster-dating-admin-secret-key-2024';
};

function getKey(): Buffer {
  const key = getSecretKey();
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * 加密
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * 解密
 */
export function decrypt(encryptedText: string): string | null {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    return null;
  }
}

/**
 * 生成超管 token
 */
export function generateAdminToken(): string {
  const rawToken = `admin_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  return encrypt(rawToken);
}

/**
 * 验证超管 token
 */
export function verifyAdminToken(encryptedToken: string): boolean {
  const decrypted = decrypt(encryptedToken);
  return decrypted !== null && decrypted.startsWith('admin_');
}
