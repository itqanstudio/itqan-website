import { createHash, randomBytes, randomUUID } from 'node:crypto';

/** A URL-safe secret with 256 bits of entropy. Only its hash is stored. */
export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newId(): string {
  return randomUUID();
}
