'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Users, Phone, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Room } from '@/types/database.types';
import { bookingSchema } from '@/lib/validations/schemas';
import { calculateNights, formatCurrency } from '@/lib/helpers';
import { createBookingAction } from '@/actions/booking';

interface BookingFormProps {
  room: Room;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export default function BookingForm({
  room,
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
}: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set up React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: '',
      guest_phone: '',
      guest_email: '',
      check_in_date: initialCheckIn,
      check_out_date: initialCheckOut,
      number_of_guests: Number(initialGuests),
      special_request: '',
      agree_policy: false,
    },
  });

  // Watch dates to update night/price calculations dynamically
  const checkInVal = watch('check_in_date');
  const checkOutVal = watch('check_out_date');

  // Calculate nights and total price
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (checkInVal && checkOutVal) {
      const computedNights = calculateNights(checkInVal, checkOutVal);
      setNights(computedNights);
      setTotalPrice(computedNights * room.price_per_night);
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [checkInVal, checkOutVal, room.price_per_night]);

  type BookingFormValues = z.infer<typeof bookingSchema>;

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createBookingAction(room.id, data);

      if (response.success && response.data) {
        // Redirect to booking success page with secure URL (only containing the booking ID)
        router.push(`/booking-success?id=${response.data.id}`);
      } else {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum dates for check-in and check-out input constraints
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowString = () => {
    if (!checkInVal) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const checkIn = new Date(checkInVal);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  };

  return (
    <div id="booking-section" className="bg-stone-50 border border-stone-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <h3 className="font-serif text-xl font-medium text-stone-900 mb-6 pb-4 border-b border-stone-200">
        Đặt phòng nghỉ của bạn
      </h3>

      {errorMessage && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Đặt phòng thất bại: </span>
            {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Guest Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Họ và tên *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('guest_name')}
              className={`w-full pl-10 pr-4 py-2.5 rounded border ${
                errors.guest_name ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
              } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.guest_name && (
            <p className="mt-1 text-xs text-red-600">{errors.guest_name.message as string}</p>
          )}
        </div>

        {/* Guest Phone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Số điện thoại *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="tel"
              placeholder="0912345678"
              {...register('guest_phone')}
              className={`w-full pl-10 pr-4 py-2.5 rounded border ${
                errors.guest_phone ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
              } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.guest_phone && (
            <p className="mt-1 text-xs text-red-600">{errors.guest_phone.message as string}</p>
          )}
        </div>

        {/* Guest Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Địa chỉ Email (Không bắt buộc)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="email"
              placeholder="email@example.com"
              {...register('guest_email')}
              className={`w-full pl-10 pr-4 py-2.5 rounded border ${
                errors.guest_email ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
              } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2`}
            />
          </div>
          {errors.guest_email && (
            <p className="mt-1 text-xs text-red-600">{errors.guest_email.message as string}</p>
          )}
        </div>

        {/* Dates Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Nhận phòng *
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="date"
                min={getTodayString()}
                {...register('check_in_date')}
                className={`w-full pl-8 pr-1.5 py-2.5 rounded border ${
                  errors.check_in_date ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
                } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.check_in_date && (
              <p className="mt-1 text-xs text-red-600">{errors.check_in_date.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Trả phòng *
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="date"
                min={getTomorrowString()}
                {...register('check_out_date')}
                className={`w-full pl-8 pr-1.5 py-2.5 rounded border ${
                  errors.check_out_date ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
                } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.check_out_date && (
              <p className="mt-1 text-xs text-red-600">{errors.check_out_date.message as string}</p>
            )}
          </div>
        </div>

        {/* Guest Count */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Số lượng khách *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <select
              {...register('number_of_guests', { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-2.5 rounded border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 appearance-none"
            >
              {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} khách
                </option>
              ))}
            </select>
          </div>
          {errors.number_of_guests && (
            <p className="mt-1 text-xs text-red-600">{errors.number_of_guests.message as string}</p>
          )}
        </div>

        {/* Special Request */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Yêu cầu đặc biệt (Không bắt buộc)
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: phòng không hút thuốc, giường phụ, nhận phòng muộn..."
            {...register('special_request')}
            className={`w-full px-4 py-2.5 rounded border ${
              errors.special_request ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:ring-stone-200'
            } bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 resize-none`}
          />
          {errors.special_request && (
            <p className="mt-1 text-xs text-red-600">{errors.special_request.message as string}</p>
          )}
        </div>

        {/* Policy Agreement Checkbox */}
        <div className="flex items-start gap-2.5 py-2">
          <input
            type="checkbox"
            id="agree_policy"
            {...register('agree_policy')}
            className="mt-1 rounded border-stone-300 text-[#c5a880] focus:ring-[#c5a880] h-4 w-4"
          />
          <label htmlFor="agree_policy" className="text-xs text-stone-600 font-light leading-normal select-none">
            Tôi đồng ý với <span className="underline hover:text-[#c5a880] cursor-pointer">chính sách đặt phòng</span>, quy định chung và điều khoản hủy phòng của Lumière Hotel. *
          </label>
        </div>
        {errors.agree_policy && (
          <p className="text-xs text-red-600 mt-0.5">{errors.agree_policy.message as string}</p>
        )}

        {/* Price Breakdown & Summary */}
        {nights > 0 && (
          <div className="rounded-lg bg-stone-100 p-4 border border-stone-200 space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block border-b border-stone-200 pb-2 mb-2">
              Tóm tắt chi phí
            </span>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Đơn giá mỗi đêm</span>
              <span className="font-medium">{formatCurrency(room.price_per_night)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Số đêm nghỉ</span>
              <span className="font-medium">{nights} đêm</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
              <span>Tổng số tiền</span>
              <span className="text-[#c5a880]">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#c5a880] hover:bg-[#b0936d] disabled:bg-stone-300 text-stone-950 disabled:text-stone-500 py-3 rounded font-serif font-semibold uppercase tracking-widest text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý đặt phòng...
            </>
          ) : (
            'Xác nhận đặt phòng'
          )}
        </button>
      </form>
    </div>
  );
}
