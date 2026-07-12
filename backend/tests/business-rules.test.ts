import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/db';

let managerToken = '';
let driverToken = '';
let safetyToken = '';

beforeAll(async () => {
  // Login to get tokens
  const managerRes = await request(app).post('/api/v1/auth/login').send({
    email: 'manager@transitops.com',
    password: 'Password123',
  });
  managerToken = managerRes.body.accessToken;

  const driverRes = await request(app).post('/api/v1/auth/login').send({
    email: 'driver@transitops.com',
    password: 'Password123',
  });
  driverToken = driverRes.body.accessToken;

  const safetyRes = await request(app).post('/api/v1/auth/login').send({
    email: 'safety@transitops.com',
    password: 'Password123',
  });
  safetyToken = safetyRes.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('TransitOps Business Rules Tests', () => {
  test('Rule 1: Unique registrationNumber on Vehicle creation', async () => {
    // Attempt to create a vehicle with a duplicate registration number (Van-01 already seeded)
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        registrationNumber: 'Van-01',
        name: 'Ford Transit Gold',
        type: 'Van',
        maxLoadCapacityKg: 1000,
        odometerKm: 200,
        acquisitionCost: 30000,
        region: 'North',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already in use');
  });

  test('Rule 2: Retired or In Shop vehicles never appear in trip-creation available picker', async () => {
    // Van-04 is seeded as IN_SHOP, and retired vehicles should be excluded too
    // We create a retired vehicle to test this
    const retiredVehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: 'Retired-99',
        name: 'Old Clunker',
        type: 'Truck',
        maxLoadCapacityKg: 2000,
        odometerKm: 500000,
        acquisitionCost: 5000,
        status: 'RETIRED',
        region: 'South',
      },
    });

    const res = await request(app)
      .get('/api/v1/trips/available-vehicles')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    const vehicleIds = res.body.map((v: any) => v.id);

    // Verify neither Van-04 (IN_SHOP) nor Retired-99 (RETIRED) is present
    const van4 = await prisma.vehicle.findUnique({ where: { registrationNumber: 'Van-04' } });
    expect(vehicleIds).not.toContain(van4?.id);
    expect(vehicleIds).not.toContain(retiredVehicle.id);

    // Cleanup Retired-99
    await prisma.vehicle.delete({ where: { id: retiredVehicle.id } });
  });

  test('Rule 3: Drivers with expired licenses or Suspended status excluded from available picker', async () => {
    // Emma has an expired license, David is Suspended
    const res = await request(app)
      .get('/api/v1/trips/available-drivers')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    const driverIds = res.body.map((d: any) => d.id);

    const emma = await prisma.driver.findUnique({ where: { licenseNumber: 'LIC-10005' } });
    const david = await prisma.driver.findUnique({ where: { licenseNumber: 'LIC-10004' } });

    expect(driverIds).not.toContain(emma?.id);
    expect(driverIds).not.toContain(david?.id);
  });

  test('Rule 5: Cargo Weight must not exceed vehicle maximum load capacity', async () => {
    // Get Van-01 (capacity: 800kg)
    const vehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'Van-01' } });
    const driver = await prisma.driver.findUnique({ where: { licenseNumber: 'LIC-10001' } });

    // Attempt to create a trip with 900kg cargo (exceeds 800kg)
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        source: 'Main Depot',
        destination: 'Client A',
        vehicleId: vehicle?.id,
        driverId: driver?.id,
        cargoWeightKg: 900,
        plannedDistanceKm: 50,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('exceeds vehicle\'s maximum load capacity');
  });

  test('Rule 9 & 10: MaintenanceLog flow status toggling', async () => {
    // Create new available vehicle to test maintenance
    const testVeh = await prisma.vehicle.create({
      data: {
        registrationNumber: 'Maint-01',
        name: 'Test Maintenance Van',
        type: 'Van',
        maxLoadCapacityKg: 1000,
        odometerKm: 500,
        acquisitionCost: 22000,
        status: 'AVAILABLE',
        region: 'North',
      },
    });

    // 1. Open maintenance log
    const openRes = await request(app)
      .post('/api/v1/maintenance')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        vehicleId: testVeh.id,
        type: 'Regular Inspection',
        cost: 120,
      });

    expect(openRes.status).toBe(201);
    expect(openRes.body.status).toBe('OPEN');

    // Verify vehicle status changed to IN_SHOP
    const vehAfterOpen = await prisma.vehicle.findUnique({ where: { id: testVeh.id } });
    expect(vehAfterOpen?.status).toBe('IN_SHOP');

    // 2. Close maintenance log
    const closeRes = await request(app)
      .post(`/api/v1/maintenance/${openRes.body.id}/close`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        cost: 150,
      });

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.status).toBe('CLOSED');

    // Verify vehicle status restored to AVAILABLE
    const vehAfterClose = await prisma.vehicle.findUnique({ where: { id: testVeh.id } });
    expect(vehAfterClose?.status).toBe('AVAILABLE');

    // Cleanup
    await prisma.maintenanceLog.delete({ where: { id: openRes.body.id } });
    await prisma.vehicle.delete({ where: { id: testVeh.id } });
  });
});
