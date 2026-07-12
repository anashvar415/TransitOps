# TransitOps

A production-ready, feature-rich Smart Transport Operations Platform tailored for the Indian logistics and transportation sector.

## Features & Capabilities

### Core Features
- **Role-Based Access Control (RBAC)**: Secure authentication and authorization for Fleet Managers, Drivers, Safety Officers, and Financial Analysts.
- **Fleet Management**: End-to-end lifecycle management of vehicles, including capacity, status tracking, and performance metrics.
- **Trip & Dispatch Tracking**: Create, assign, and track trips. Validates driver availability, vehicle capacity, and status dynamically.
- **Maintenance & Expense Logging**: Track service repairs, refuels, and general operational expenses with integrated status flows (e.g., placing a vehicle "IN_SHOP" prevents dispatch).
- **Driver Management**: Track licenses, expirations, and safety scores.

### Hackathon Polish & Bonus Enhancements 🚀
- **High-Volume Seed Data**: Automatically seeds realistic Indian transport data (25+ vehicles, 25+ drivers, 60+ trips, localized names, and real vehicle registration formats).
- **Advanced Analytics APIs**: New endpoints to calculate trailing 7-day fleet utilization, cost trends, and daily KPIs to power modern charting dashboards.
- **Filtering, Pagination & Search**: All major listing endpoints support dynamic filtering, advanced text search, and strict limit/offset pagination with standard JSON envelopes.
- **Production-Grade Security**: Integrated `Helmet` for secure HTTP headers, robust rate limiting on auth endpoints, and centralized Error Handling that elegantly traps Zod schema validation errors and database constraints.
- **Interactive Swagger UI**: Fully documented OpenAPI specification available natively on the backend for easy exploration and Postman import.

---

## Architecture
- **Backend**: Node.js, Express, TypeScript, Zod, Helmet
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React (Vite), TypeScript, Tailwind CSS (To be implemented)

---

## Prerequisites
- Node.js (v18+)
- Local PostgreSQL (or use the provided `start-db.ps1` if using the MATLAB bundle)

---

## Setup & Execution Commands

### 1. Install Dependencies
Installs dependencies across the root, backend, and frontend workspaces:
```bash
npm run install:all
```

### 2. Environment Configuration
Rename `backend/.env.example` to `backend/.env`. The default PostgreSQL connection string should work for local setups, but you can adjust `DATABASE_URL` if needed.

### 3. Start the Database (Windows/MATLAB setup)
If you're using the provided PostgreSQL binaries via MATLAB bundle:
```bash
npm run start:db
```
*(To stop the database, run: `npm run stop:db`)*

### 4. Initialize Database & Seed Data
This command runs migrations to create tables and feeds the robust Indian mock data:
```bash
npm run db:setup
```
*(To completely reset and wipe the database later, you can run `npx prisma migrate reset` inside the `backend` folder.)*

### 5. Run the Application (Backend + Frontend)
Concurrently runs the backend server (port 5000) and frontend development server:
```bash
npm run dev
```

---

## Testing & Quality Assurance

To run the backend integration and unit test suite:
```bash
npm run test
```

---

## Demo Credentials
The `db:setup` command seeds the database with the following demo users (Password for all is `Transit@123`):

| Role | Email |
| :--- | :--- |
| **Fleet Manager** | `manager@transitops.in` |
| **Driver** | `driver@transitops.in` |
| **Safety Officer** | `safety@transitops.in` |
| **Financial Analyst** | `finance@transitops.in` |

*Note: Additional realistic demo users (e.g., Rajesh Mehta, Priya Kapoor, Amit Sharma) are also seeded for each role with the same default password.*

---

## API Documentation (Swagger)
The backend includes auto-generated Swagger UI documentation for all endpoints.

1. Once the backend is running, open: [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)
2. **Postman Integration**: You can import the Swagger JSON directly into Postman by pasting the URL `http://localhost:5000/api/v1/docs-json` in the Postman Import dialog.
