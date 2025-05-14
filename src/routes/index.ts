import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import logRoutes from './logs.routes';
import companyRoutes from './company.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/companies', companyRoutes);

export default router; 