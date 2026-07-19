import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Users, BedDouble, Maximize2, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingForm from '@/components/booking-form';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/helpers';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    check_in_date?: string;
    check_out_date?: string;
    guests?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = createAdminClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('name, description')
    .eq('slug', resolvedParams.slug)
    .maybeSingle();

  if (!room) return { title: 'Không Tìm Thấy Phòng — Lumière Hotel' };

  return {
    title: `${room.name} — Lumière Hotel`,
    description: room.description || 'Chi tiết hạng phòng tại Lumière Hotel.',
  };
}

export default async function RoomDetailPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug;
  const checkIn = resolvedSearchParams.check_in_date || '';
  const checkOut = resolvedSearchParams.check_out_date || '';
  const guests = resolvedSearchParams.guests ? parseInt(resolvedSearchParams.guests) : 1;

  const supabase = createAdminClient();
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'available')
    .maybeSingle();

  if (error || !room) {
    console.error('Error fetching room detail:', error);
    return notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Button */}
          <div className="mb-6">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-[#c5a880] text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách phòng
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Room Gallery & Description */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Title & Price (Mobile top) */}
              <div className="lg:hidden">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5a880] block mb-1">
                  {room.room_type}
                </span>
                <h1 className="font-serif text-3xl font-medium text-stone-900 mb-2">{room.name}</h1>
                <p className="text-lg font-semibold text-[#c5a880] mb-4">
                  {formatCurrency(room.price_per_night)} <span className="text-xs text-stone-400 font-light">/ đêm</span>
                </p>
              </div>

              {/* Large Image Showcase */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-stone-100 border border-stone-200 shadow-sm">
                <Image
                  src={room.image_url || '/images/rooms/placeholder.jpg'}
                  alt={room.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>

              {/* Title & Core Details (Desktop) */}
              <div className="hidden lg:block space-y-2 border-b border-stone-200 pb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a880] block">
                  {room.room_type}
                </span>
                <div className="flex justify-between items-end">
                  <h1 className="font-serif text-4xl font-semibold text-stone-900 tracking-wide">{room.name}</h1>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">Đơn giá</span>
                    <span className="text-[#c5a880] text-2xl font-bold font-serif">
                      {formatCurrency(room.price_per_night)}
                      <span className="text-xs text-stone-500 font-light"> / đêm</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Features Specs */}
              <div className="grid grid-cols-3 gap-4 border-b border-stone-200 pb-6 text-stone-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-100 border border-stone-200 text-stone-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Sức chứa</span>
                    <span className="text-sm font-semibold text-stone-800">Tối đa {room.capacity} khách</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-l border-r border-stone-200 px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-100 border border-stone-200 text-stone-500">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Giường</span>
                    <span className="text-sm font-semibold text-stone-800 truncate block max-w-[130px]">
                      {room.bed_type || 'Giường King'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-100 border border-stone-200 text-stone-500">
                    <Maximize2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Diện tích</span>
                    <span className="text-sm font-semibold text-stone-800">{room.area || 30} m²</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-semibold text-stone-900 border-l-2 border-[#c5a880] pl-3">
                  Mô tả phòng nghỉ
                </h3>
                <p className="text-stone-600 font-light leading-relaxed text-sm whitespace-pre-line">
                  {room.description ||
                    'Trải nghiệm kỳ nghỉ tuyệt vời trong căn phòng sang trọng được thiết kế tinh tế của chúng tôi. Mọi chi tiết nội thất đều được chuẩn bị kỹ lưỡng để mang lại sự tiện nghi và yên bình trọn vẹn nhất cho quý khách.'}
                </p>
              </div>

              {/* Amenities List */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="font-serif text-lg font-semibold text-stone-900 border-l-2 border-[#c5a880] pl-3">
                  Tiện ích đi kèm
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities && room.amenities.length > 0 ? (
                    room.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 text-stone-700 text-sm">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="font-light">{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-xs font-light">Không có tiện ích đặc biệt nào được ghi nhận.</p>
                  )}
                </div>
              </div>

              {/* Hotel Policies Summary */}
              <div className="space-y-4 pt-6 border-t border-stone-200 bg-stone-100/50 p-4 rounded border border-stone-200/50">
                <h4 className="font-serif text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  Quy định & Chính sách đặt phòng
                </h4>
                <ul className="list-disc list-inside text-xs text-stone-500 space-y-1.5 font-light leading-relaxed">
                  <li>Giờ nhận phòng (Check-in): Từ 14:00. Giờ trả phòng (Check-out): Trước 12:00 trưa.</li>
                  <li>Hủy phòng miễn phí trước 48 giờ kể từ thời điểm nhận phòng.</li>
                  <li>Yêu cầu xuất trình CMND/CCCD hoặc Hộ chiếu khi làm thủ tục nhận phòng.</li>
                  <li>Số lượng khách tối đa đã bao gồm trẻ em (không quá quy định của từng phòng).</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Sticky Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm
                  room={room}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  initialGuests={guests}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
