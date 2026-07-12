import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecret_access';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return next(new UnauthorizedError('Invalid credentials or account is suspended'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new UnauthorizedError('Invalid credentials'));
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new UnauthorizedError('Refresh token is missing'));
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return next(new UnauthorizedError('User not found or suspended'));
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired refresh token'));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};
