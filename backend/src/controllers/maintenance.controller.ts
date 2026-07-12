import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { MaintenanceStatus, VehicleStatus } from '@prisma/client';

export const getMaintenanceLogs = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, status, startDate, endDate, sortBy = 'openedAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;
  if (status) where.status = status as MaintenanceStatus;
  
  if (startDate || endDate) {
    where.openedAt = {};
    if (startDate) where.openedAt.gte = new Date(startDate as string);
    if (endDate) where.openedAt.lte = new Date(endDate as string);
  }

  try {
    const [logs, total] = await prisma.$transaction([
      prisma.maintenanceLog.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: { vehicle: true },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);
    res.json({
      data: logs,
      total,
      page: Number(page),
      limit: Number(limit),
    });
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
