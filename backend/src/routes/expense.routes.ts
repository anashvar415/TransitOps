import { Router } from 'express';
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from '../controllers/expense.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { fuelLogSchema, expenseSchema } from '../validation/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.get('/fuel-logs', authenticate, getFuelLogs);
router.post('/fuel-logs', authenticate, requireRoles(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER), validateBody(fuelLogSchema), createFuelLog);

router.get('/expenses', authenticate, getExpenses);
router.post('/expenses', authenticate, requireRoles(Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER), validateBody(expenseSchema), createExpense);

export default router;
