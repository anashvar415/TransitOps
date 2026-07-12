import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';
import logger from '../utils/logger';

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

  // Handle default errors
  return res.status(500).json({
    error: 'Internal Server Error',
  });
};
