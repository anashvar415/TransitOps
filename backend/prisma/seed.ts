import { PrismaClient, Role, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDecimal = (min: number, max: number, decimals = 2): number => Number((Math.random() * (max - min) + min).toFixed(decimals));

// Data Banks
const vehicleModels = [
  { name: 'Tata Ace Gold', type: 'Mini Truck', capacity: 750 },
  { name: 'Mahindra Bolero Pik-Up', type: 'Pickup', capacity: 1500 },
  { name: 'Ashok Leyland Dost', type: 'Mini Truck', capacity: 1250 },
  { name: 'Tata 407', type: 'Light Commercial', capacity: 2500 },
  { name: 'Eicher Pro 2049', type: 'Light Truck', capacity: 4900 },
  { name: 'Tata Signa 2825', type: 'Heavy Truck', capacity: 28000 },
  { name: 'BharatBenz 1917R', type: 'Medium Truck', capacity: 18500 },
  { name: 'Volvo FM 400', type: 'Heavy Truck', capacity: 40000 },
  { name: 'Maruti Suzuki Eeco Cargo', type: 'Van', capacity: 600 },
  { name: 'Bajaj Maxima C', type: '3-Wheeler', capacity: 500 },
];

const indianCities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Patna", "Bhopal", "Agra"];
const regions = ["North", "South", "East", "West", "Central"];

const driverNames = [
  "Amit Sharma", "Rakesh Yadav", "Neha Singh", "Rajesh Kumar", "Sunil Gupta", 
  "Vikram Patel", "Rahul Verma", "Suresh Desai", "Deepak Joshi", "Ravi Nair", 
  "Ajay Menon", "Prakash Reddy", "Kiran Rao", "Vijay Das", "Arun Bose", 
  "Sanjay Ghosh", "Gaurav Sen", "Anil Chauhan", "Manoj Tiwari", "Kishore Mistry", 
  "Ramesh Thakur", "Vinod Prasad", "Tarun Bajaj", "Mohan Lal", "Dilip Chhetri"
];

const generateRegistration = () => {
  const states = ["MH", "DL", "KA", "UP", "GJ", "TN", "WB", "RJ"];
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const st = randomElement(states);
  const code = randomInt(1, 40).toString().padStart(2, '0');
  const randChars = randomElement(letters.split('')) + randomElement(letters.split(''));
  const randNums = randomInt(1000, 9999);
  return `${st}${code} ${randChars} ${randNums}`;
};

async function main() {
  console.log('Seeding database with high-volume Indian transport data...');

  // Clean old data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('Transit@123', 10);

  const managerUser = await prisma.user.create({ data: { name: 'Fleet Manager', email: 'manager@transitops.in', passwordHash, role: Role.FLEET_MANAGER } });
  const driverUser = await prisma.user.create({ data: { name: 'Driver', email: 'driver@transitops.in', passwordHash, role: Role.DRIVER } });
  const safetyUser = await prisma.user.create({ data: { name: 'Safety Officer', email: 'safety@transitops.in', passwordHash, role: Role.SAFETY_OFFICER } });
  const financeUser = await prisma.user.create({ data: { name: 'Financial Analyst', email: 'finance@transitops.in', passwordHash, role: Role.FINANCIAL_ANALYST } });

  const extraUsers = [
    { name: 'Rajesh Mehta', email: 'rajesh@transitops.in', passwordHash, role: Role.FLEET_MANAGER },
    { name: 'Priya Kapoor', email: 'priya@transitops.in', passwordHash, role: Role.FLEET_MANAGER },
    { name: 'Amit Sharma', email: 'amit@transitops.in', passwordHash, role: Role.DRIVER },
    { name: 'Rakesh Yadav', email: 'rakesh@transitops.in', passwordHash, role: Role.DRIVER },
    { name: 'Neha Singh', email: 'neha@transitops.in', passwordHash, role: Role.DRIVER },
    { name: 'Vikram Verma', email: 'vikram@transitops.in', passwordHash, role: Role.SAFETY_OFFICER },
    { name: 'Pooja Nair', email: 'pooja@transitops.in', passwordHash, role: Role.SAFETY_OFFICER },
    { name: 'Karan Gupta', email: 'karan@transitops.in', passwordHash, role: Role.FINANCIAL_ANALYST },
    { name: 'Sneha Joshi', email: 'sneha@transitops.in', passwordHash, role: Role.FINANCIAL_ANALYST }
  ];
  await prisma.user.createMany({ data: extraUsers });
  console.log('Created Users.');

  // Create 25 Vehicles
  const vehicles = [];
  const vehicleStatuses = [VehicleStatus.AVAILABLE, VehicleStatus.AVAILABLE, VehicleStatus.AVAILABLE, VehicleStatus.ON_TRIP, VehicleStatus.IN_SHOP, VehicleStatus.RETIRED];
  
  for (let i = 0; i < 25; i++) {
    const model = randomElement(vehicleModels);
    vehicles.push({
      registrationNumber: generateRegistration(),
      name: model.name,
      type: model.type,
      maxLoadCapacityKg: model.capacity,
      odometerKm: randomInt(5000, 150000),
      acquisitionCost: randomInt(300000, 2500000),
      status: randomElement(vehicleStatuses),
      region: randomElement(regions),
    });
  }
  await prisma.vehicle.createMany({ data: vehicles });
  const createdVehicles = await prisma.vehicle.findMany();
  console.log(`Created ${createdVehicles.length} Vehicles.`);

  // Create 25 Drivers
  const drivers = [];
  const driverStatuses = [DriverStatus.AVAILABLE, DriverStatus.AVAILABLE, DriverStatus.ON_TRIP, DriverStatus.OFF_DUTY, DriverStatus.SUSPENDED];
  
  for (let i = 0; i < 25; i++) {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + randomInt(-1, 5)); // Some might be expired (-1)
    
    drivers.push({
      name: driverNames[i],
      licenseNumber: `DL${randomInt(10, 99)} ${randomInt(1000000, 9999999)}`,
      licenseCategory: randomElement(['HMV', 'LMV', 'TRANS']),
      licenseExpiryDate: expiry,
      contactNumber: `+91 9${randomInt(100000000, 999999999)}`,
      safetyScore: randomInt(50, 100),
      status: randomElement(driverStatuses),
      // Assign the first few to our demo users for testing if needed
      userId: i === 0 ? driverUser.id : null, 
    });
  }
  await prisma.driver.createMany({ data: drivers });
  const createdDrivers = await prisma.driver.findMany();
  console.log(`Created ${createdDrivers.length} Drivers.`);

  // Create 60 Trips
  const tripStatuses = [TripStatus.COMPLETED, TripStatus.COMPLETED, TripStatus.COMPLETED, TripStatus.DISPATCHED, TripStatus.DRAFT, TripStatus.CANCELLED];
  
  for (let i = 0; i < 60; i++) {
    const v = randomElement(createdVehicles);
    const d = randomElement(createdDrivers);
    const src = randomElement(indianCities);
    let dest = randomElement(indianCities);
    while (dest === src) dest = randomElement(indianCities);
    
    const plannedDist = randomInt(50, 1200);
    const status = randomElement(tripStatuses);
    
    let actualDist = null;
    let fuelConsumed = null;
    let rev = null;
    let dispatchedAt = null;
    let completedAt = null;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - randomInt(1, 60)); // Random date in last 60 days

    if (status === TripStatus.DISPATCHED || status === TripStatus.COMPLETED) {
      dispatchedAt = new Date(baseDate);
      rev = randomInt(5000, 50000);
    }
    
    if (status === TripStatus.COMPLETED) {
      actualDist = plannedDist + randomInt(-20, 50);
      fuelConsumed = actualDist / randomDecimal(4, 15); // e.g. 4kmpl to 15kmpl
      completedAt = new Date(baseDate.getTime() + randomInt(2, 48) * 3600000); // 2 to 48 hours later
    }

    const trip = await prisma.trip.create({
      data: {
        source: src,
        destination: dest,
        vehicleId: v.id,
        driverId: d.id,
        cargoWeightKg: randomInt(100, Number(v.maxLoadCapacityKg)),
        plannedDistanceKm: plannedDist,
        actualDistanceKm: actualDist,
        fuelConsumedLiters: fuelConsumed,
        revenue: rev,
        status: status,
        createdById: managerUser.id,
        dispatchedAt,
        completedAt,
        createdAt: baseDate,
      },
    });

    // Generate Fuel Logs for COMPLETED trips
    if (status === TripStatus.COMPLETED && fuelConsumed) {
      await prisma.fuelLog.create({
        data: {
          vehicleId: v.id,
          tripId: trip.id,
          liters: fuelConsumed,
          cost: fuelConsumed * randomDecimal(90, 105), // Petrol/Diesel cost approx ₹90-105
          date: completedAt || new Date(),
        }
      });
    }
  }
  console.log(`Created 60 Trips and related Fuel Logs.`);

  // Extra standalone Fuel Logs
  for (let i = 0; i < 20; i++) {
    const v = randomElement(createdVehicles);
    const liters = randomInt(10, 100);
    await prisma.fuelLog.create({
      data: {
        vehicleId: v.id,
        liters: liters,
        cost: liters * randomDecimal(90, 105),
        date: new Date(Date.now() - randomInt(1, 30) * 86400000),
      }
    });
  }

  // Create 20 Maintenance Logs
  const maintenanceTypes = ['Oil Change', 'Tyre Replacement', 'Brake Pad Replacement', 'Engine Tune-up', 'Battery Check', 'Suspension Repair'];
  for (let i = 0; i < 20; i++) {
    const v = randomElement(createdVehicles);
    const mStatus = randomElement([MaintenanceStatus.OPEN, MaintenanceStatus.CLOSED, MaintenanceStatus.CLOSED]);
    const openedAt = new Date(Date.now() - randomInt(2, 40) * 86400000);
    const closedAt = mStatus === MaintenanceStatus.CLOSED ? new Date(openedAt.getTime() + randomInt(1, 5) * 86400000) : null;
    
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: v.id,
        type: randomElement(maintenanceTypes),
        cost: randomInt(2000, 25000),
        status: mStatus,
        openedAt,
        closedAt,
      }
    });
  }
  console.log(`Created Maintenance Logs.`);

  // Create 35 Expense Records
  const expenseTypes = ['Toll Tax', 'Border Tax', 'Challan', 'Driver Allowance', 'Cleaning', 'Weighbridge', 'Misc'];
  for (let i = 0; i < 35; i++) {
    const v = randomElement(createdVehicles);
    await prisma.expense.create({
      data: {
        vehicleId: randomElement([v.id, null]), // Some expenses are fleet-wide
        type: randomElement(expenseTypes),
        amount: randomInt(100, 5000),
        date: new Date(Date.now() - randomInt(1, 60) * 86400000),
        notes: `Random operational expense for ${randomElement(indianCities)} route.`,
      }
    });
  }
  console.log(`Created Expense Records.`);
  console.log('Database successfully seeded with realistic Indian data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
