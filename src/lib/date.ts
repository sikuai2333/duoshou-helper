import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDaysInMonth,
  parse,
  subMonths,
} from "date-fns";

export function getMonthKey(date = new Date()) {
  return format(date, "yyyy-MM");
}

export function getCurrentMonthKey() {
  return getMonthKey(new Date());
}

export function getMonthDate(monthKey: string) {
  return parse(`${monthKey}-01`, "yyyy-MM-dd", new Date());
}

export function getMonthLabel(date = new Date()) {
  return format(date, "yyyy年M月");
}

export function getFriendlyDate(dateString: string) {
  return format(new Date(dateString), "M月d日");
}

export function shiftMonthKey(monthKey: string, delta: number) {
  const baseDate = getMonthDate(monthKey);
  const nextDate = delta >= 0 ? addMonths(baseDate, delta) : subMonths(baseDate, Math.abs(delta));
  return getMonthKey(nextDate);
}

export function listRecentMonthKeys(
  baseMonthKey = getCurrentMonthKey(),
  count = 6,
) {
  return Array.from({ length: count }, (_, index) =>
    shiftMonthKey(baseMonthKey, -index),
  );
}

export function getDaysLeftInMonth(date = new Date()) {
  return Math.max(differenceInCalendarDays(endOfMonth(date), date), 0);
}

export function getTotalDaysInMonth(date = new Date()) {
  return getDaysInMonth(date);
}

export function getMonthProgressPercent(date = new Date()) {
  const totalDays = getTotalDaysInMonth(date);
  return Math.round((date.getDate() / totalDays) * 100);
}
