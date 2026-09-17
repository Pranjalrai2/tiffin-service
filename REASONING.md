# TiffinTrack reasoning and implementation notes

## 1. Schema design decisions

I used a simple owner-first design because the brief explicitly states that only the owner/admin logs in. Customers are therefore stored as records and linked to one subscription at a time, while the owner can manage many customers from the dashboard.

The key collections are:

- User: stores the owner/admin credentials and JWT-authenticated identity.
- Plan: stores the monthly plan name and price.
- Customer: stores identity and contact details, including phone search indexing.
- Subscription: stores the customer-plan relationship and subscription start date.
- Pause: stores an embedded historical range pattern as a discrete date-range row, which makes it easy to track full history and compute daily billing exclusions.
- Bill: stores a generated monthly invoice snapshot for auditability.

This keeps the system normalized without overengineering the domain. Pauses are not stored as a single boolean toggle because the requirement specifically calls for historical ranges and live status derivation from current date.

## 2. Pro-ration logic choices

The core logic is isolated in `backend/utils/billing.js` to make it testable outside the API. The logic does the following:

1. Determine all weekdays in the target month.
2. Restrict the count to dates on or after the subscription start date.
3. Remove all weekdays that fall inside a pause range.
4. Compute:
   - totalWeekdays
   - pausedDays
   - billableDays
   - ratePerDay = planPrice / totalWeekdays
   - finalAmount = ratePerDay * billableDays

This matches the core requirement and also handles mid-month starts and full-month pauses cleanly.

## 3. Handling status as a derived value

Status is intentionally not stored in the database as a stale value. The dashboard and detail view compute it live by comparing today’s date against active pause ranges. If today falls inside a pause range, the result is `Paused`; otherwise it is `Active`.

This prevents the classic bug where a user is marked paused forever even after the date has moved past the pause range.

## 4. Date handling decisions

To avoid timezone drift, all dates are treated as calendar dates in YYYY-MM-DD format. In the app, the backend utilities parse dates using local date constructors and compare strings, avoiding hidden UTC conversion issues during month checks.

## 5. Edge cases tested

I tested the utility directly with these scenarios:

- zero paused days -> full price returned
- pause in the middle of a month -> only paused weekdays removed
- pause spanning the whole month -> zero bill
- subscription beginning mid-month -> totalWeekdays reduced by the days before start

The pricing utility returned the expected values for each of those scenarios, and the results were also verified before finalizing the app.

## 6. Known assumptions and next extensions

- This implementation is owner/admin-first for the dashboard workflow.
- A customer is not given a separate login; if a customer portal is added later, a new auth model and customer-specific session flow would be needed.
- The app stores pause history as discrete pause rows, which is the simplest way to support full history and month-end calculations without data loss.
