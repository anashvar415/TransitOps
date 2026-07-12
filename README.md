# TransitOps

A production-ready Smart Transport Operations Platform.

## Architecture
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React (Vite), TypeScript (To be implemented)

## Prerequisites
- Node.js (v18+)
- Local PostgreSQL (or use the provided `start-db.ps1` if using the MATLAB bundle)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Environment Variables**
   Rename `backend/.env.example` to `backend/.env` and update the `DATABASE_URL` if not using the default setup.

3. **Start the Database (Windows/MATLAB setup)**
   ```bash
   npm run start:db
   ```

4. **Initialize Database & Seed Data**
   ```bash
   npm run db:setup
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```

## Demo Credentials
The `db:setup` command seeds the database with the following demo users (Password for all is `password123`):
- **Fleet Manager**: `demo_manager@transitops.com`
- **Driver**: `demo_driver@transitops.com`
- **Safety Officer**: `demo_safety@transitops.com`
- **Financial Analyst**: `demo_finance@transitops.com`

## Testing
To run the backend test suite, use:
```bash
npm run test
```
