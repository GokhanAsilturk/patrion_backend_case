// src/types/express/index.d.ts
import * as express from 'express';
import { User } from '../user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}