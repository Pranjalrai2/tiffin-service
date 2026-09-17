# TiffinTrack

TiffinTrack is a full-stack tiffin subscription management app for home kitchen businesses. It helps an owner track customers, plans, subscription dates, planned pauses, and monthly billing using business-friendly rule-based calculations.

## Overview

The application is designed for a single admin owner who manages the entire operation from a dashboard. Customers are stored as records with contact information, and each customer can be assigned a subscription tied to a plan, a start date, and optional pause periods.

The app calculates a monthly bill based on weekday counts, subtracting any paused days and aligning the invoice to the actual service period.

## Core features

- Manage customers, plans, and subscriptions
- Assign a plan to a customer with a start date
- Pause service for a date range and store pause history
- Automatically calculate monthly billing using weekday logic
- View and generate customer bills from the dashboard
- Authenticate the owner through a secure JWT flow
- Run locally with a SQLite database and no external hosting dependency

## Tech stack

- Node.js + Express.js
- SQLite + Sequelize
- React + Vite
- JWT authentication with bcrypt
- CORS and validation middleware for the API

## Local setup

### 1) Create environment variables

```bash
cp .env.example .env
```

The default environment file includes:

```env
DATABASE_PATH=./data/tiffin.sqlite
JWT_SECRET=replace_with_super_secret_key
PORT=5000
```

### 2) Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3) Seed the database

```bash
npm run seed
```

This creates the SQLite database and inserts initial seed data, including the default admin account.

### 4) Start the app

```bash
npm run dev
```

This starts:

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Default admin login

The seeded account is:

- Email: admin@tiffintrack.com
- Password: admin123

## API overview

All endpoints respond in a consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Optional status message"
}
```

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Customers

- GET /api/customers
- POST /api/customers
- GET /api/customers/:id
- PUT /api/customers/:id
- DELETE /api/customers/:id

### Plans

- GET /api/plans
- POST /api/plans
- GET /api/plans/:id
- PUT /api/plans/:id
- DELETE /api/plans/:id

### Subscriptions

- POST /api/subscriptions
- GET /api/subscriptions/:subscriptionId
- GET /api/subscriptions/:subscriptionId/status
- POST /api/subscriptions/:subscriptionId/pause
- POST /api/subscriptions/:subscriptionId/resume

### Bills

- POST /api/bills/generate
- GET /api/bills
- GET /api/bills/:id

## Data model summary

- User: id, name, email, password, createdAt
- Plan: id, name, pricePerMonth, description
- Customer: id, name, phone, address, createdAt
- Subscription: id, customerId, planId, startDate, isActive
- Pause: id, subscriptionId, startDate, endDate, reason
- Bill: id, customerId, subscriptionId, month, year, totalWeekdays, pausedDays, billableDays, ratePerDay, finalAmount, generatedAt

## Billing logic

The billing utility calculates a monthly invoice as follows:

1. Identify all weekdays in the selected month.
2. Ignore dates before the subscription start date.
3. Remove weekdays that fall within a pause range.
4. Compute the per-day rate using the plan price divided by the month’s total weekdays.
5. Multiply the daily rate by the remaining billable weekdays.

The formula is effectively:

```text
ratePerDay = planPrice / totalWeekdaysInMonth
finalAmount = ratePerDay * billableWeekdays
```

This logic is implemented in backend/utils/billing.js and designed to be reusable and testable.

## Project structure

```text
.
├── .env.example
├── README.md
├── AI_LOGS.md
├── REASONING.md
├── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## Notes

- The database is stored locally at the path defined in DATABASE_PATH.
- Date values are handled as YYYY-MM-DD strings to avoid timezone-related drift.
- The app is built around a single admin workflow and does not include a separate customer-facing login.
- For production deployment, the backend can be started via its own package scripts and the frontend can be built for static hosting.

## Production startup

```bash
npm --prefix backend run start
npm --prefix frontend run build
```

This is useful when the app is being deployed behind a managed Node.js server or a static hosting platform.

