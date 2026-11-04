const TIME_ZONE = "Asia/Dhaka";

export const FREE_DELIVERY_FROM = 5000;
export const DELIVERY_FEE = 80;

export function deliveryFeeFor(subtotal: number) {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

// Bangladesh groups digits in lakhs, for example ৳1,25,000
export function money(value: number) {
  return `৳${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// A fixed time zone keeps server and browser text identical
export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TIME_ZONE });
}

export function formatDay(day: string) {
  return new Date(`${day}T12:00:00+06:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
}

// yyyy-mm-dd in Bangladesh, as date inputs expect
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

export function daysAgoKey(days: number) {
  return dayKey(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

export function initials(name?: string | null) {
  return (name ?? "?").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}
