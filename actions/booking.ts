'use server';

import { headers } from 'next/headers';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { bookingSchema } from '@/lib/validations/schemas';
import { normalizePhoneNumber, maskEmail, maskPhone } from '@/lib/helpers';

export interface BookingResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    booking_code: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string | null;
    check_in_date: string;
    check_out_date: string;
    number_of_guests: number;
    number_of_nights: number;
    price_per_night: number;
    total_price: number;
    special_request: string | null;
    status: string;
  };
}

// Rate limit stores
interface RateLimitData {
  count: number;
  resetTime: number;
}

const createBookingRateLimits = new Map<string, RateLimitData>();
const lookupBookingRateLimits = new Map<string, RateLimitData>();

const CREATE_LIMIT_MS = 60 * 1000; // 1 minute
const CREATE_MAX_REQUESTS = 5;

const LOOKUP_LIMIT_MS = 60 * 1000; // 1 minute
const LOOKUP_MAX_REQUESTS = 10;

async function checkRateLimit(
  map: Map<string, RateLimitData>,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const now = Date.now();
    const clientData = map.get(ip);

    if (!clientData) {
      map.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }

    if (now > clientData.resetTime) {
      map.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }

    if (clientData.count >= maxRequests) {
      const remainingSeconds = Math.ceil((clientData.resetTime - now) / 1000);
      return {
        allowed: false,
        message: `Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau ${remainingSeconds} giây.`,
      };
    }

    clientData.count += 1;
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit helper error:', error);
    return { allowed: true };
  }
}

// Server action to create a booking using secure Postgres function
export async function createBookingAction(roomId: string, formData: unknown): Promise<BookingResponse> {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(createBookingRateLimits, CREATE_MAX_REQUESTS, CREATE_LIMIT_MS);
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: rateLimit.message || 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau.',
      };
    }

    // 1. Validate inputs using Zod
    const validated = bookingSchema.parse(formData);

    // 2. Initialize regular client (the RPC handles security via SECURITY DEFINER)
    const supabase = await createClient();

    // 3. Call the secure RPC function
    const { data, error } = await supabase.rpc('create_booking_secure', {
      p_room_id: roomId,
      p_guest_name: validated.guest_name,
      p_guest_phone: validated.guest_phone,
      p_guest_email: validated.guest_email,
      p_check_in_date: validated.check_in_date,
      p_check_out_date: validated.check_out_date,
      p_number_of_guests: validated.number_of_guests,
      p_special_request: validated.special_request,
    });

    if (error) {
      console.error('Database error in create_booking_secure:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi xử lý đặt phòng trên hệ thống.',
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Không thể tạo đơn đặt phòng. Vui lòng thử lại.',
      };
    }

    return {
      success: true,
      message: 'Đặt phòng thành công!',
      data: data[0],
    };
  } catch (error) {
    console.error('Server action error:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const issues = err.issues || err.errors || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = issues.map((e: any) => e.message).join(', ');
      return {
        success: false,
        message: `Dữ liệu không hợp lệ: ${messages}`,
      };
    }
    const err = error as unknown as Error;
    return {
      success: false,
      message: err?.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    };
  }
}

export interface BookingLookupResult {
  success: boolean;
  message: string;
  data?: {
    booking_code: string;
    room_name: string;
    room_type: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string | null;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
    total_price: number;
    status: string;
  };
}

// Server action to query booking securely by booking_code and phone number
export async function lookupBookingAction(bookingCode: string, phone: string): Promise<BookingLookupResult> {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(lookupBookingRateLimits, LOOKUP_MAX_REQUESTS, LOOKUP_LIMIT_MS);
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: rateLimit.message || 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau.',
      };
    }

    if (!bookingCode || !phone) {
      return {
        success: false,
        message: 'Vui lòng cung cấp đầy đủ mã đặt phòng và số điện thoại.',
      };
    }

    // Clean phone number
    const cleanPhone = normalizePhoneNumber(phone);

    // Read booking using admin client because standard client cannot select bookings table directly
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        booking_code,
        guest_name,
        guest_phone,
        guest_email,
        check_in_date,
        check_out_date,
        number_of_nights,
        total_price,
        status,
        rooms (
          name,
          room_type
        )
      `)
      .eq('booking_code', bookingCode.trim().toUpperCase())
      .eq('guest_phone', cleanPhone)
      .maybeSingle();

    if (error) {
      console.error('Database query error in lookupBookingAction:', error);
      return {
        success: false,
        message: 'Không tìm thấy thông tin đặt phòng.',
      };
    }

    if (!booking) {
      return {
        success: false,
        message: 'Thông tin tra cứu không chính xác. Vui lòng kiểm tra lại mã đặt phòng và số điện thoại.',
      };
    }

    const roomInfo = booking.rooms as unknown as { name: string; room_type: string } | null;

    return {
      success: true,
      message: 'Tìm thấy thông tin đặt phòng.',
      data: {
        booking_code: booking.booking_code,
        room_name: roomInfo?.name || 'Phòng nghỉ',
        room_type: roomInfo?.room_type || '',
        guest_name: booking.guest_name,
        guest_phone: maskPhone(booking.guest_phone),
        guest_email: booking.guest_email ? maskEmail(booking.guest_email) : null,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        number_of_nights: booking.number_of_nights,
        total_price: booking.total_price,
        status: booking.status,
      },
    };
  } catch {
    console.error('Booking lookup error');
    return {
      success: false,
      message: 'Có lỗi xảy ra trong quá trình tra cứu.',
    };
  }
}

