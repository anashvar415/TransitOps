# Design Decisions & Assumptions

This file documents the key design decisions and assumptions made during the development of the **TransitOps** platform.

## 1. Database Portability
*   **Problem**: The development machine lacks a global PostgreSQL installation or Docker.
*   **Decision**: We leverage the pre-existing PostgreSQL 15.11 binaries bundled in the local MATLAB installation at `C:\Program Files\MATLAB\R2025a\sys\postgresql\win64\PostgreSQL`.
*   **Implementation**: Scripts `start-db.ps1` and `stop-db.ps1` configure the process `PATH` to include the required MATLAB runtime DLLs (`C:\Program Files\MATLAB\R2025a\bin\win64`) and start/stop the DB on port `5432` with `trust` authorization for simple, passwordless local development.

## 2. ROI Revenue Source
*   **Problem**: The `Vehicle ROI` calculation is defined as `(Revenue - (Maintenance + Fuel)) / AcquisitionCost`. However, the database schema doesn't specify a `Revenue` source.
*   **Decision**: We added a `revenue` field (Decimal) to the `Trip` table.
*   **Logic**: Each completed trip generates revenue based on cargo weight and distance. The ROI report aggregates all completed trip revenues per vehicle to calculate the true operational ROI.

## 3. FuelLog and Trip Relationship
*   **Problem**: Section 3.7 states that completing a trip accepts a final odometer reading and fuel consumed, updating the vehicle's odometer and creating/linking a FuelLog entry.
*   **Decision**: We added an optional `tripId` field to the `FuelLog` schema. When completing a trip, the backend automatically creates a `FuelLog` entry linked to the vehicle and the trip, recording the liters and cost of fuel consumed.

## 4. Authentication and Session Management
*   **Decision**: Security is managed via short-lived JWT Access Tokens (15 minutes) sent in the authorization header and HttpOnly secure Refresh Tokens (7 days) sent as cookies to handle token rotation safely.
*   **Access Control**: Role-Based Access Control (RBAC) is enforced both backend-side on route endpoints (using Express middleware) and frontend-side (using React Router guards).
