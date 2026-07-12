import { Router } from 'express';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from '../controllers/maintenance.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { maintenanceSchema, closeMaintenanceSchema } from '../validation/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getMaintenanceLogs);

// Fleet Manager only can create or close maintenance logs
router.post('/', authenticate, requireRoles(Role.FLEET_MANAGER), validateBody(maintenanceSchema), createMaintenanceLog);
router.post('/:id/close', authenticate, requireRoles(Role.FLEET_MANAGER), validateBody(closeMaintenanceSchema), closeMaintenanceLog);

export default router;
