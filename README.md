# TiffinTrack

TiffinTrack is a full-stack app for home-style tiffin subscription management. It helps owners track customers, subscriptions, pause windows, and generate pro-rated monthly bills based on actual delivered weekdays.

## Product purpose

- Manage home tiffin customers and monthly plans
- Track subscription start dates and billing periods
- Allow pauses for travel, illness, or festive days
- Exclude paused days from billing automatically
- Generate an auditable monthly breakdown for every customer

## Tech stack

- SQLite + Sequelize
- Node.js + Express.js
- React + Vite + React Router
- JWT authentication with bcrypt hashing

## Assumptions

- Only the owner/admin logs into the dashboard.
- Customer records are managed by the owner, not separate customer accounts.
- Date values are stored and processed as plain ISO calendar dates in YYYY-MM-DD format to avoid timezone drift.
- The app uses a local SQLite file at `DATABASE_PATH` and does not require external database hosting.

## One-command local setup

Run this to create the local environment file, install all dependencies, seed the SQLite database, and start the app:

```bash
cp .env.example .env && npm install && npm install --prefix backend && npm install --prefix frontend && npm run seed && npm run dev
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
- POST `/api/auth/login`
- GET `/api/auth/me`

### Customers

- GET `/api/customers?page=1&limit=10&sort=createdAt&direction=desc&search=9876`
- POST `/api/customers`
- GET `/api/customers/:id`
- PUT `/api/customers/:id`
- DELETE `/api/customers/:id`

### Plans

- GET `/api/plans`
- POST `/api/plans`
- GET `/api/plans/:id`
- PUT `/api/plans/:id`
- DELETE `/api/plans/:id`

### Subscriptions

- POST `/api/subscriptions`
- GET `/api/subscriptions/:subscriptionId`
- GET `/api/subscriptions/:subscriptionId/status`
- POST `/api/subscriptions/:subscriptionId/pause`
- POST `/api/subscriptions/:subscriptionId/resume`

### Bills

- POST `/api/bills/generate`
- GET `/api/bills`

## Database model summary

- Users: id, name, email, passwordHash, createdAt
- Plans: id, name, pricePerMonth, description
- Customers: id, name, phone, address, createdAt
- Subscriptions: id, customerId, planId, startDate, isActive
- Pauses: id, subscriptionId, startDate, endDate, reason
- Bills: id, customerId, subscriptionId, month, year, totalWeekdays, pausedDays, billableDays, ratePerDay, finalAmount, generatedAt

This database is stored in a local SQLite file generated from the `DATABASE_PATH` value in `.env`.

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

- The SQLite database file is created automatically from `DATABASE_PATH` in `.env`.
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
