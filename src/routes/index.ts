import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import logRoutes from './logs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);

export default router; 