'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Calendar, Users, DollarSign, X } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';

interface RoomFiltersProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  initialMinPrice?: number;
  initialMaxPrice?: number;
}

export default function RoomFilters({
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  initialMinPrice = 500000,
  initialMaxPrice = 8000000,
}: RoomFiltersProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

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
    if (checkOut && new Date(checkOut) <= new Date(val)) {
      setCheckOut('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts: string[] = [];
    if (checkIn) queryParts.push(`check_in_date=${checkIn}`);
    if (checkOut) queryParts.push(`check_out_date=${checkOut}`);
    if (guests) queryParts.push(`guests=${guests}`);
    if (minPrice) queryParts.push(`minPrice=${minPrice}`);
    if (maxPrice) queryParts.push(`maxPrice=${maxPrice}`);

    router.push(`/rooms?${queryParts.join('&')}`);
  };

  const handleReset = () => {
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    setMinPrice(500000);
    setMaxPrice(8000000);
    router.push('/rooms');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm space-y-6 shrink-0 h-fit"
    >
      <div className="flex items-center justify-between border-b border-stone-150 pb-4">
        <span className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#c5a880]" />
          Bộ lọc tìm kiếm
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-stone-400 hover:text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <X className="h-3 w-3" />
          Đặt lại
        </button>
      </div>

      {/* Date Filters */}
      <div className="space-y-4">
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
            className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>

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
            className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </div>

      {/* Guests Count */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-stone-400" />
          Số khách
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

      {/* Price Range */}
      <div className="space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-stone-400" />
          Khoảng giá (VNĐ / đêm)
        </label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tối thiểu</span>
            <span>{formatCurrency(minPrice)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={8000000}
            step={100000}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Tối đa</span>
            <span>{formatCurrency(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={1000000}
            max={10000000}
            step={200000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
          />
        </div>
        
        {minPrice > maxPrice && (
          <p className="text-[10px] text-red-600 font-light">Giá tối thiểu không được lớn hơn giá tối đa.</p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={minPrice > maxPrice}
        className="w-full bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 disabled:bg-stone-300 disabled:text-stone-500 text-white font-serif font-semibold uppercase tracking-widest text-xs py-3 rounded transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        Áp dụng bộ lọc
      </button>
    </form>
  );
}
