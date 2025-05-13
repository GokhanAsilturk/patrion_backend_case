import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../types/user';

// Type definition
type Secret = string | Buffer;

/**
 * JWT token oluşturur
 */
export const generateToken = (user: Omit<User, 'password'>): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // @ts-ignore - Tip hatalarını bastırıyoruz
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * JWT token'ını doğrular
 */
export const verifyToken = (token: string): any => {
  try {
    // @ts-ignore - Tip hatalarını bastırıyoruz
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
}; 