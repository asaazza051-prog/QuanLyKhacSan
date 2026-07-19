import Link from 'next/link';
import { CheckCircle2, Calendar, User, Hotel, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { createAdminClient } from '@/lib/supabase/server';
import { formatDateString, formatCurrency } from '@/lib/helpers';

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export const metadata = {
  title: 'Đặt Phòng Thành Công — Lumière Hotel',
  description: 'Chúc mừng quý khách đã đặt phòng thành công tại Lumière Hotel.',
};

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;

  interface BookingSuccessInfo {
    booking_code: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
    total_price: number;
    status: string;
    rooms: {
      name: string;
      room_type: string;
    } | null;
  }

  let booking: BookingSuccessInfo | null = null;
  let errorMsg = '';

  if (id) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          booking_code,
          guest_name,
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
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching success booking:', error);
        errorMsg = 'Có lỗi xảy ra khi truy vấn thông tin đặt phòng.';
      } else if (!data) {
        errorMsg = 'Không tìm thấy thông tin mã đặt phòng hợp lệ.';
      } else {
        booking = data as unknown as BookingSuccessInfo;
      }
    } catch (err) {
      console.error('Error connecting to database:', err);
      errorMsg = 'Không thể kết nối đến cơ sở dữ liệu.';
    }
  } else {
    errorMsg = 'Không tìm thấy tham số mã đặt phòng.';
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-xl w-full px-4">
          <div className="bg-white border border-stone-200 shadow-lg rounded-lg p-8 text-center space-y-6">
            {!booking ? (
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <span className="font-bold text-lg">!</span>
                </div>
                <h1 className="font-serif text-2xl font-semibold text-stone-900">Không tìm thấy thông tin</h1>
                <p className="text-stone-500 font-light text-sm">{errorMsg || 'Không tìm thấy thông tin mã đặt phòng hợp lệ.'}</p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="inline-block bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white font-serif font-semibold uppercase tracking-widest text-xs py-3 px-6 rounded transition-colors"
                  >
                    Quay lại trang chủ
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Success Icon */}
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 text-emerald-600 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 block mb-1">
                    Đặt phòng thành công
                  </span>
                  <h1 className="font-serif text-2xl font-semibold text-stone-900">
                    Cảm ơn quý khách, {booking.guest_name}!
                  </h1>
                  <p className="text-xs text-stone-400 font-light max-w-sm mt-2 leading-relaxed">
                    Đơn đặt phòng của quý khách đã được ghi nhận trên hệ thống. Chúng tôi sẽ liên hệ sớm nhất để xác nhận.
                  </p>
                </div>

                {/* Booking Code Showcase */}
                <div className="bg-stone-900 text-[#c5a880] rounded p-4 font-mono select-all">
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold block mb-1">Mã đặt phòng</span>
                  <span className="text-xl font-bold tracking-wider">{booking.booking_code}</span>
                </div>

                {/* Booking Detail Summary */}
                <div className="border-t border-b border-stone-100 py-6 text-left space-y-4 text-sm text-stone-700">
                  <div className="flex items-center gap-3">
                    <Hotel className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Phòng đã đặt</span>
                      <span className="font-semibold text-stone-800">{booking.rooms?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Thời gian lưu trú</span>
                      <span className="font-semibold text-stone-800">
                        {formatDateString(booking.check_in_date)} — {formatDateString(booking.check_out_date)} ({booking.number_of_nights} đêm)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Trạng thái</span>
                      <span className="inline-block bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded font-medium border border-amber-200">
                        {booking.status === 'pending' ? 'Chờ xác nhận' : booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                    <User className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <div className="flex justify-between w-full items-end">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Tổng chi phí</span>
                        <span className="font-serif text-lg font-bold text-[#c5a880]">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-widest py-3 px-6 rounded transition-colors"
                  >
                    Quay về trang chủ
                  </Link>
                  <Link
                    href={`/booking-lookup?code=${booking.booking_code}`}
                    className="bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white text-xs font-semibold uppercase tracking-widest py-3 px-6 rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    Tra cứu đơn đặt phòng <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
