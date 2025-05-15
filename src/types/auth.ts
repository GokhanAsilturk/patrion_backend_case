import { Request } from 'express';
import { UserRole } from './user';

/**
 * JWT token'da taşınan kullanıcı bilgileri için tip
 */
export interface JwtUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  company_id?: number;
  iat?: number;
  exp?: number;
}

/**
 * Kimlik doğrulama için genişletilmiş Request arayüzü
 */
export interface AuthRequest extends Request {
  user?: JwtUser;
} 