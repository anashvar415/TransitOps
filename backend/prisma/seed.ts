import { PrismaClient, Role, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old data in reverse order of dependencies
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('Password123', 10);

  const managerUser = await prisma.user.create({
    data: {
      name: 'Fleet Manager Alice',
      email: 'manager@transitops.com',
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      name: 'Driver Alex',
      email: 'driver@transitops.com',
      passwordHash,
      role: Role.DRIVER,
    },
  });

  const safetyUser = await prisma.user.create({
    data: {
      name: 'Safety Officer Sam',
      email: 'safety@transitops.com',
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      name: 'Financial Analyst Frank',
      email: 'finance@transitops.com',
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  console.log('Created Users:', {
    manager: managerUser.email,
    driver: driverUser.email,
    safety: safetyUser.email,
    finance: financeUser.email,
  });

  // Create Vehicles
  const van1 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'Van-01',
      name: 'Ford Transit',
      type: 'Van',
      maxLoadCapacityKg: 800,
      odometerKm: 10000,
      acquisitionCost: 25000,
      status: VehicleStatus.AVAILABLE,
      region: 'North',
    },
  });

  const truck2 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'Truck-02',
      name: 'Volvo FH16',
      type: 'Truck',
      maxLoadCapacityKg: 5000,
      odometerKm: 45000,
      acquisitionCost: 65000,
      status: VehicleStatus.AVAILABLE,
      region: 'East',
    },
  });

  const bike3 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'Bike-03',
      name: 'Honda Super Cub',
      type: 'Bike',
      maxLoadCapacityKg: 150,
      odometerKm: 23000,
      acquisitionCost: 12000,
      status: VehicleStatus.AVAILABLE,
      region: 'West',
    },
  });

  const van4 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'Van-04',
      name: 'Chevrolet Express',
      type: 'Van',
      maxLoadCapacityKg: 900,
      odometerKm: 8000,
      acquisitionCost: 28000,
      status: VehicleStatus.IN_SHOP,
      region: 'South',
    },
  });

  // For Section 5 Example Workflow
  const van5 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'Van-05',
      name: 'Mercedes Sprinter',
      type: 'Van',
      maxLoadCapacityKg: 500,
      odometerKm: 0,
      acquisitionCost: 20000,
      status: VehicleStatus.AVAILABLE,
      region: 'North',
    },
  });

  console.log('Created Vehicles: 5');

  // Create Drivers
  const driverAlex = await prisma.driver.create({
    data: {
      name: 'Alex',
      licenseNumber: 'LIC-10001',
      licenseCategory: 'A',
      licenseExpiryDate: new Date('2028-12-31'),
      contactNumber: '555-0101',
      safetyScore: 95,
      status: DriverStatus.AVAILABLE,
      userId: driverUser.id,
    },
  });

  const driverBob = await prisma.driver.create({
    data: {
      name: 'Bob',
      licenseNumber: 'LIC-10002',
      licenseCategory: 'B',
      licenseExpiryDate: new Date('2027-06-30'),
      contactNumber: '555-0102',
      safetyScore: 85,
      status: DriverStatus.ON_TRIP,
      userId: null,
    },
  });

  const driverCharlie = await prisma.driver.create({
    data: {
      name: 'Charlie',
      licenseNumber: 'LIC-10003',
      licenseCategory: 'A',
      licenseExpiryDate: new Date('2029-01-15'),
      contactNumber: '555-0103',
      safetyScore: 90,
      status: DriverStatus.OFF_DUTY,
      userId: null,
    },
  });

  const driverDavid = await prisma.driver.create({
    data: {
      name: 'David',
      licenseNumber: 'LIC-10004',
      licenseCategory: 'B',
      licenseExpiryDate: new Date('2027-10-22'),
      contactNumber: '555-0104',
      safetyScore: 65,
      status: DriverStatus.SUSPENDED,
      userId: null,
    },
  });

  // Expired license driver
  const driverEmma = await prisma.driver.create({
    data: {
      name: 'Emma',
      licenseNumber: 'LIC-10005',
      licenseCategory: 'A',
      licenseExpiryDate: new Date('2025-01-01'),
      contactNumber: '555-0105',
      safetyScore: 92,
      status: DriverStatus.AVAILABLE,
      userId: null,
    },
  });

  console.log('Created Drivers: 5');

  // Let's set driverBob vehicle to ON_TRIP as well by creating an active trip
  const tripBob = await prisma.trip.create({
    data: {
      source: 'Warehouse East',
      destination: 'Retailer Alpha',
      vehicleId: truck2.id,
      driverId: driverBob.id,
      cargoWeightKg: 4000,
      plannedDistanceKm: 250,
      revenue: 1200,
      status: TripStatus.DISPATCHED,
      createdById: managerUser.id,
      dispatchedAt: new Date(),
    },
  });

  // Mark truck2 as ON_TRIP
  await prisma.vehicle.update({
    where: { id: truck2.id },
    data: { status: VehicleStatus.ON_TRIP },
  });

  // Create historical completed trips (to populate reports)
  const trip1 = await prisma.trip.create({
    data: {
      source: 'Main Depot',
      destination: 'Substation West',
      vehicleId: van1.id,
      driverId: driverAlex.id,
      cargoWeightKg: 600,
      plannedDistanceKm: 120,
      actualDistanceKm: 122,
      fuelConsumedLiters: 15,
      revenue: 500,
      status: TripStatus.COMPLETED,
      createdById: managerUser.id,
      dispatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    },
  });

  // Create FuelLog linked to trip1
  await prisma.fuelLog.create({
    data: {
      vehicleId: van1.id,
      tripId: trip1.id,
      liters: 15,
      cost: 22.5, // 15 * 1.5
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      source: 'HQ',
      destination: 'Store South',
      vehicleId: bike3.id,
      driverId: driverCharlie.id,
      cargoWeightKg: 50,
      plannedDistanceKm: 30,
      actualDistanceKm: 29,
      fuelConsumedLiters: 3,
      revenue: 100,
      status: TripStatus.COMPLETED,
      createdById: managerUser.id,
      dispatchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    },
  });

  // Fuel log for trip2
  await prisma.fuelLog.create({
    data: {
      vehicleId: bike3.id,
      tripId: trip2.id,
      liters: 3,
      cost: 4.5,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Create some maintenance logs
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: van4.id,
      type: 'Brake pad replacement',
      cost: 150,
      status: MaintenanceStatus.OPEN,
      openedAt: new Date(),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: van1.id,
      type: 'Oil change and filter replacement',
      cost: 85,
      status: MaintenanceStatus.CLOSED,
      openedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    },
  });

  // Create general expenses
  await prisma.expense.create({
    data: {
      vehicleId: van1.id,
      type: 'Toll',
      amount: 15.5,
      date: new Date(),
      notes: 'Highway toll charge for depot deliveries',
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: null,
      type: 'Office Supplies',
      amount: 45,
      date: new Date(),
      notes: 'General operations team logbooks',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
