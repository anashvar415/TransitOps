import { Router } from 'express';
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { vehicleSchema } from '../validation/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getVehicles);
router.get('/:id', authenticate, getVehicleById);

// Fleet Manager only mutating endpoints
router.post('/', authenticate, requireRoles(Role.FLEET_MANAGER), validateBody(vehicleSchema), createVehicle);
router.put('/:id', authenticate, requireRoles(Role.FLEET_MANAGER), validateBody(vehicleSchema), updateVehicle);
router.delete('/:id', authenticate, requireRoles(Role.FLEET_MANAGER), deleteVehicle);

export default router;
