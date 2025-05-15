// src/types/express/index.d.ts
import * as express from 'express';
import { JwtUser } from '../auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}