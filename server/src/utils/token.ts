import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): TokenPayload & { iat: number; exp: number } {
  return jwt.verify(token, env.jwtSecret) as TokenPayload & { iat: number; exp: number };
}
