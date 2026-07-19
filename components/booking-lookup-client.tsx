'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { lookupBookingAction } from '@/actions/booking';
import { formatDateString, formatCurrency } from '@/lib/helpers';

interface BookingLookupClientProps {
  initialCode?: string;
}

export default function BookingLookupClient({ initialCode = '' }: BookingLookupClientProps) {
  const [bookingCode, setBookingCode] = useState(initialCode);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  interface BookingLookupData {
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
  }

  const [result, setResult] = useState<BookingLookupData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim() || !phone.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ mã đặt phòng và số điện thoại.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await lookupBookingAction(bookingCode, phone);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối khi tra cứu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
      {/* Search Input Box */}
      <div className="md:col-span-2 bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3 mb-5">
          Nhập thông tin tra cứu
        </h2>

        {errorMessage && (
          <div className="mb-5 rounded bg-red-50 p-3 border border-red-200 text-red-800 text-xs flex gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Mã đặt phòng *
            </label>
            <input
              type="text"
              placeholder="HTL-YYYYMMDD-XXXX"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white placeholder-stone-400 font-mono tracking-wider"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Số điện thoại đặt phòng *
            </label>
            <input
              type="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white placeholder-stone-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 disabled:bg-stone-200 text-white disabled:text-stone-400 font-serif font-semibold uppercase tracking-widest text-xs py-3 rounded transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Đang tìm kiếm...
              </>
            ) : (
              <>
                <Search className="h-4.5 w-4.5" />
                Tra cứu booking
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display Box */}
      <div className="md:col-span-3">
        {result ? (
          <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <span className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#c5a880]" />
                Chi tiết đơn đặt phòng
              </span>
              <span
                className={`inline-block border text-xs px-2.5 py-0.5 rounded font-semibold ${getStatusBadgeClass(
                  result.status
                )}`}
              >
                {getStatusText(result.status)}
              </span>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-stone-700">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Mã đặt phòng</span>
                <span className="font-mono font-semibold tracking-wider text-stone-800 select-all">{result.booking_code}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Phòng đã đặt</span>
                <span className="font-medium text-stone-800">{result.room_name} ({result.room_type})</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Họ và tên khách</span>
                <span className="font-medium text-stone-800">{result.guest_name}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Thời gian lưu trú</span>
                <span className="font-medium text-stone-800">
                  {formatDateString(result.check_in_date)} — {formatDateString(result.check_out_date)} ({result.number_of_nights} đêm)
                </span>
              </div>

              {/* Masked Sensitive Fields */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Số điện thoại liên hệ</span>
                <span className="font-medium text-stone-800 tracking-wide">{result.guest_phone}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Email liên hệ</span>
                <span className="font-medium text-stone-800">{result.guest_email || '—'}</span>
              </div>
            </div>

            {/* Total Price Section */}
            <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span className="text-xs text-stone-500 font-light">Mã hóa bảo mật thông tin cá nhân.</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Tổng chi phí</span>
                <span className="font-serif text-xl font-bold text-[#c5a880]">{formatCurrency(result.total_price)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-stone-200 rounded-lg p-12 text-center text-stone-400 font-light flex flex-col items-center justify-center space-y-3 min-h-[300px]">
            <Search className="h-10 w-10 text-stone-300" />
            <p className="text-stone-500 font-medium">Chưa có thông tin tra cứu.</p>
            <p className="text-stone-400 text-xs max-w-xs leading-normal">
              Vui lòng nhập Mã đặt phòng (được cấp sau khi booking thành công) và Số điện thoại để xem chi tiết.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
