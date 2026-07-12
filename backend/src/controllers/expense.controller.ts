import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { NotFoundError } from '../utils/errors';

export const getFuelLogs = async (req: any, res: Response, next: NextFunction) => {
  const { vehicleId } = req.query;

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;

  try {
    const logs = await prisma.fuelLog.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { vehicle: true },
    });
    res.json(logs);
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
  const { vehicleId } = req.query;

  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId as string;

  try {
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { vehicle: true },
    });
    res.json(expenses);
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
