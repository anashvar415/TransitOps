import { Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { BadRequestError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';

export const getTrips = async (req: any, res: Response, next: NextFunction) => {
  const { status, vehicleId, driverId, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  if (status) where.status = status as TripStatus;
  if (vehicleId) where.vehicleId = vehicleId as string;
  if (driverId) where.driverId = driverId as string;

  if (search) {
    where.OR = [
      { source: { contains: search as string, mode: 'insensitive' } },
      { destination: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  try {
    const [trips, total] = await prisma.$transaction([
      prisma.trip.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          vehicle: true,
          driver: true,
          createdBy: { select: { name: true, email: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({
      data: trips,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableVehicles = async (req: any, res: Response, next: NextFunction) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.AVAILABLE,
      },
    });
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

export const getAvailableDrivers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        status: DriverStatus.AVAILABLE,
        licenseExpiryDate: {
          gt: new Date(),
        },
      },
    });
    res.json(drivers);
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: any, res: Response, next: NextFunction) => {
  const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue } = req.body;
  const createdById = req.user.id;

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return next(new NotFoundError('Vehicle not found'));
    }

    if (vehicle.status === VehicleStatus.RETIRED || vehicle.status === VehicleStatus.IN_SHOP) {
      return next(new BadRequestError(`Vehicle ${vehicle.registrationNumber} is currently ${vehicle.status} and cannot be assigned`));
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return next(new NotFoundError('Driver not found'));
    }

    if (driver.status === DriverStatus.SUSPENDED) {
      return next(new BadRequestError(`Driver ${driver.name} is SUSPENDED and cannot be assigned`));
    }

    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return next(new BadRequestError(`Driver ${driver.name} has an expired license and cannot be assigned`));
    }

    // Validate capacity
    if (Number(cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
      return next(new BadRequestError(`Cargo weight (${cargoWeightKg} kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacityKg} kg)`));
    }

    const trip = await prisma.trip.create({
      data: {
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg,
        plannedDistanceKm,
        revenue: revenue || 0,
        status: TripStatus.DRAFT,
        createdById,
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

export const dispatchTrip = async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      return next(new NotFoundError('Trip not found'));
    }

    if (req.user.role === 'DRIVER' && trip.createdById !== req.user.id) {
      return next(new ForbiddenError('You are only allowed to dispatch trips you created'));
    }

    if (trip.status !== TripStatus.DRAFT) {
      return next(new BadRequestError(`Trip must be in DRAFT status to dispatch. Current status: ${trip.status}`));
    }

    // Re-verify cargo weight
    if (Number(trip.cargoWeightKg) > Number(trip.vehicle.maxLoadCapacityKg)) {
      return next(new BadRequestError(`Cargo weight (${trip.cargoWeightKg} kg) exceeds vehicle's maximum capacity (${trip.vehicle.maxLoadCapacityKg} kg)`));
    }

    // Check if vehicle or driver is already on trip
    if (trip.vehicle.status === VehicleStatus.ON_TRIP) {
      return next(new ConflictError(`Vehicle ${trip.vehicle.registrationNumber} is already on another trip`));
    }
    if (trip.vehicle.status === VehicleStatus.IN_SHOP || trip.vehicle.status === VehicleStatus.RETIRED) {
      return next(new BadRequestError(`Vehicle ${trip.vehicle.registrationNumber} is not available for dispatch`));
    }

    if (trip.driver.status === DriverStatus.ON_TRIP) {
      return next(new ConflictError(`Driver ${trip.driver.name} is already on another trip`));
    }
    if (trip.driver.status === DriverStatus.SUSPENDED || trip.driver.status === DriverStatus.OFF_DUTY) {
      return next(new BadRequestError(`Driver ${trip.driver.name} is not available for dispatch`));
    }

    if (new Date(trip.driver.licenseExpiryDate) < new Date()) {
      return next(new BadRequestError(`Driver ${trip.driver.name} has an expired license`));
    }

    // Transaction to dispatch trip
    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Update vehicle status to ON_TRIP
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.ON_TRIP },
      });

      // Update driver status to ON_TRIP
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_TRIP },
      });

      // Update trip status to DISPATCHED
      return tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.DISPATCHED,
          dispatchedAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });
    });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { finalOdometer, fuelConsumedLiters } = req.body;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      return next(new NotFoundError('Trip not found'));
    }

    if (req.user.role === 'DRIVER' && trip.createdById !== req.user.id) {
      return next(new ForbiddenError('You are only allowed to complete trips you created'));
    }

    if (trip.status !== TripStatus.DISPATCHED) {
      return next(new BadRequestError(`Only dispatched trips can be completed. Current status: ${trip.status}`));
    }

    if (Number(finalOdometer) < Number(trip.vehicle.odometerKm)) {
      return next(new BadRequestError(`Final odometer reading (${finalOdometer} km) cannot be less than vehicle's current odometer (${trip.vehicle.odometerKm} km)`));
    }

    const actualDistance = Number(finalOdometer) - Number(trip.vehicle.odometerKm);
    const fuelCost = Number(fuelConsumedLiters) * 1.5; // assumption: $1.5 per liter fuel cost

    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Update vehicle odometer and status
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          odometerKm: finalOdometer,
          status: VehicleStatus.AVAILABLE,
        },
      });

      // Update driver status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      // Create FuelLog
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          liters: fuelConsumedLiters,
          cost: fuelCost,
          date: new Date(),
        },
      });

      // Update trip details
      return tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.COMPLETED,
          actualDistanceKm: actualDistance,
          fuelConsumedLiters,
          completedAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });
    });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
};

export const cancelTrip = async (req: any, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      return next(new NotFoundError('Trip not found'));
    }

    if (req.user.role === 'DRIVER' && trip.createdById !== req.user.id) {
      return next(new ForbiddenError('You are only allowed to cancel trips you created'));
    }

    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      return next(new BadRequestError(`Trip is already in ${trip.status} state and cannot be cancelled`));
    }

    const updatedTrip = await prisma.$transaction(async (tx) => {
      if (trip.status === TripStatus.DISPATCHED) {
        // Restore vehicle status
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });

        // Restore driver status
        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE },
        });
      }

      // Update trip
      return tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });
    });

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
};
