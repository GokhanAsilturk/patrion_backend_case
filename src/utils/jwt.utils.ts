import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../types/user';

type Secret = string | Buffer;

export const generateToken = (user: Omit<User, 'password'>): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // @ts-ignore
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): any => {
  try {
    // @ts-ignore
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
};