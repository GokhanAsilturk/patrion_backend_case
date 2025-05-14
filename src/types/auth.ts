import { Request } from 'express';
import { UserRole } from './user';

/**
 * Kimlik doğrulama için genişletilmiş Request arayüzü
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    company_id?: number;
    iat?: number;
    exp?: number;
  };
} 