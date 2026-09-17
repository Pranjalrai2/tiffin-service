# TiffinTrack reasoning and architecture notes

## Why this project exists

The goal was to build a practical local-first tool for a tiffin business owner to manage recurring meal subscriptions with a fair and transparent billing model. The app is intentionally narrow in scope: customer records, recurring plans, subscription dates, temporary pauses, and monthly bills.

This keeps the business flow clear while avoiding broad features that would not directly help the owner manage the service.

## Architectural decisions

### 1) Owner-centric workflow

The product is designed for one administrator: the owner. The dashboard is not built around separate customer accounts or multi-role access. This is the simplest model for the business goal and reduces operational complexity around authorization and user management.

### 2) Relational data model with SQLite

A relational model fits the app naturally because the business domain is built around strongly connected records:

- a customer has one active subscription
- a subscription belongs to a plan
- a pause belongs to a subscription
- a bill references a customer and a subscription

SQLite is enough for this workload because it stores everything locally, requires no external setup, and is easy to back up or move. Using Sequelize keeps the code organized and lets the project stay consistent without introducing a heavier database service.

### 3) Separate pause history instead of a single status flag

Pauses are stored as date-range entries rather than a boolean state. This matters because a subscription can be paused at different times throughout the year, and the business needs an auditable record of each pause.

By storing historical pause rows, we can:

- calculate the current status dynamically
- identify all paused days in a specific month
- preserve a full timeline of service interruptions
- support future reporting or analytics

### 4) Date safety and timezone control

The application normalizes dates as plain YYYY-MM-DD strings and uses local date parsing in the billing logic. That avoids hidden timezone conversions, which is crucial when users are working with calendar dates rather than precise timestamps.

This choice is especially important in billing because the business logic depends on exact date membership and month boundaries.

## Billing logic rationale

The most important part of the app is the monthly invoice calculation. It is designed to mirror real business behavior.

### Business rule

The bill should reflect:

- the total number of weekdays in the billing month
- the portion of the month after the subscription started
- the weekdays excluded by pause records
- the actual monthly plan rate, prorated by working days

### Implementation approach

The logic is centralized in backend/utils/billing.js so the same formula can be reused in the controller and validated independently.

The step-by-step calculation is:

1. Determine all weekdays in the month.
2. Restrict the range to dates after the subscription start date.
3. Remove any weekdays that fall in a pause range.
4. Divide the plan price by the month’s weekday total to compute the daily rate.
5. Multiply the daily rate by the number of billable weekdays.

This creates a consistent and predictable result while keeping the logic easy to reason about and test.

## Why the utility is isolated

The billing function is intentionally separated from the route layer. That has several benefits:

- The logic can be tested without an HTTP request.
- Bug fixes remain isolated to the calculation layer.
- Updates to monthly policy remain easy to maintain.
- The controller remains focused on orchestration rather than business math.

## Security and data handling

The app uses JWT-based authentication for admin access and bcrypt hashing for password protection. Since the product is owner-only, it does not need a broader user access model.

The database is local, and configuration is environment-based. This keeps the app portable while still allowing the owner to keep credentials and settings private.

## Known assumptions and future extensions

The current design assumes:

- only one admin logs in to the dashboard
- customers do not manage their own accounts
- billing is based on weekdays and service pauses
- the app is intended for a local installation rather than multi-tenant cloud hosting

Possible future improvements could include:

- customer portal access
- automated reminders and notifications
- exportable invoice PDFs
- analytics dashboards for Monthly Recurring Revenue and customer retention
- recurring billing automation

## Final interpretation

The project is intentionally simple, robust, and deterministic. It avoids overengineering while still solving the real operational problem: calculating fair monthly bills for a tiffin service in the presence of pause periods and mid-month subscription starts. That is why the structure remains lightweight, the data model stays clear, and the billing logic is isolated and testable.

