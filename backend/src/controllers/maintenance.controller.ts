import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { MaintenanceStatus, VehicleStatus } from '@prisma/client';

export const getMaintenanceLogs = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, status } = req.query;

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;
  if (status) where.status = status as MaintenanceStatus;

  try {
    const logs = await prisma.maintenanceLog.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      include: { vehicle: true },
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceLog = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, type, cost } = req.body;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    if (vehicle.status === VehicleStatus.ON_TRIP) {
      return next(new BadRequestError(`Vehicle ${vehicle.registrationNumber} is currently on a trip and cannot enter maintenance`));
    }

    if (vehicle.status === VehicleStatus.RETIRED) {
      return next(new BadRequestError(`Vehicle ${vehicle.registrationNumber} is retired and cannot enter maintenance`));
    }

    const log = await prisma.$transaction(async (tx) => {
      // Set vehicle status to IN_SHOP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      });

      // Create log
      return tx.maintenanceLog.create({
        data: {
          vehicleId,
          type,
          cost: cost || 0,
          status: MaintenanceStatus.OPEN,
          openedAt: new Date(),
        },
      });
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

export const closeMaintenanceLog = async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { cost } = req.body;

  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!log) {
      return next(new NotFoundError('Maintenance log not found'));
    }

    if (log.status === MaintenanceStatus.CLOSED) {
      return next(new BadRequestError('Maintenance log is already closed'));
    }

    const closedLog = await prisma.$transaction(async (tx) => {
      // Fetch latest vehicle status to verify it's not retired
      const vehicle = await tx.vehicle.findUnique({
        where: { id: log.vehicleId },
      });

      if (vehicle && vehicle.status !== VehicleStatus.RETIRED) {
        // Restore status to AVAILABLE
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });
      }

      // Close maintenance log
      return tx.maintenanceLog.update({
        where: { id },
        data: {
          status: MaintenanceStatus.CLOSED,
          closedAt: new Date(),
          cost: cost,
        },
      });
    });

    res.json(closedLog);
  } catch (error) {
    next(error);
  }
};
