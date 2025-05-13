export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'admin' | 'user';
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
  role: 'admin' | 'user';
  token?: string;
} 