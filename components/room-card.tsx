'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, BedDouble, Maximize2, ArrowRight } from 'lucide-react';
import { Room } from '@/types/database.types';
import { formatCurrency } from '@/lib/helpers';

interface RoomCardProps {
  room: Room;
  searchParams?: {
    check_in_date?: string;
    check_out_date?: string;
    guests?: number | string;
  };
}

export default function RoomCard({ room, searchParams }: RoomCardProps) {
  const [imgSrc, setImgSrc] = useState(room.image_url || '/images/rooms/placeholder.jpg');

  // Build query string if filters are already set
  const queryParts: string[] = [];
  if (searchParams?.check_in_date) queryParts.push(`check_in_date=${searchParams.check_in_date}`);
  if (searchParams?.check_out_date) queryParts.push(`check_out_date=${searchParams.check_out_date}`);
  if (searchParams?.guests) queryParts.push(`guests=${searchParams.guests}`);
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const detailUrl = `/rooms/${room.slug}${queryString}`;

  return (
    <div className="group overflow-hidden rounded-lg bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Room Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
        <Image
          src={imgSrc}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc('/images/rooms/placeholder.jpg')}
        />
        <div className="absolute top-4 left-4 bg-slate-900/90 text-[#c5a880] px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded">
          {room.room_type}
        </div>
      </div>

      {/* Room Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#c5a880] transition-colors line-clamp-1 mb-2">
          {room.name}
        </h3>
        
        <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2 mb-4">
          {room.description || 'Không gian nghỉ ngơi thư giãn và thoải mái đầy đủ tiện nghi.'}
        </p>

        {/* Room Attributes */}
        <div className="grid grid-cols-3 gap-2 border-t border-b border-stone-100 py-3 mb-6 text-stone-600 text-xs font-light">
          <div className="flex items-center gap-1.5 justify-center">
            <Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>Tối đa {room.capacity} khách</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center border-l border-r border-stone-100">
            <BedDouble className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{room.bed_type || 'Giường King'}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span>{room.area || 30} m²</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">Giá mỗi đêm</span>
            <span className="text-[#c5a880] font-semibold text-lg">
              {formatCurrency(room.price_per_night)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={detailUrl}
              className="text-stone-900 hover:text-[#c5a880] text-xs font-medium uppercase tracking-wider flex items-center gap-1 transition-colors py-2 px-3 rounded hover:bg-stone-50"
            >
              Chi tiết
            </Link>
            <Link
              href={`${detailUrl}#booking-section`}
              className="bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white text-xs font-medium uppercase tracking-widest py-2 px-4 rounded transition-all flex items-center gap-1"
            >
              Đặt phòng <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
