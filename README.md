# Tesla Ride Pooling MVP

A full-stack ride-pooling application built with **Node.js, Express.js, MongoDB, Mongoose, React, Tailwind CSS, Docker, and Docker Compose**.

The application allows passengers to request rides between predefined Dhaka areas and automatically matches compatible passengers into shared ride pools based on route compatibility and available vehicle capacity.

---

## Features

### Authentication

* Passenger and Driver registration
* Login with JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected frontend routes

### Passenger

* Request a ride
* Select destination
* Select number of seats
* Automatically match with an existing compatible pool
* View current ride status
* View fare
* Cancel `WAITING` or `MATCHED` rides
* View ride history

### Driver

* View assigned vehicle
* View active ride pool
* View occupied and available seats
* Start a ride
* Complete a ride
* Vehicle automatically becomes available after completion

### Ride Pooling

* Automatic pool creation
* Route compatibility checking
* Vehicle capacity checking
* Atomic seat allocation
* Reuse released seats after cancellation
* Waiting ride requests are matched after a pool is completed

### Fare Calculation

All money is stored as integer **paisa** to avoid floating-point precision problems.

```text
Fare = Base Fare + Distance Charge - Pool Discount
```

Current configuration:

| Item          |  Value |
| ------------- | -----: |
| Base fare     | 50 BDT |
| Per km        | 20 BDT |
| Pool discount | 20 BDT |

Example:

```text
Banani → Mohakhali
Distance = 5 km

50 + (5 × 20) - 20
= 130 BDT
```

```text
Banani → Gulshan 1
Distance = 4 km

50 + (4 × 20) - 20
= 110 BDT
```

---

## Technology Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Zod
* Helmet
* CORS
* Jest
* Supertest

### Frontend

* React
* JavaScript
* Vite
* Tailwind CSS
* React Router

### DevOps

* Docker
* Docker Compose
* Nginx
* MongoDB Atlas

---

## Project Structure

```text
tesla-ride-pooling/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── pool/
│   │   │   ├── ride/
│   │   │   ├── user/
│   │   │   └── vehicle/
│   │   └── utils/
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
└── README.md
```

---

## Database Design



Main collections:

```text
User
 │
 ├── Vehicle
 │
 └── RideRequest
        │
        └── PoolMember
               │
               └── Pool

Pool
 │
 └── RideStatusHistory
```

### User

Stores passenger and driver accounts.

Roles:

```text
PASSENGER
DRIVER
```

### Vehicle

Stores the driver's vehicle and its capacity/status.

### RideRequest

Stores passenger ride requests, route, seats, fare and status.

Possible statuses:

```text
WAITING
MATCHED
IN_PROGRESS
COMPLETED
CANCELLED
```

### Pool

Represents a shared ride.

Possible statuses:

```text
OPEN
IN_PROGRESS
COMPLETED
CANCELLED
```

### PoolMember

Connects passengers and ride requests with a pool.

### RideStatusHistory

Tracks important ride status changes such as:

```text
IN_PROGRESS
COMPLETED
CANCELLED
```

---

## Collections

### User (`users`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `name` | String | Full name of the user |
| `email` | String | Email address (unique) |
| `password` | String | Hashed password |
| `role` | String | `passenger` or `driver` |
| `phone` | String | Phone number |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Vehicle (`vehicles`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `driverId` | ObjectId (ref: User) | Driver who owns the vehicle |
| `model` | String | Vehicle model |
| `vehicleNumber` | String | Vehicle registration number |
| `capacity` | Number | Total number of seats |
| `currentLocation` | Object | Current position `{ lat: Number, lng: Number }` |
| `status` | String | `available` or `in_use` |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### RideRequest (`rideRequests`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `passengerId` | ObjectId (ref: User) | Passenger who created the request |
| `pickupLocation` | String | Pickup location |
| `destination` | String | Destination |
| `seatsRequested` | Number | Number of seats requested |
| `fare` | Number | Calculated fare |
| `status` | String | `waiting`, `matched`, `cancelled`, etc. |
| `poolId` | ObjectId (ref: Pool) | Matched pool (empty until matched) |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Pool (`pools`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `vehicleId` | ObjectId (ref: Vehicle) | Vehicle assigned to the pool |
| `driverId` | ObjectId (ref: User) | Driver of the pool |
| `pickupLocation` | String | Starting location of the pool |
| `destination` | String | Destination of the pool |
| `totalSeats` | Number | Total seats available |
| `occupiedSeats` | Number | Seats already booked |
| `status` | String | `open`, `in_progress`, `completed`, etc. |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### PoolMember (`poolMembers`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `poolId` | ObjectId (ref: Pool) | Pool the passenger has joined |
| `rideRequestId` | ObjectId (ref: RideRequest) | Associated ride request |
| `userId` | ObjectId (ref: User) | Passenger |
| `seats` | Number | Number of seats booked |
| `joinedAt` | Date | Time the passenger joined the pool |
| `status` | String | `active` or `cancelled` |

### RideStatusHistory (`rideStatusHistory`)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `poolId` | ObjectId (ref: Pool) | Associated pool |
| `rideRequestId` | ObjectId (ref: RideRequest) | Associated ride request |
| `status` | String | `requested`, `matched`, `in_progress`, `completed`, `cancelled` |
| `timestamp` | Date | Time of the status change |
| `updatedBy` | ObjectId (ref: User) | User who made the update (optional) |
| `notes` | String | Additional remarks (optional) |

---

## Ride Matching Logic

The application currently uses predefined Dhaka routes instead of a map API.

Supported pickup:

```text
Banani
```

Supported destinations:

```text
Mohakhali
Gulshan 1
```

Passengers can share a pool when:

1. Pickup area is the same.
2. Destination is compatible.
3. Enough vehicle capacity is available.

For example:

```text
Banani → Mohakhali
```

and

```text
Banani → Gulshan 1
```

are considered compatible routes.

---

## Ride Lifecycle

### Passenger

```text
Create Request
      ↓
WAITING
      ↓
MATCHED
      ↓
IN_PROGRESS
      ↓
COMPLETED
```

Cancellation is allowed from:

```text
WAITING
MATCHED
```

### Driver

```text
OPEN
 ↓
IN_PROGRESS
 ↓
COMPLETED
```

When a pool starts:

```text
Vehicle → OFFLINE
```

When the pool completes:

```text
Vehicle → AVAILABLE
```

---

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Ride Requests

```text
POST   /api/ride-requests
GET    /api/ride-requests/my
GET    /api/ride-requests/:id
POST   /api/ride-requests/:id/cancel
```

### Vehicles

```text
GET /api/vehicles/my
```

### Pools

```text
GET   /api/pools/my
PATCH /api/pools/:poolId/status
```

### Health

```text
GET /health
```

---

## Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/tesla_ride
JWT_SECRET=your-super-secret-key
```

Never commit `.env` to Git.

---

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Docker

The project can be started using Docker Compose.

From the project root:

```bash
docker compose build
docker compose up
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

Stop containers:

```bash
docker compose down
```

---

## Demo Credentials

The seed data provides demo users.

### Driver

```text
Email: jashim@example.com
Password: password123
Role: DRIVER
Vehicle: Bullet
Capacity: 3
```

### Passenger

```text
Email: nusrat@example.com
Password: password123
Role: PASSENGER
```

Additional passenger accounts:

```text
rafiq@example.com
shirin@example.com
rahim@example.com
karim@example.com
```

Password:

```text
password123
```

---

## Example Demo Flow

### Passenger

1. Login as Nusrat.
2. Select `Banani` as pickup.
3. Select `Mohakhali` as destination.
4. Request one seat.
5. Ride is automatically matched to a pool.
6. Fare is calculated as 130 BDT.

### Driver

1. Login as Jashim.
2. Open Driver Dashboard.
3. View the active pool.
4. Start the ride.
5. Complete the ride.

The passenger ride then changes:

```text
MATCHED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

---

## Design Decisions

### Integer Money

Money is stored as paisa rather than floating-point BDT values.

For example:

```text
130 BDT → 13000 paisa
```

This avoids floating-point precision issues.

### Predefined Routes

The MVP uses deterministic predefined routes instead of Google Maps or another mapping service.

This keeps the matching logic predictable and avoids external API dependency.

### Role-Based Access

Passengers and drivers have different permissions.

For example:

```text
PASSENGER
→ Request/cancel rides

DRIVER
→ Start/complete pools
→ View vehicle
```

### Atomic Seat Allocation

Pool seat updates use an atomic MongoDB update to prevent the occupied seat count from exceeding the pool capacity during concurrent requests.

### Transactions

Pool status changes use MongoDB transactions to keep related updates synchronized, including:

* Pool status
* Vehicle status
* Ride request statuses
* Ride status history

---

## Known Limitations

This is an MVP implementation.

Current limitations include:

* Routes are predefined.
* No real-time GPS tracking.
* No map integration.
* No online payment system.
* No push notifications.
* No production-grade monitoring.
* No advanced route optimization.
* No dynamic pricing.
* Pool matching is based on predefined compatibility rules.

---

## Future Improvements

Possible future improvements:

* Google Maps or OpenStreetMap integration
* Real-time driver location
* WebSocket-based ride updates
* Online payments
* Push notifications
* Advanced route matching
* Driver ratings
* Passenger ratings
* Admin dashboard
* Production monitoring
* Redis-based caching
* More robust distributed concurrency handling

---

## Security

The application includes:

* JWT authentication
* bcrypt password hashing
* Role-based authorization
* Zod request validation
* Helmet security headers
* CORS configuration
* Environment-based secrets

Sensitive environment variables should never be committed to the repository.

---

## Live Demo

| Resource             | Link                                       |
| -------------------- | ------------------------------------------ |
| 🌐 Live              | https://tesla-ride-frontend.onrender.com/  |

### Demo Credentials

**Driver**

* Email: `jashim@example.com`
* Password: `password123`

**Passenger**

* Email: `nusrat@example.com`
* Password: `password123`

> The live demo uses predefined Dhaka zones and simulated route distances. No external map service is required.


## License

This project is developed as a ride-pooling MVP and can be extended for educational or production use with additional security, scalability and operational improvements.
