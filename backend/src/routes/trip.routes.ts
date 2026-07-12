import { Router } from 'express';
import { getTrips, getAvailableVehicles, getAvailableDrivers, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../controllers/trip.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createTripSchema, completeTripSchema } from '../validation/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getTrips);
router.get('/available-vehicles', authenticate, getAvailableVehicles);
router.get('/available-drivers', authenticate, getAvailableDrivers);

// Fleet Manager and Driver can create/dispatch/complete/cancel trips
router.post('/', authenticate, requireRoles(Role.FLEET_MANAGER, Role.DRIVER), validateBody(createTripSchema), createTrip);
router.post('/:id/dispatch', authenticate, requireRoles(Role.FLEET_MANAGER, Role.DRIVER), dispatchTrip);
router.post('/:id/complete', authenticate, requireRoles(Role.FLEET_MANAGER, Role.DRIVER), validateBody(completeTripSchema), completeTrip);
router.post('/:id/cancel', authenticate, requireRoles(Role.FLEET_MANAGER, Role.DRIVER), cancelTrip);

export default router;
