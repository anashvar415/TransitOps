import { Request, Response, NextFunction } from 'express';

const ipCache = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const cached = ipCache.get(ip);

    if (!cached || now > cached.resetTime) {
      ipCache.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    cached.count++;
    if (cached.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
    }

    next();
  };
};
