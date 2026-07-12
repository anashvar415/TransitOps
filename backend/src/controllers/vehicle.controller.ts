import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ConflictError, NotFoundError } from '../utils/errors';
import { VehicleStatus } from '@prisma/client';

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  const { status, type, region, page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (status) where.status = status as VehicleStatus;
  if (type) where.type = type as string;
  if (region) where.region = { contains: region as string, mode: 'insensitive' };

  try {
    const [vehicles, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      data: vehicles,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const { registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region, status } = req.body;

  try {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber },
    });

    if (existing) {
      return next(new ConflictError(`Vehicle registration number '${registrationNumber}' is already in use`));
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        name,
        type,
        maxLoadCapacityKg,
        odometerKm,
        acquisitionCost,
        region,
        status: status || 'AVAILABLE',
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { registrationNumber, name, type, maxLoadCapacityKg, odometerKm, acquisitionCost, region, status } = req.body;

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNumber },
      });
      if (existing) {
        return next(new ConflictError(`Vehicle registration number '${registrationNumber}' is already in use`));
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        registrationNumber,
        name,
        type,
        maxLoadCapacityKg,
        odometerKm,
        acquisitionCost,
        region,
        status,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    // Soft delete via setting status to RETIRED
    const retired = await prisma.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' },
    });

    res.json({ message: 'Vehicle retired successfully', data: retired });
  } catch (error) {
    next(error);
  }
};
