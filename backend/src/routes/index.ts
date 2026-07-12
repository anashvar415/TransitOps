import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import driverRoutes from './driver.routes';
import tripRoutes from './trip.routes';
import maintenanceRoutes from './maintenance.routes';
import expenseRoutes from './expense.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/', expenseRoutes); // covers /fuel-logs and /expenses
router.use('/', reportRoutes);  // covers /dashboard/kpis and /reports/...

export default router;
