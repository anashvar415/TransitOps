import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, 'Registration number must be at least 2 characters'),
  name: z.string().min(2, 'Name/Model must be at least 2 characters'),
  type: z.string().min(2, 'Type must be specified'),
  maxLoadCapacityKg: z.coerce.number().positive('Load capacity must be a positive number'),
  odometerKm: z.coerce.number().nonnegative('Odometer must be a non-negative number'),
  acquisitionCost: z.coerce.number().positive('Acquisition cost must be a positive number'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
  region: z.string().min(2, 'Region is required'),
});

export const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  licenseNumber: z.string().min(2, 'License number must be at least 2 characters'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  contactNumber: z.string().min(5, 'Contact number must be at least 5 characters'),
  safetyScore: z.coerce.number().int().min(0).max(100, 'Safety score must be between 0 and 100'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
  userId: z.string().uuid('Invalid user ID').optional().nullable(),
});

export const createTripSchema = z.object({
  source: z.string().min(2, 'Source is required'),
  destination: z.string().min(2, 'Destination is required'),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  cargoWeightKg: z.coerce.number().positive('Cargo weight must be a positive number'),
  plannedDistanceKm: z.coerce.number().positive('Planned distance must be a positive number'),
  revenue: z.coerce.number().nonnegative('Revenue must be a non-negative number').optional(),
});

export const completeTripSchema = z.object({
  finalOdometer: z.coerce.number().positive('Final odometer must be positive'),
  fuelConsumedLiters: z.coerce.number().positive('Fuel consumed must be positive'),
});

export const maintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  type: z.string().min(2, 'Maintenance type/description is required'),
  cost: z.coerce.number().nonnegative('Cost must be non-negative'),
});

export const closeMaintenanceSchema = z.object({
  cost: z.coerce.number().nonnegative('Cost must be non-negative'),
});

export const fuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  liters: z.coerce.number().positive('Liters must be positive'),
  cost: z.coerce.number().positive('Cost must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
});

export const expenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID').optional().nullable(),
  type: z.string().min(2, 'Expense type is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  notes: z.string().optional().nullable(),
});
