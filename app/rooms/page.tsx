import Header from '@/components/header';
import Footer from '@/components/footer';
import RoomFilters from '@/components/room-filters';
import RoomCard from '@/components/room-card';
import { createAdminClient } from '@/lib/supabase/server';
import { Room } from '@/types/database.types';
import { formatDateString } from '@/lib/helpers';

interface SearchParams {
  check_in_date?: string;
  check_out_date?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata = {
  title: 'Danh Sách Phòng Nghỉ — Lumière Hotel',
  description: 'Khám phá bộ sưu tập phòng nghỉ và biệt thự suite sang trọng tại Lumière Hotel. Các hạng phòng từ Deluxe thanh lịch đến Presidential Suite đẳng cấp.',
};

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const checkIn = resolvedSearchParams.check_in_date || '';
  const checkOut = resolvedSearchParams.check_out_date || '';
  const guests = resolvedSearchParams.guests ? parseInt(resolvedSearchParams.guests) : 1;
  const minPrice = resolvedSearchParams.minPrice ? parseInt(resolvedSearchParams.minPrice) : 500000;
  const maxPrice = resolvedSearchParams.maxPrice ? parseInt(resolvedSearchParams.maxPrice) : 8000000;

  let rooms: Room[] = [];
  let errorMsg = '';

  try {
    const supabase = createAdminClient();

    // 1. Core Query for available/maintenance rooms
    // RLS guidelines: Public can only see 'available' status rooms
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .gte('capacity', guests)
      .gte('price_per_night', minPrice)
      .lte('price_per_night', maxPrice);

    // 2. Perform availability subtraction if date filter is set
    if (checkIn && checkOut) {
      // Find all rooms booked during the requested date range
      // Overlap condition: booking.check_in_date < checkOut AND booking.check_out_date > checkIn
      const { data: bookedRooms, error: bookingError } = await supabase
        .from('bookings')
        .select('room_id')
        .in('status', ['pending', 'confirmed'])
        .lt('check_in_date', checkOut)
        .gt('check_out_date', checkIn);

      if (bookingError) {
        console.error('Error fetching booked rooms:', bookingError);
      } else if (bookedRooms && bookedRooms.length > 0) {
        const bookedRoomIds = bookedRooms.map((b) => b.room_id);
        // Exclude booked rooms
        query = query.not('id', 'in', `(${bookedRoomIds.join(',')})`);
      }
    }

    // Order by price ascending
    const { data, error } = await query.order('price_per_night', { ascending: true });

    if (error) {
      console.error('Error fetching rooms:', error);
      errorMsg = 'Lỗi truy vấn danh sách phòng. Vui lòng tải lại trang.';
    } else {
      rooms = data || [];
    }
  } catch (err) {
    console.error('Database connection error:', err);
    errorMsg = 'Không thể kết nối đến cơ sở dữ liệu.';
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Description */}
          <div className="border-b border-stone-200 pb-8 mb-8">
            <h1 className="font-serif text-3xl font-medium text-stone-900 mb-2">Phòng Nghỉ & Suite</h1>
            <p className="text-stone-500 font-light text-sm max-w-2xl leading-relaxed">
              Từ không gian Deluxe ấm cúng hướng ra khu vườn nhiệt đới đến những căn hộ Suite đẳng cấp sở hữu bể bơi riêng, Lumière đem lại lựa chọn đa dạng cho kỳ nghỉ của bạn.
            </p>
            {checkIn && checkOut && (
              <p className="mt-3 text-xs text-stone-600 bg-stone-100 border border-stone-200 w-fit px-3 py-1.5 rounded">
                Đang hiển thị phòng trống từ ngày{' '}
                <span className="font-semibold">{formatDateString(checkIn)}</span> đến ngày{' '}
                <span className="font-semibold">{formatDateString(checkOut)}</span> cho{' '}
                <span className="font-semibold">{guests} khách</span>.
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-80 shrink-0">
              <RoomFilters
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                initialGuests={guests}
                initialMinPrice={minPrice}
                initialMaxPrice={maxPrice}
              />
            </aside>

            {/* Rooms Listings Grid */}
            <div className="flex-1">
              {errorMsg ? (
                <div className="text-center py-12 bg-white rounded-lg border border-stone-200 text-stone-500 font-light">
                  {errorMsg}
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-stone-200 space-y-3">
                  <p className="text-stone-600 font-medium">Không tìm thấy phòng phù hợp.</p>
                  <p className="text-stone-400 text-sm font-light">
                    Vui lòng thử thay đổi bộ lọc hoặc chọn khoảng ngày khác.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      searchParams={{
                        check_in_date: checkIn,
                        check_out_date: checkOut,
                        guests: guests,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
