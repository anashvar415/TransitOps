import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ConflictError, NotFoundError } from '../utils/errors';
import { DriverStatus } from '@prisma/client';

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  const { status, licenseCategory, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (status) where.status = status as DriverStatus;
  if (licenseCategory) where.licenseCategory = licenseCategory as string;

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { licenseNumber: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  try {
    const [drivers, total] = await prisma.$transaction([
      prisma.driver.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.driver.count({ where }),
    ]);

    res.json({
      data: drivers,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!driver) {
      return next(new NotFoundError('Driver not found'));
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;

  try {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber },
    });

    if (existing) {
      return next(new ConflictError(`License number '${licenseNumber}' is already registered`));
    }

    if (userId) {
      const existingUserLink = await prisma.driver.findUnique({
        where: { userId },
      });
      if (existingUserLink) {
        return next(new ConflictError(`User is already linked to another driver profile`));
      }
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate: new Date(licenseExpiryDate),
        contactNumber,
        safetyScore,
        status: status || 'AVAILABLE',
        userId: userId || null,
      },
    });

    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;

  try {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return next(new NotFoundError('Driver not found'));
    }

    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNumber },
      });
      if (existing) {
        return next(new ConflictError(`License number '${licenseNumber}' is already registered`));
      }
    }

    if (userId && userId !== driver.userId) {
      const existingUserLink = await prisma.driver.findUnique({
        where: { userId },
      });
      if (existingUserLink) {
        return next(new ConflictError(`User is already linked to another driver profile`));
      }
    }

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
        contactNumber,
        safetyScore,
        status,
        userId: userId === null ? null : userId || undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
