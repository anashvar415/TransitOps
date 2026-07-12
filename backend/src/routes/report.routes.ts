import { Router } from 'express';
import { getDashboardKPIs, getFuelEfficiency, getFleetUtilizationTrend, getOperationalCost, getVehicleROI, exportCSV, getTodayKPIs, getTripsTrend, getCostTrend, getExpiringLicenses } from '../controllers/report.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Dashboard KPIs accessible by Fleet Manager and Financial Analyst (or others if needed, but let's restrict to these two)
router.get('/dashboard/kpis', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getDashboardKPIs);

// Reports endpoints restricted to Fleet Manager and Financial Analyst
router.get('/reports/fuel-efficiency', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getFuelEfficiency);
router.get('/reports/fleet-utilization', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getFleetUtilizationTrend);
router.get('/reports/operational-cost', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getOperationalCost);
router.get('/reports/vehicle-roi', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getVehicleROI);
router.get('/reports/export/csv', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), exportCSV);

// New Analytics APIs
router.get('/kpis/today', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getTodayKPIs);
router.get('/analytics/trips-trend', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getTripsTrend);
router.get('/analytics/cost-trend', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getCostTrend);
router.get('/analytics/utilization', authenticate, requireRoles(Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST), getFleetUtilizationTrend);
router.get('/drivers/expiring-licenses', authenticate, requireRoles(Role.FLEET_MANAGER, Role.SAFETY_OFFICER), getExpiringLicenses);

export default router;
