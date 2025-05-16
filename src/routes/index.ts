import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import logRoutes from './logs.routes';
import companyRoutes from './company.routes';
import systemLogRoutes from './system-logs.routes';
import sensorRoutes from './sensor.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/companies', companyRoutes);
router.use('/system-logs', systemLogRoutes);
router.use('/sensors', sensorRoutes);

export default router; 