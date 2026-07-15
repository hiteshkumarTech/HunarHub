import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';

export interface AuthUser {
  id: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Require a valid Bearer token; attaches req.user. */
export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }
  try {
    const decoded = verifyToken(header.slice(7));
    req.user = { id: decoded.id, role: decoded.role };
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  next();
}

/** Require one of the given roles (use after authRequired). */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to do that');
    }
    next();
  };
