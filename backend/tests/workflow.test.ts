import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/db';

let managerToken = '';

beforeAll(async () => {
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'manager@transitops.com',
    password: 'Password123',
  });
  managerToken = loginRes.body.accessToken;

  // Clean up any conflicting records from seeding or previous runs
  await prisma.maintenanceLog.deleteMany({ where: { vehicle: { registrationNumber: 'Van-05' } } });
  await prisma.fuelLog.deleteMany({ where: { vehicle: { registrationNumber: 'Van-05' } } });
  await prisma.trip.deleteMany({ where: { vehicle: { registrationNumber: 'Van-05' } } });
  await prisma.driver.deleteMany({ where: { licenseNumber: 'LIC-999' } });
  await prisma.vehicle.deleteMany({ where: { registrationNumber: 'Van-05' } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('TransitOps Section 5 Example Workflow Integration Test', () => {
  let vehicleId = '';
  let driverId = '';
  let tripId = '';
  let maintLogId = '';

  test('Step 1: Register vehicle "Van-05" with max capacity 500 kg', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        registrationNumber: 'Van-05',
        name: 'Workflow Mercedes Sprinter',
        type: 'Van',
        maxLoadCapacityKg: 500,
        odometerKm: 100,
        acquisitionCost: 20000,
        region: 'North',
      });

    expect(res.status).toBe(201);
    expect(res.body.registrationNumber).toBe('Van-05');
    expect(res.body.status).toBe('AVAILABLE');
    vehicleId = res.body.id;
  });

  test('Step 2: Register driver "Alex" with a valid driving license', async () => {
    // Note: We register Alex with license number LIC-999 to avoid conflict with LIC-10001
    const res = await request(app)
      .post('/api/v1/drivers')
      .set('Authorization', `Bearer ${managerToken}`) // Safety officer has this, but manager is allowed to read and let's check who can create drivers.
      // Wait, the specification says "Safety Officer: Full CRUD on drivers, license/compliance, safety scores". Let's get safety officer token if manager fails.
      // Wait, let's login as safety officer to be fully compliant with the RBAC!
      ;

    const safetyLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'safety@transitops.com',
      password: 'Password123',
    });
    const safetyToken = safetyLogin.body.accessToken;

    const createDriverRes = await request(app)
      .post('/api/v1/drivers')
      .set('Authorization', `Bearer ${safetyToken}`)
      .send({
        name: 'Alex Workflow',
        licenseNumber: 'LIC-999',
        licenseCategory: 'A',
        licenseExpiryDate: '2028-12-31',
        contactNumber: '555-9999',
        safetyScore: 90,
      });

    expect(createDriverRes.status).toBe(201);
    expect(createDriverRes.body.name).toBe('Alex Workflow');
    expect(createDriverRes.body.status).toBe('AVAILABLE');
    driverId = createDriverRes.body.id;
  });

  test('Step 3: Create a trip with Cargo Weight = 450 kg', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        source: 'Depot A',
        destination: 'Client B',
        vehicleId,
        driverId,
        cargoWeightKg: 450,
        plannedDistanceKm: 150,
        revenue: 600,
      });

    expect(res.status).toBe(201);
    expect(Number(res.body.cargoWeightKg)).toBe(450);
    expect(res.body.status).toBe('DRAFT');
    tripId = res.body.id;
  });

  test('Step 4 & 5: Dispatch the trip (validates cargo <= vehicle capacity and sets statuses to ON_TRIP)', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/dispatch`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DISPATCHED');

    // Check vehicle status became ON_TRIP
    const veh = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(veh?.status).toBe('ON_TRIP');

    // Check driver status became ON_TRIP
    const drv = await prisma.driver.findUnique({ where: { id: driverId } });
    expect(drv?.status).toBe('ON_TRIP');
  });

  test('Step 6 & 7: Complete trip by entering final odometer and fuel consumed, restoring vehicle & driver status to AVAILABLE', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${tripId}/complete`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        finalOdometer: 250, // 100 original + 150 planned = 250
        fuelConsumedLiters: 12,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
    expect(Number(res.body.actualDistanceKm)).toBe(150);

    // Verify status restored to AVAILABLE
    const veh = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(veh?.status).toBe('AVAILABLE');
    expect(Number(veh?.odometerKm)).toBe(250);

    const drv = await prisma.driver.findUnique({ where: { id: driverId } });
    expect(drv?.status).toBe('AVAILABLE');

    // Verify a FuelLog was created and linked
    const fuelLog = await prisma.fuelLog.findFirst({
      where: { tripId },
    });
    expect(fuelLog).toBeDefined();
    expect(Number(fuelLog?.liters)).toBe(12);
  });

  test('Step 8: Create a maintenance record (Vehicle status becomes IN_SHOP and is hidden from dispatch)', async () => {
    const res = await request(app)
      .post('/api/v1/maintenance')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        vehicleId,
        type: 'Oil Change',
        cost: 60,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('OPEN');
    maintLogId = res.body.id;

    // Verify vehicle status became IN_SHOP
    const veh = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    expect(veh?.status).toBe('IN_SHOP');

    // Verify vehicle is excluded from available-vehicles picker
    const pickerRes = await request(app)
      .get('/api/v1/trips/available-vehicles')
      .set('Authorization', `Bearer ${managerToken}`);
    const availableIds = pickerRes.body.map((v: any) => v.id);
    expect(availableIds).not.toContain(vehicleId);
  });

  test('Step 9: Reports update operational cost and fuel efficiency based on the latest trip and fuel log', async () => {
    // 1. Check fuel efficiency report
    const effRes = await request(app)
      .get('/api/v1/reports/fuel-efficiency')
      .set('Authorization', `Bearer ${managerToken}`);

    const vehEff = effRes.body.find((item: any) => item.vehicleId === vehicleId);
    expect(vehEff).toBeDefined();
    expect(vehEff.totalDistance).toBe(150);
    expect(vehEff.totalFuel).toBe(12);
    expect(vehEff.efficiency).toBe(12.5); // 150 / 12 = 12.5

    // 2. Check operational cost report (Fuel cost = 12 * 1.5 = 18. Maintenance cost = 60. Total = 78)
    const costRes = await request(app)
      .get('/api/v1/reports/operational-cost')
      .set('Authorization', `Bearer ${managerToken}`);

    const vehCost = costRes.body.find((item: any) => item.vehicleId === vehicleId);
    expect(vehCost).toBeDefined();
    expect(vehCost.fuelCost).toBe(18);
    expect(vehCost.maintenanceCost).toBe(60);
    expect(vehCost.totalCost).toBe(78);

    // 3. Check Vehicle ROI ((Revenue: 600 - cost: 78) / acquisition: 20000 = 2.61%)
    const roiRes = await request(app)
      .get('/api/v1/reports/vehicle-roi')
      .set('Authorization', `Bearer ${managerToken}`);

    const vehRoi = roiRes.body.find((item: any) => item.vehicleId === vehicleId);
    expect(vehRoi).toBeDefined();
    expect(vehRoi.roi).toBe(2.61);
  });
});
