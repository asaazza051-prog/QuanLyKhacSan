import { differenceInDays, format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Format currency in VND
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date to DD/MM/YYYY
export const formatDateString = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format date to a nice readable Vietnamese string (e.g. Thứ Hai, 19 Th07 2026)
export const formatNiceDate = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    return format(date, 'EEEE, dd MMMM yyyy', { locale: vi });
  } catch (error) {
    console.error('Error formatting nice date:', error);
    return '';
  }
};

// Normalize Vietnamese phone numbers: Remove spaces, dashes, parentheses and replace +84 with 0
export const normalizePhoneNumber = (phone: string): string => {
  let clean = phone.replace(/[\s\-.()]/g, '');
  if (clean.startsWith('+84')) {
    clean = '0' + clean.slice(3);
  }
  return clean;
};

// Calculate number of nights between check-in and check-out
export const calculateNights = (checkIn: string, checkOut: string): number => {
  try {
    const inDate = parseISO(checkIn);
    const outDate = parseISO(checkOut);
    const nights = differenceInDays(outDate, inDate);
    return nights > 0 ? nights : 0;
  } catch (error) {
    console.error('Error calculating nights:', error);
    return 0;
  }
};

// Generate booking code matching HTL-YYYYMMDD-XXXX (for testing / reference)
export const generateBookingCode = (checkInDate: string): string => {
  try {
    const date = parseISO(checkInDate);
    const yyyy = format(date, 'yyyy');
    const mm = format(date, 'MM');
    const dd = format(date, 'dd');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, 'X');
    return `HTL-${yyyy}${mm}${dd}-${randomChars}`;
  } catch {
    const fallbackDate = new Date();
    const yyyymmdd = fallbackDate.toISOString().slice(0, 10).replace(/-/g, '');
    return `HTL-${yyyymmdd}-XXXX`;
  }
};

// Helper to mask sensitive information
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `*@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const clean = normalizePhoneNumber(phone);
  if (clean.length < 6) return '****';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
};
