# TiffinTrack reasoning and implementation notes

## 1. Why SQLite replaced MongoDB

This project was originally designed around MongoDB/Mongoose, but there is no free Atlas or hosted MongoDB instance available in this environment, and the app also benefits from a zero-setup local database. We switched to SQLite with Sequelize so the project can run offline with no external database service or credentials while preserving the same data model and behaviors.

The migration keeps the same domain design but changes the persistence layer from document collections to relational tables with foreign keys. The billing math remains unchanged; only the database access pattern changed.

## 2. Schema design decisions

I used a simple owner-first design because the brief explicitly states that only the owner/admin logs in. Customers are stored as records and linked to one subscription at a time, while the owner can manage many customers from the dashboard.

The key tables are:

- User: stores the owner/admin credentials and JWT-authenticated identity.
- Plan: stores the monthly plan name and price.
- Customer: stores identity and contact details, including phone search indexing.
- Subscription: stores the customer-plan relationship and start date.
- Pause: stores a historical date-range row so the full pause history is available for each subscription.
- Bill: stores a generated monthly invoice snapshot for auditability.

Pauses remain a separate table, not embedded arrays, because the requirement explicitly calls for historical ranges and live status derivation from current date.

## 3. Pro-ration logic choices

The core logic is isolated in `backend/utils/billing.js` to make it testable outside the API. The logic still does the following:

1. Determine all weekdays in the target month.
2. Restrict the count to dates on or after the subscription start date.
3. Remove all weekdays that fall inside a pause range.
4. Compute:
   - totalWeekdays
   - pausedDays
   - billableDays
   - ratePerDay = planPrice / totalWeekdays
   - finalAmount = ratePerDay * billableDays

This matches the requirement and handles mid-month starts and full-month pauses cleanly.

## 4. Date handling decisions

To avoid timezone drift, all dates are treated as calendar dates in YYYY-MM-DD format. The app parses dates with local constructors and compares strings, avoiding hidden UTC conversion bugs during month checks.

## 5. Edge cases tested

The billing utility was tested directly with these scenarios:

- zero paused days -> full price returned
- pause in the middle of a month -> only paused weekdays removed
- pause spanning the whole month -> zero bill
- subscription beginning mid-month -> totalWeekdays reduced by the days before start

The pricing utility returned the expected values for each scenario before finalizing the migration.

## 6. Known assumptions and next extensions

- This implementation is owner/admin-first for the dashboard workflow.
- A customer is not given a separate login; if a customer portal is added later, a new auth model and customer-specific session flow would be needed.
- The app stores pause history as discrete rows, which is the simplest way to support complete history and month-end calculations without data loss.
