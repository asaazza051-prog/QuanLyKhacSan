'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Search } from 'lucide-react';

export default function QuickSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowString = () => {
    if (!checkIn) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const checkInDate = new Date(checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    return checkInDate.toISOString().split('T')[0];
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckIn(val);
    // If checkOut is before new checkIn + 1 day, reset checkOut
    if (checkOut && new Date(checkOut) <= new Date(val)) {
      setCheckOut('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận phòng và trả phòng.');
      return;
    }
    router.push(`/rooms?check_in_date=${checkIn}&check_out_date=${checkOut}&guests=${guests}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-stone-200 shadow-xl rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
    >
      {/* Check In Date */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-stone-400" />
          Ngày nhận phòng
        </label>
        <input
          type="date"
          min={getTodayString()}
          value={checkIn}
          onChange={handleCheckInChange}
          required
          className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {/* Check Out Date */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-stone-400" />
          Ngày trả phòng
        </label>
        <input
          type="date"
          min={getTomorrowString()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
          className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {/* Guests Count */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-stone-400" />
          Số lượng khách
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white"
        >
          <option value={1}>1 khách</option>
          <option value={2}>2 khách</option>
          <option value={3}>3 khách</option>
          <option value={4}>4 khách</option>
        </select>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white font-serif font-semibold uppercase tracking-widest text-xs py-3 rounded transition-colors shadow-sm flex items-center justify-center gap-2 h-[38px] cursor-pointer"
        >
          <Search className="h-4 w-4" />
          Tìm phòng trống
        </button>
      </div>
    </form>
  );
}
