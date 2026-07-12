import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { NotFoundError } from '../utils/errors';

export const getFuelLogs = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, startDate, endDate, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  try {
    const [logs, total] = await prisma.$transaction([
      prisma.fuelLog.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: { vehicle: true },
      }),
      prisma.fuelLog.count({ where }),
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

export const createFuelLog = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, liters, cost, date } = req.body;

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        liters,
        cost,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, startDate, endDate, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  try {
    const [expenses, total] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: { vehicle: true },
      }),
      prisma.expense.count({ where }),
    ]);
    res.json({
      data: expenses,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId, type, amount, date, notes } = req.body;

  try {
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        return next(new NotFoundError('Vehicle not found'));
      }
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId: vehicleId || null,
        type,
        amount,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};
