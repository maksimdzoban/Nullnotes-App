import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nullnotes_super_secret_jwt_key_2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type Env = {
  Variables: {
    user: AuthUser;
  };
};

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}

export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}