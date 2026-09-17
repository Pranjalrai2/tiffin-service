export const formatDateOnly = (date) => {
  const value = date instanceof Date ? date : new Date(`${date}T00:00:00`);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

export const addDays = (dateString, count) => {
  const baseDate = parseDate(dateString);
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + count);
  return formatDateOnly(nextDate);
};

export const isWeekday = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return false;
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

export const isWithinRange = (dateString, startDate, endDate) => {
  if (!dateString || !startDate || !endDate) return false;
  return dateString >= startDate && dateString <= endDate;
};

export const countDaysInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

export const getMonthRange = (year, monthIndex) => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  return {
    monthStart: formatDateOnly(monthStart),
    monthEnd: formatDateOnly(monthEnd),
  };
};

export const getWeekdaysInDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const value = formatDateOnly(cursor);
    if (isWeekday(value)) {
      dates.push(value);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export const getSubscriptionStatus = (subscription, pauses = [], referenceDate = new Date()) => {
  const today = formatDateOnly(referenceDate);
  const isPaused = pauses.some((pause) => {
    const start = pause.startDate || pause.start_date;
    const end = pause.endDate || pause.end_date || today;
    return isWithinRange(today, start, end);
  });

  return isPaused ? 'Paused' : 'Active';
};

export const calculateMonthlyBill = ({
  planPrice,
  subscriptionStartDate,
  monthYear,
  pauses = [],
  includeStartDate = true,
}) => {
  const [year, month] = monthYear.split('-').map(Number);
  const monthRange = getMonthRange(year, month - 1);
  const monthStart = monthRange.monthStart;
  const monthEnd = monthRange.monthEnd;
  const effectiveStart = subscriptionStartDate && subscriptionStartDate > monthStart ? subscriptionStartDate : monthStart;
  const monthWeekdays = getWeekdaysInDateRange(monthStart, monthEnd);
  const billableWeekdays = [];

  monthWeekdays.forEach((day) => {
    if (day < effectiveStart || day > monthEnd) return;
    const isPaused = pauses.some((pause) => {
      const start = pause.startDate || pause.start_date;
      const end = pause.endDate || pause.end_date || day;
      return isWithinRange(day, start, end);
    });

    if (!isPaused) {
      billableWeekdays.push(day);
    }
  });

  const totalWeekdays = monthWeekdays.filter((day) => day >= effectiveStart && day <= monthEnd).length;
  const pausedDays = totalWeekdays - billableWeekdays.length;
  const ratePerDay = totalWeekdays > 0 ? Number((planPrice / totalWeekdays).toFixed(4)) : 0;
  const finalAmount = Number((ratePerDay * billableWeekdays.length).toFixed(2));

  return {
    month: month,
    year,
    totalWeekdays,
    pausedDays,
    billableDays: billableWeekdays.length,
    ratePerDay,
    finalAmount,
    planPrice,
    effectiveStart,
  };
};
