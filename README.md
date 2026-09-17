# TiffinTrack

TiffinTrack is a full-stack MERN application for home-style tiffin subscription management. It helps owners track customers, subscriptions, pause windows, and generate pro-rated monthly bills based on actual delivered weekdays.

## Product purpose

- Manage home tiffin customers and monthly plans
- Track subscription start dates and billing periods
- Allow pauses for travel, illness, or festive days
- Exclude paused days from billing automatically
- Generate an auditable monthly breakdown for every customer

## Tech stack

- MongoDB + Mongoose
- Node.js + Express.js
- React + Vite + React Router
- JWT authentication with bcrypt hashing

## Assumptions

- Only the owner/admin logs into the dashboard.
- Customer records are managed by the owner, not separate customer accounts.
- Date values are stored and processed as plain ISO calendar dates in YYYY-MM-DD format to avoid timezone drift.
- The app expects a MongoDB instance available locally or via Atlas and uses `MONGO_URI` from `.env`.

## Local setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local MongoDB URI and secret:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/tiffintrack
   JWT_SECRET=your_secret_here
   PORT=5000
   ```

3. Install dependencies:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

4. Seed sample data:

   ```bash
   npm run seed
   ```

5. Start the app in development mode:

   ```bash
   npm run dev
   ```

   This runs the backend on port 5000 and the frontend on port 5173.

## Production startup

```bash
npm --prefix backend run start
npm --prefix frontend run build
```

## API endpoints

All API routes use a consistent JSON envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Optional status message"
}
```

### Authentication

- POST `/api/auth/register`
  - Register a new owner/admin account.
  - Request body:

    ```json
    {
      "name": "Owner Admin",
      "email": "admin@tiffintrack.com",
      "password": "admin123"
    }
    ```

  - Response:

    ```json
    {
      "success": true,
      "token": "jwt-token",
      "user": {
        "id": "...",
        "name": "Owner Admin",
        "email": "admin@tiffintrack.com"
      }
    }
    ```

- POST `/api/auth/login`
  - Login with an email and password.

- GET `/api/auth/me`
  - Return the current authenticated owner information.

### Customers

- GET `/api/customers?page=1&limit=10&sort=createdAt&direction=desc&search=9876`
  - List customers with pagination, sorting, and phone search.

- POST `/api/customers`
  - Create a customer record.
  - Request body:

    ```json
    {
      "name": "Rohit Kumar",
      "phone": "9988776655",
      "address": "Green Park, Jaipur"
    }
    ```

- GET `/api/customers/:id`
  - Fetch a single customer with current subscription, pause history, and live status.

- PUT `/api/customers/:id`
  - Update a customer record.

- DELETE `/api/customers/:id`
  - Delete customer and related subscriptions.

### Plans

- GET `/api/plans`
  - List all available plans.

- POST `/api/plans`
  - Create a plan.

   ```json
   {
     "name": "Classic Monthly",
     "pricePerMonth": 4800,
     "description": "Weekday lunch plan"
   }
   ```

- GET `/api/plans/:id`
- PUT `/api/plans/:id`
- DELETE `/api/plans/:id`

### Subscriptions

- POST `/api/subscriptions`
  - Create a subscription for a customer and plan.

   ```json
   {
     "customerId": "64ef3c4d5d06cbe18be8d14b",
     "planId": "64ef3ca45d06cbe18be8d14d",
     "startDate": "2026-09-01"
   }
   ```

- GET `/api/subscriptions/:subscriptionId`
  - Get subscription details, plan, and pause history.

- GET `/api/subscriptions/:subscriptionId/status`
  - Compute live status as Active or Paused.

- POST `/api/subscriptions/:subscriptionId/pause`
  - Pause a subscription for a date range.

   ```json
   {
     "startDate": "2026-09-12",
     "endDate": "2026-09-15",
     "reason": "Travel"
   }
   ```

- POST `/api/subscriptions/:subscriptionId/resume`
  - Close the active pause at the resume date.

   ```json
   {
     "date": "2026-09-16"
   }
   ```

### Bills

- POST `/api/bills/generate`
  - Generate a monthly bill using the pro-rated weekday formula.

   ```json
   {
     "subscriptionId": "64ef3c4d5d06cbe18be8d14b",
     "monthYear": "2026-09"
   }
   ```

  - Response includes detailed breakdown:

   ```json
   {
     "success": true,
     "data": {
       "finalAmount": 4363.64,
       "month": 9,
       "year": 2026,
       "totalWeekdays": 22,
       "pausedDays": 2,
       "billableDays": 20,
       "ratePerDay": 218.18,
       "breakdown": {
         "totalWeekdays": 22,
         "pausedDays": 2,
         "billableDays": 20,
         "ratePerDay": 218.18,
         "finalAmount": 4363.64
       }
     }
   }
   ```

- GET `/api/bills`
  - List all generated bills.

- GET `/api/bills/:id`
  - Retrieve a single bill.

## Billing logic

The monthly bill is calculated with this formula:

- total weekdays in the active billing month and after the subscription start date
- subtract paused weekdays for that month
- billable days = total weekdays - paused weekdays
- rate per day = plan price / total weekdays
- final bill = rate per day × billable days

This is implemented in `backend/utils/billing.js` as a reusable utility to make testing and maintenance easier.

## Notes on running locally

- If MongoDB is not running, start it locally or update the `MONGO_URI` to your Atlas connection string.
- The seed script creates an example admin login:
  - email: `admin@tiffintrack.com`
  - password: `admin123`

## Project structure

```text
README.md
.env.example
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js
  seed.js
frontend/
  src/
  index.html
  vite.config.js
```
