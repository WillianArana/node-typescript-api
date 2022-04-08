import AuthService from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token'] as string;
  try {
    const decoded = AuthService.decodeToken(token);
    req.decoded = decoded;
  } catch (err) {
    res.status?.(401).send({ code: 401, error: (err as Error).message });
  } finally {
    next();
  }
}
