export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  COMPANY_ADMIN = 'company_admin',
  USER = 'user'
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  company_id?: number;  // Şirket kullanıcıları için
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  company_id?: number;
  role?: UserRole;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  company_id?: number;
  role: UserRole;
  token?: string;
} 