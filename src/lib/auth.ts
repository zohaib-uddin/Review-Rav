import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
}

export async function createToken(user: UserPayload): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.user as UserPayload;
  } catch (error) {
    return null;
  }
}

// Role-based access control helper
export function hasRole(user: UserPayload | null, requiredRole: string): boolean {
  if (!user) return false;
  
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  return true; // customer or any authenticated user
}

// Check if user can access admin routes
export function isAdmin(user: UserPayload | null): boolean {
  return hasRole(user, 'admin');
}