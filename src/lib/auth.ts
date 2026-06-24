import jwt from 'jsonwebtoken';

const JWT_SECRET = 'nextrade-pro-rbac-mongodb-2025';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; } catch { return null; }
}

export function extractToken(request: Request): string | null {
  const h = request.headers.get('authorization');
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

export function requireAuth(request: Request): JwtPayload {
  const token = extractToken(request);
  if (!token) throw new AuthError('Authentication required', 401);
  const payload = verifyToken(token);
  if (!payload) throw new AuthError('Invalid or expired token', 401);
  return payload;
}

export function requireAdmin(request: Request): JwtPayload {
  const p = requireAuth(request);
  if (p.role !== 'super_admin' && p.role !== 'sub_agent') throw new AuthError('Admin access required', 403);
  return p;
}

export function requireSuperAdmin(request: Request): JwtPayload {
  const p = requireAuth(request);
  if (p.role !== 'super_admin') throw new AuthError('Super admin access required', 403);
  return p;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'AuthError'; this.status = status; }
}