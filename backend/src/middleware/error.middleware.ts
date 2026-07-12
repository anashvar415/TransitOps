import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';
import logger from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint failed
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: `Unique constraint failed on the field(s): ${(err.meta?.target as string[])?.join(', ')}`
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
  }

  // Handle default errors
  return res.status(500).json({
    error: 'Internal Server Error',
  });
};
