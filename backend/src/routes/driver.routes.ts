import { Router } from 'express';
import { getDrivers, getDriverById, createDriver, updateDriver } from '../controllers/driver.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { driverSchema } from '../validation/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getDrivers);
router.get('/:id', authenticate, getDriverById);

// Safety Officer only mutating endpoints
router.post('/', authenticate, requireRoles(Role.SAFETY_OFFICER), validateBody(driverSchema), createDriver);
router.put('/:id', authenticate, requireRoles(Role.SAFETY_OFFICER), validateBody(driverSchema), updateDriver);

export default router;
