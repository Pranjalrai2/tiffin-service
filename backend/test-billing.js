import assert from 'node:assert/strict';
import { calculateMonthlyBill } from './utils/billing.js';

const cases = [
  {
    name: 'Full price — no pause, full month',
    input: {
      planPrice: 4800,
      subscriptionStartDate: '2026-09-01',
      monthYear: '2026-09',
      pauses: [],
    },
    expected: {
      totalWeekdaysInMonth: 22,
      weekdaysBeforeStartDate: 0,
      pausedWeekdaysInRange: 0,
      billableDays: 22,
      finalAmount: 4800,
    },
  },
  {
    name: 'Mid-month pause only — subscription started before the month, pause falls within the month',
    input: {
      planPrice: 4800,
      subscriptionStartDate: '2026-09-01',
      monthYear: '2026-09',
      pauses: [{ startDate: '2026-09-12', endDate: '2026-09-15' }],
    },
    expected: {
      totalWeekdaysInMonth: 22,
      weekdaysBeforeStartDate: 0,
      pausedWeekdaysInRange: 2,
      billableDays: 20,
      finalAmount: 4363.64,
    },
  },
  {
    name: 'Mid-month start only — subscription starts partway through the month, no pause',
    input: {
      planPrice: 4800,
      subscriptionStartDate: '2026-09-15',
      monthYear: '2026-09',
      pauses: [],
    },
    expected: {
      totalWeekdaysInMonth: 22,
      weekdaysBeforeStartDate: 10,
      pausedWeekdaysInRange: 0,
      billableDays: 12,
      finalAmount: 2618.18,
    },
  },
  {
    name: 'Mid-month start + pause combined — subscription starts partway through the month AND has a pause within the same month',
    input: {
      planPrice: 4800,
      subscriptionStartDate: '2026-09-15',
      monthYear: '2026-09',
      pauses: [{ startDate: '2026-09-21', endDate: '2026-09-23' }],
    },
    expected: {
      totalWeekdaysInMonth: 22,
      weekdaysBeforeStartDate: 10,
      pausedWeekdaysInRange: 3,
      billableDays: 9,
      finalAmount: 1963.64,
    },
  },
  {
    name: 'Full-month pause — customer paused for the entire month',
    input: {
      planPrice: 4800,
      subscriptionStartDate: '2026-09-01',
      monthYear: '2026-09',
      pauses: [{ startDate: '2026-09-01', endDate: '2026-09-30' }],
    },
    expected: {
      totalWeekdaysInMonth: 22,
      weekdaysBeforeStartDate: 0,
      pausedWeekdaysInRange: 22,
      billableDays: 0,
      finalAmount: 0,
    },
  },
];

for (const testCase of cases) {
  const actual = calculateMonthlyBill(testCase.input);

  console.log(`CASE: ${testCase.name}`);
  console.log(JSON.stringify({
    input: testCase.input,
    actual: {
      totalWeekdaysInMonth: actual.totalWeekdaysInMonth,
      weekdaysBeforeStartDate: actual.weekdaysBeforeStartDate,
      pausedWeekdaysInRange: actual.pausedWeekdaysInRange,
      billableDays: actual.billableDays,
      finalAmount: actual.finalAmount,
    },
    expected: testCase.expected,
  }, null, 2));

  assert.equal(actual.totalWeekdaysInMonth, testCase.expected.totalWeekdaysInMonth, 'totalWeekdaysInMonth mismatch');
  assert.equal(actual.weekdaysBeforeStartDate, testCase.expected.weekdaysBeforeStartDate, 'weekdaysBeforeStartDate mismatch');
  assert.equal(actual.pausedWeekdaysInRange, testCase.expected.pausedWeekdaysInRange, 'pausedWeekdaysInRange mismatch');
  assert.equal(actual.billableDays, testCase.expected.billableDays, 'billableDays mismatch');
  assert.equal(Number(actual.finalAmount.toFixed(2)), Number(testCase.expected.finalAmount.toFixed(2)), 'finalAmount mismatch');

  console.log('RESULT: PASS\n');
}

console.log('ALL BILLING CASES PASSED');
