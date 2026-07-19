'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Search, Filter, Calendar, TrendingUp, Inbox, CheckCircle, 
  XCircle, FileText, ChevronRight, Phone, Mail, User, Clock, 
  MapPin, DollarSign 
} from 'lucide-react';
import { Booking } from '@/types/database.types';
import { formatCurrency, formatDateString } from '@/lib/helpers';
import { logoutAdminAction, updateBookingStatusAction } from '@/actions/admin';

interface AdminDashboardProps {
  initialBookings: Booking[];
}

export default function AdminDashboard({ initialBookings }: AdminDashboardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Booking for Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Status Change Confirmation Dialog States
  const [confirmingStatus, setConfirmingStatus] = useState<{
    bookingId: string;
    newStatus: 'confirmed' | 'cancelled' | 'completed';
    bookingCode: string;
  } | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  // Logout action
  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
    router.refresh();
  };

  // Perform status updates
  const handleUpdateStatus = async () => {
    if (!confirmingStatus) return;

    setStatusUpdateMessage('Đang cập nhật...');
    const result = await updateBookingStatusAction(confirmingStatus.bookingId, confirmingStatus.newStatus);

    if (result.success) {
      // Update local state instantly for responsiveness
      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirmingStatus.bookingId
            ? { ...b, status: confirmingStatus.newStatus, updated_at: new Date().toISOString() }
            : b
        )
      );

      // If the currently viewed details matches, update it too
      if (selectedBooking && selectedBooking.id === confirmingStatus.bookingId) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, status: confirmingStatus.newStatus } : null
        );
      }

      setConfirmingStatus(null);
      setStatusUpdateMessage(null);
      // Trigger Next.js server-side cache refresh
      startTransition(() => {
        router.refresh();
      });
    } else {
      setStatusUpdateMessage(result.message);
    }
  };

  // Calculate stats based on local state list
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  // Expected revenue from confirmed and completed bookings
  const expectedRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  // Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    // 1. Search Query (code, name, phone)
    const matchesSearch =
      b.booking_code.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone.includes(search);

    // 2. Status Filter
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    // 3. Date range filters (by check_in_date)
    let matchesDates = true;
    if (startDate) {
      matchesDates = matchesDates && new Date(b.check_in_date) >= new Date(startDate);
    }
    if (endDate) {
      matchesDates = matchesDates && new Date(b.check_in_date) <= new Date(endDate);
    }

    return matchesSearch && matchesStatus && matchesDates;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'confirmed':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/50';
      case 'completed':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
      case 'cancelled':
        return 'bg-red-950/40 text-red-400 border-red-900/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header Admin */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold tracking-[0.2em] text-[#c5a880] uppercase">
            Lumière Admin
          </span>
          <span className="bg-slate-850 border border-slate-800 text-slate-400 px-2 py-0.5 text-[10px] uppercase font-semibold rounded tracking-wider">
            Dashboard
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          Đăng xuất
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Item: Total */}
          <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Tổng số đặt phòng</span>
              <span className="text-3xl font-bold font-serif">{totalBookingsCount}</span>
            </div>
            <div className="h-10 w-10 rounded bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-300">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Stat Item: Pending */}
          <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Đang chờ duyệt</span>
              <span className="text-3xl font-bold font-serif text-amber-400">{pendingCount}</span>
            </div>
            <div className="h-10 w-10 rounded bg-amber-950/30 border border-amber-900/40 flex items-center justify-center text-amber-400">
              <Inbox className="h-5 w-5" />
            </div>
          </div>

          {/* Stat Item: Confirmed */}
          <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Đã xác nhận</span>
              <span className="text-3xl font-bold font-serif text-blue-400">{confirmedCount}</span>
            </div>
            <div className="h-10 w-10 rounded bg-blue-950/30 border border-blue-900/40 flex items-center justify-center text-blue-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          {/* Stat Item: Expected Revenue */}
          <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Doanh thu dự kiến</span>
              <span className="text-xl font-bold font-serif text-[#c5a880] truncate block max-w-[170px]">
                {formatCurrency(expectedRevenue)}
              </span>
            </div>
            <div className="h-10 w-10 rounded bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center text-[#c5a880]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* Filters Controls Section */}
        <section className="bg-slate-900 border border-slate-850 rounded-lg p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mã, tên, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880] appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Dates Filter Range */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Từ ngày (Nhận phòng)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Đến ngày (Nhận phòng)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c5a880]/30 focus:border-[#c5a880]"
            />
          </div>
        </section>

        {/* Bookings Data Table */}
        <section className="bg-slate-900 border border-slate-850 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-stone-100">Danh Sách Lịch Đặt Phòng</h2>
            <span className="text-xs text-slate-400 font-light">
              Đang hiển thị {filteredBookings.length} / {totalBookingsCount} đơn
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                  <th className="px-6 py-3.5">Mã Booking</th>
                  <th className="px-6 py-3.5">Họ Tên Khách</th>
                  <th className="px-6 py-3.5">Phòng đặt</th>
                  <th className="px-6 py-3.5">Thời gian lưu trú</th>
                  <th className="px-6 py-3.5">Tổng tiền</th>
                  <th className="px-6 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-light">
                      Không tìm thấy lịch đặt phòng phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const roomInfo = b.rooms as { name: string; room_type: string } | null;
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-850/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedBooking(b)}
                      >
                        <td className="px-6 py-4 font-mono font-semibold tracking-wider text-[#c5a880] select-all">
                          {b.booking_code}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-200">
                          {b.guest_name}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {roomInfo?.name || 'Phòng nghỉ'}
                        </td>
                        <td className="px-6 py-4 text-slate-350 text-xs">
                          {formatDateString(b.check_in_date)} — {formatDateString(b.check_out_date)} ({b.number_of_nights} đêm)
                        </td>
                        <td className="px-6 py-4 font-serif font-semibold text-stone-200">
                          {formatCurrency(b.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block border text-[10px] px-2 py-0.5 rounded font-semibold ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {getStatusText(b.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-100 text-xs font-semibold uppercase tracking-wider py-1.5 px-3 rounded hover:bg-slate-800 transition-colors"
                          >
                            Chi tiết
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Booking Details Dialog Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#c5a880] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chi tiết booking {selectedBooking.booking_code}
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Họ và tên khách</span>
                  <span className="font-medium text-slate-150 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    {selectedBooking.guest_name}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Trạng thái hiện tại</span>
                  <span
                    className={`inline-block border text-[10px] px-2.5 py-0.5 rounded font-semibold ${getStatusBadgeClass(
                      selectedBooking.status
                    )}`}
                  >
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Số điện thoại</span>
                  <a
                    href={`tel:${selectedBooking.guest_phone}`}
                    className="font-medium text-slate-200 hover:text-[#c5a880] transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {selectedBooking.guest_phone}
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Email liên hệ</span>
                  {selectedBooking.guest_email ? (
                    <a
                      href={`mailto:${selectedBooking.guest_email}`}
                      className="font-medium text-slate-200 hover:text-[#c5a880] transition-colors flex items-center gap-1.5 truncate block max-w-[200px]"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {selectedBooking.guest_email}
                    </a>
                  ) : (
                    <span className="text-slate-500 font-light flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      Không cung cấp
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Phòng đã đặt</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    {(selectedBooking.rooms as { name: string } | null)?.name}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Thời gian lưu trú</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {formatDateString(selectedBooking.check_in_date)} — {formatDateString(selectedBooking.check_out_date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Đơn giá / Số đêm</span>
                  <span className="font-medium text-slate-250 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {formatCurrency(selectedBooking.price_per_night)} × {selectedBooking.number_of_nights} đêm
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tổng chi phí thanh toán</span>
                  <span className="font-serif text-lg font-bold text-[#c5a880] flex items-center gap-1.5">
                    <DollarSign className="h-4.5 w-4.5 text-slate-500" />
                    {formatCurrency(selectedBooking.total_price)}
                  </span>
                </div>
              </div>

              {/* Special Request */}
              <div className="space-y-1 border-b border-slate-850 pb-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Yêu cầu đặc biệt</span>
                <p className="text-slate-350 font-light leading-relaxed whitespace-pre-line text-xs bg-slate-950/40 p-2.5 rounded border border-slate-850">
                  {selectedBooking.special_request || 'Không có yêu cầu đặc biệt.'}
                </p>
              </div>

              {/* Admin Actions Status Management */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Quản lý trạng thái đơn đặt phòng</span>
                <div className="flex flex-wrap gap-2.5">
                  {/* Status transitions allowed:
                      pending -> confirmed
                      pending -> cancelled
                      confirmed -> completed
                      confirmed -> cancelled */}

                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setConfirmingStatus({
                          bookingId: selectedBooking.id,
                          newStatus: 'confirmed',
                          bookingCode: selectedBooking.booking_code,
                        })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1"
                      >
                        Xác nhận Booking
                      </button>
                      <button
                        onClick={() => setConfirmingStatus({
                          bookingId: selectedBooking.id,
                          newStatus: 'cancelled',
                          bookingCode: selectedBooking.booking_code,
                        })}
                        className="bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-900/60 font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1"
                      >
                        Hủy Booking
                      </button>
                    </>
                  )}

                  {selectedBooking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => setConfirmingStatus({
                          bookingId: selectedBooking.id,
                          newStatus: 'completed',
                          bookingCode: selectedBooking.booking_code,
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1"
                      >
                        Hoàn thành lưu trú
                      </button>
                      <button
                        onClick={() => setConfirmingStatus({
                          bookingId: selectedBooking.id,
                          newStatus: 'cancelled',
                          bookingCode: selectedBooking.booking_code,
                        })}
                        className="bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-900/60 font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1"
                      >
                        Hủy Booking
                      </button>
                    </>
                  )}

                  {(selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled') && (
                    <span className="text-xs text-slate-500 font-light italic">Đơn hàng ở trạng thái cuối cùng, không thể chuyển đổi tiếp.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Dialog */}
      {confirmingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <h4 className="font-serif text-base font-semibold text-white">Xác nhận chuyển trạng thái?</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Bạn có chắc chắn muốn chuyển đổi trạng thái của đơn đặt phòng{' '}
              <span className="font-semibold text-[#c5a880] font-mono">{confirmingStatus.bookingCode}</span> sang{' '}
              <span className="font-semibold text-slate-200">
                &quot;{getStatusText(confirmingStatus.newStatus)}&quot;
              </span>
              ? Thao tác này không thể hoàn tác.
            </p>

            {statusUpdateMessage && (
              <p className="text-xs text-[#c5a880]">{statusUpdateMessage}</p>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setConfirmingStatus(null);
                  setStatusUpdateMessage(null);
                }}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateStatus}
                className="bg-[#c5a880] hover:bg-[#b0936d] text-slate-950 text-xs font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
              >
                Đồng ý thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
