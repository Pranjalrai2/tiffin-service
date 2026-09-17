# AI Project Log

This log records the implementation history, reasoning, and important product decisions behind TiffinTrack. It is intentionally written as a concise engineering diary so the project remains understandable even without access to the original conversation transcript.

## Project goal

Build a lightweight tiffin subscription management app for a home-based food service business. The app must allow a single owner to manage customers, plans, subscription start dates, temporary pauses, and monthly billing from a dashboard without requiring third-party hosted infrastructure.

## Initial constraints

- No external database hosting should be required.
- The app needs to run locally in a development container and on a standard machine.
- Billing must reflect actual weekdays and should account for mid-month starts and pause periods.
- The system should be secure enough for an admin-only workflow using JWT-backed authentication.
- The code should remain simple, maintainable, and easy to validate with repeated tests around the billing logic.

## Key technical decisions

### 1) SQLite instead of MongoDB

The project originally leaned toward a MongoDB-style architecture, but the environment did not include a managed database service and the goal was to keep setup friction low. SQLite with Sequelize was chosen because it offers a relational model, local persistence, and a very quick start without any external credentials or infrastructure.

### 2) Admin-first workflow

The product was modeled as an owner-operated dashboard rather than a multi-user customer portal. This matches the business requirement that only the owner/admin manages customers, subscriptions, and billing.

### 3) Date handling as plain calendar strings

All important dates are stored and compared in YYYY-MM-DD format. This avoids timezone drift and keeps date checks deterministic when working across local system boundaries.

### 4) Separate pause records

Pauses are stored as distinct rows instead of embedded arrays. This preserves historical pause ranges, makes month-level billing easier to audit, and keeps the data model straightforward for future reporting.

### 5) Reusable billing utility

The billing calculation was separated into a dedicated helper in backend/utils/billing.js to support testing and maintainability. This allows the app to calculate monthly charges consistently wherever the logic is reused.

## Implementation milestones

### Backend foundation

- Set up Express server and environment configuration
- Added auth, customer, plan, subscription, and bill routes
- Implemented validation middleware and error handling
- Wired Sequelize models and SQLite connection

### Subscription and billing model

- Created subscriptions with customer-plan relationships and start dates
- Added pause support with start and end dates
- Built reusable weekday-based billing logic
- Generated invoice snapshots for each billing month

### Frontend dashboard

- Built a React frontend to manage core entities
- Added dashboard pages for customers, billing, and authentication
- Connected frontend to backend endpoints via configured API utilities

## Validation and quality checks

The project’s most important validation focus was the billing utility. The logic was checked against scenarios that represent business realities:

- normal month with no pauses
- mid-month subscription start
- temporary pause in the middle of the billing period
- full-month pause
- weekday-only counting with weekend exclusion

These checks prevent inflated or undercounted bills and keep the rate calculation predictable.

## Current state

The project is now a working local-first tiffin management system with:

- owner authentication
- customer and plan management
- subscription lifecycle tracking
- pause handling
- bill generation and invoice retrieval
- a clean SQLite-backed architecture that runs without external services

## Useful references

- README.md: setup and usage guide
- REASONING.md: design and architectural rationale
- backend/utils/billing.js: the billing calculation engine
- backend/seed.js: database seeding and default admin creation

## Final note

The project balance is strong: simple enough for local deployment, accurate enough for monthly billing, and structured enough to extend with new features like recurring reminders, dashboard analytics, or a customer portal later on.

