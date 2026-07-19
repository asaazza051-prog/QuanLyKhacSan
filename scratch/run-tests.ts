import { calculateNights, normalizePhoneNumber, generateBookingCode } from '../lib/helpers';
import { bookingSchema } from '../lib/validations/schemas';

// Simple assert helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- STARTING UNIT TESTS ---');

// 1. Test calculateNights
console.log('\nTesting calculateNights()...');
assert(calculateNights('2026-07-19', '2026-07-20') === 1, '1 night difference');
assert(calculateNights('2026-07-19', '2026-07-26') === 7, '7 nights difference');
assert(calculateNights('2026-07-19', '2026-07-19') === 0, 'Same day is 0 nights');
assert(calculateNights('2026-07-20', '2026-07-19') === 0, 'Past checkout is 0 nights');

// 2. Test normalizePhoneNumber
console.log('\nTesting normalizePhoneNumber()...');
assert(normalizePhoneNumber('0912345678') === '0912345678', 'No changes needed');
assert(normalizePhoneNumber('0912 345 678') === '0912345678', 'Removes spaces');
assert(normalizePhoneNumber('0912-345-678') === '0912345678', 'Removes dashes');
assert(normalizePhoneNumber('+84912345678') === '0912345678', 'Converts +84 to 0');
assert(normalizePhoneNumber('+84 912 (345) 678') === '0912345678', 'Converts complex formatted +84 numbers');

// 3. Test generateBookingCode
console.log('\nTesting generateBookingCode()...');
const code = generateBookingCode('2026-07-19');
assert(code.startsWith('HTL-20260719-'), 'Prefix matches HTL-YYYYMMDD-');
assert(code.length === 17, 'Total length is exactly 17 characters (HTL-YYYYMMDD-XXXX)');

// 4. Test date overlap logic
console.log('\nTesting date overlap logic rules...');
// Overlap formula: check_in_date < target_check_out AND check_out_date > target_check_in
function checkOverlap(existingIn: string, existingOut: string, targetIn: string, targetOut: string): boolean {
  const inA = new Date(existingIn);
  const outA = new Date(existingOut);
  const inB = new Date(targetIn);
  const outB = new Date(targetOut);
  return inA < outB && outA > inB;
}

assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-15', '2026-07-20') === false, 'Adjacent checkin-checkout: no overlap');
assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-05', '2026-07-10') === false, 'Adjacent checkout-checkin: no overlap');
assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-12', '2026-07-14') === true, 'Target completely inside existing: overlap');
assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-08', '2026-07-12') === true, 'Target checkin overlaps: overlap');
assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-14', '2026-07-18') === true, 'Target checkout overlaps: overlap');
assert(checkOverlap('2026-07-10', '2026-07-15', '2026-07-08', '2026-07-18') === true, 'Target wraps existing: overlap');

// 5. Test bookingSchema validation
console.log('\nTesting bookingSchema validation...');

const validPayload = {
  guest_name: 'Nguyễn Văn A',
  guest_phone: '0912345678',
  guest_email: 'test@example.com',
  check_in_date: '2026-07-19',
  check_out_date: '2026-07-20',
  number_of_guests: 2,
  agree_policy: true,
  special_request: 'No request',
};

const resultSuccess = bookingSchema.safeParse(validPayload);
assert(resultSuccess.success === true, 'Valid payload passes Zod schema');

// Invalid name (too short)
const resultBadName = bookingSchema.safeParse({ ...validPayload, guest_name: 'A' });
assert(resultBadName.success === false, 'Fails when guest_name is too short');

// Invalid phone (not Vietnam standard)
const resultBadPhone = bookingSchema.safeParse({ ...validPayload, guest_phone: '123456' });
assert(resultBadPhone.success === false, 'Fails when phone number is invalid');

// Invalid email
const resultBadEmail = bookingSchema.safeParse({ ...validPayload, guest_email: 'not-an-email' });
assert(resultBadEmail.success === false, 'Fails when email format is invalid');

// Checkout before checkin
const resultBadDates = bookingSchema.safeParse({ ...validPayload, check_in_date: '2026-07-20', check_out_date: '2026-07-19' });
assert(resultBadDates.success === false, 'Fails when check_out is before check_in');

// Policy not agreed
const resultBadPolicy = bookingSchema.safeParse({ ...validPayload, agree_policy: false });
assert(resultBadPolicy.success === false, 'Fails when policy agreement check is false');

console.log('\n--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
