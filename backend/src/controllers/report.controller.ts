import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { VehicleStatus, TripStatus, DriverStatus } from '@prisma/client';

export const getDashboardKPIs = async (req: Request, res: Response, next: NextFunction) => {
  const { type, region, status } = req.query;

  // Build vehicle filters
  const vehicleWhere: any = {};
  if (type) vehicleWhere.type = type as string;
  if (region) vehicleWhere.region = { contains: region as string, mode: 'insensitive' };
  if (status) vehicleWhere.status = status as VehicleStatus;

  try {
    // 1. Vehicles count by status
    const activeVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.ON_TRIP },
    });

    const availableVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.AVAILABLE },
    });

    const maintenanceVehicles = await prisma.vehicle.count({
      where: { ...vehicleWhere, status: VehicleStatus.IN_SHOP },
    });

    const totalNonRetired = await prisma.vehicle.count({
      where: {
        ...vehicleWhere,
        status: { not: VehicleStatus.RETIRED },
      },
    });

    // 2. Trips count
    const tripWhere: any = {};
    if (type || region) {
      tripWhere.vehicle = {
        type: type || undefined,
        region: region ? { contains: region as string, mode: 'insensitive' } : undefined,
      };
    }

    const activeTrips = await prisma.trip.count({
      where: { ...tripWhere, status: TripStatus.DISPATCHED },
    });

    const pendingTrips = await prisma.trip.count({
      where: { ...tripWhere, status: TripStatus.DRAFT },
    });

    // 3. Drivers count
    const driversOnDuty = await prisma.driver.count({
      where: {
        status: { in: [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP] },
      },
    });

    // 4. Fleet Utilization %
    const fleetUtilization = totalNonRetired > 0 ? (activeVehicles / totalNonRetired) * 100 : 0;

    res.json({
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance: maintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: Number(fleetUtilization.toFixed(1)),
    });
  } catch (error) {
    next(error);
  }
};

export const getFuelEfficiency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { not: VehicleStatus.RETIRED } },
      include: {
        trips: {
          where: { status: TripStatus.COMPLETED },
        },
      },
    });

    const data = vehicles.map((v) => {
      const totalDistance = v.trips.reduce((acc, t) => acc + Number(t.actualDistanceKm || 0), 0);
      const totalFuel = v.trips.reduce((acc, t) => acc + Number(t.fuelConsumedLiters || 0), 0);
      const efficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        totalDistance: Number(totalDistance.toFixed(1)),
        totalFuel: Number(totalFuel.toFixed(1)),
        efficiency: Number(efficiency.toFixed(2)), // km per liter
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getFleetUtilizationTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generate dummy historical trend for chart
    const trend = [
      { date: 'Mon', utilization: 65 },
      { date: 'Tue', utilization: 72 },
      { date: 'Wed', utilization: 80 },
      { date: 'Thu', utilization: 78 },
      { date: 'Fri', utilization: 85 },
      { date: 'Sat', utilization: 50 },
      { date: 'Sun', utilization: 45 },
    ];
    res.json(trend);
  } catch (error) {
    next(error);
  }
};

export const getOperationalCost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        expenses: true,
      },
    });

    const data = vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const otherExpenseCost = v.expenses.reduce((acc, l) => acc + Number(l.amount), 0);
      const totalCost = fuelCost + maintenanceCost + otherExpenseCost;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        fuelCost: Number(fuelCost.toFixed(2)),
        maintenanceCost: Number(maintenanceCost.toFixed(2)),
        otherExpenseCost: Number(otherExpenseCost.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getVehicleROI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        trips: {
          where: { status: TripStatus.COMPLETED },
        },
      },
    });

    const data = vehicles.map((v) => {
      const revenue = v.trips.reduce((acc, t) => acc + Number(t.revenue || 0), 0);
      const fuelCost = v.fuelLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const acquisitionCost = Number(v.acquisitionCost);

      const netIncome = revenue - (maintenanceCost + fuelCost);
      const roi = acquisitionCost > 0 ? (netIncome / acquisitionCost) * 100 : 0;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        revenue: Number(revenue.toFixed(2)),
        operationalCost: Number((fuelCost + maintenanceCost).toFixed(2)),
        acquisitionCost: Number(acquisitionCost.toFixed(2)),
        roi: Number(roi.toFixed(2)), // percentage
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        trips: {
          where: { status: TripStatus.COMPLETED },
        },
      },
    });

    let csvContent = 'Registration Number,Model/Name,Type,Acquisition Cost,Total Trips,Total Revenue,Fuel Cost,Maintenance Cost,Net Income,ROI (%)\n';

    vehicles.forEach((v) => {
      const revenue = v.trips.reduce((acc, t) => acc + Number(t.revenue || 0), 0);
      const fuelCost = v.fuelLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((acc, l) => acc + Number(l.cost), 0);
      const acquisitionCost = Number(v.acquisitionCost);
      const netIncome = revenue - (maintenanceCost + fuelCost);
      const roi = acquisitionCost > 0 ? (netIncome / acquisitionCost) * 100 : 0;

      csvContent += `"${v.registrationNumber}","${v.name}","${v.type}",${acquisitionCost},${v.trips.length},${revenue.toFixed(2)},${fuelCost.toFixed(2)},${maintenanceCost.toFixed(2)},${netIncome.toFixed(2)},${roi.toFixed(2)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
