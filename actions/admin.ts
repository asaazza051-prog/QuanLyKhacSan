'use server';

import { cookies, headers } from 'next/headers';
import * as jose from 'jose';
import { createAdminClient } from '@/lib/supabase/server';
import { adminLoginSchema } from '@/lib/validations/schemas';
import { BookingStatus } from '@/types/database.types';

const SESSION_COOKIE_NAME = 'admin_session';

// In-memory rate limiter for admin login (brute-force protection)
// NOTE: In-memory only — will reset on serverless cold starts. Use Redis for production.
interface LoginAttemptData {
  count: number;
  resetTime: number;
  lockedUntil?: number;
}
const loginAttempts = new Map<string, LoginAttemptData>();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // Lockout for 15 minutes after max attempts

async function checkLoginRateLimit(): Promise<{ allowed: boolean; message?: string }> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const now = Date.now();
    const data = loginAttempts.get(ip);

    if (!data) {
      loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW_MS });
      return { allowed: true };
    }

    // Check if currently locked out
    if (data.lockedUntil && now < data.lockedUntil) {
      const remainingMinutes = Math.ceil((data.lockedUntil - now) / 60000);
      return {
        allowed: false,
        message: `Quá nhiều lần thử sai. Tài khoản bị khóa trong ${remainingMinutes} phút.`,
      };
    }

    // Reset window if expired
    if (now > data.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW_MS });
      return { allowed: true };
    }

    if (data.count >= LOGIN_MAX_ATTEMPTS) {
      data.lockedUntil = now + LOGIN_LOCKOUT_MS;
      const remainingMinutes = Math.ceil(LOGIN_LOCKOUT_MS / 60000);
      return {
        allowed: false,
        message: `Quá nhiều lần thử sai. Tài khoản bị khóa trong ${remainingMinutes} phút.`,
      };
    }

    data.count += 1;
    return { allowed: true };
  } catch (err) {
    console.error('Admin rate limit error:', err);
    return { allowed: true }; // Fail open — do not block if rate limiter errors
  }
}

function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// Helper to get secret key for jwt
function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    console.warn('ADMIN_SESSION_SECRET is missing or too short. Using a fallback for development only.');
    return new TextEncoder().encode('fallback_secret_must_be_at_least_32_characters_long');
  }
  return new TextEncoder().encode(secret);
}

// Server action for admin login
export async function loginAdminAction(formData: unknown) {
  try {
    // Rate limit check (brute-force protection)
    const rateLimit = await checkLoginRateLimit();
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: rateLimit.message || 'Tài khoản tạm thời bị khóa do quá nhiều lần thử.',
      };
    }

    const validated = adminLoginSchema.parse(formData);
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return {
        success: false,
        message: 'Mật khẩu quản trị viên chưa được cấu hình trên máy chủ.',
      };
    }

    if (validated.password !== adminPassword) {
      return {
        success: false,
        message: 'Mật khẩu không chính xác.',
      };
    }

    // Reset rate limit on successful login
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    resetLoginAttempts(ip);

    // Generate JWT token using jose
    const secretKey = getSecretKey();
    const token = await new jose.SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secretKey);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return {
      success: true,
      message: 'Đăng nhập thành công!',
    };
  } catch (error) {
    console.error('Admin login error:', error);
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const issues = err.issues || err.errors || [];
      return {
        success: false,
        message: issues[0]?.message || 'Dữ liệu không hợp lệ.',
      };
    }
    return {
      success: false,
      message: 'Đã xảy ra lỗi trong quá trình đăng nhập.',
    };
  }
}

// Server action for admin logout
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

// Helper to verify admin session from cookies
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return false;

    const secretKey = getSecretKey();
    const { payload } = await jose.jwtVerify(token, secretKey);

    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// Server action to update booking status with validation of state transitions
export async function updateBookingStatusAction(bookingId: string, newStatus: BookingStatus) {
  try {
    // 1. Verify session
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return {
        success: false,
        message: 'Yêu cầu quyền quản trị viên.',
      };
    }

    const supabase = createAdminClient();

    // 2. Fetch current booking status
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('status, id, booking_code')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError || !booking) {
      return {
        success: false,
        message: 'Không tìm thấy đơn đặt phòng.',
      };
    }

    const currentStatus = booking.status as BookingStatus;

    // 3. Validate state transitions:
    // pending -> confirmed
    // pending -> cancelled
    // confirmed -> completed
    // confirmed -> cancelled
    let isValidTransition = false;
    if (currentStatus === 'pending') {
      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        isValidTransition = true;
      }
    } else if (currentStatus === 'confirmed') {
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        isValidTransition = true;
      }
    }

    if (!isValidTransition) {
      return {
        success: false,
        message: `Không thể chuyển đổi trạng thái từ "${currentStatus}" sang "${newStatus}".`,
      };
    }

    // 4. Perform update
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Update booking status error:', updateError);
      return {
        success: false,
        message: 'Lỗi cập nhật trạng thái đơn đặt phòng trên database.',
      };
    }

    return {
      success: true,
      message: `Cập nhật trạng thái booking ${booking.booking_code} thành công!`,
    };
  } catch (error) {
    console.error('Update status error:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật trạng thái.',
    };
  }
}
