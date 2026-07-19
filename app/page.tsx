import Link from 'next/link';
import Image from 'next/image';
import { Shield, Sparkles, Award, Coffee, Wifi, Utensils, Waves, Compass, Activity } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import QuickSearch from '@/components/quick-search';
import RoomCard from '@/components/room-card';
import { createAdminClient } from '@/lib/supabase/server';
import { Room } from '@/types/database.types';

export const metadata = {
  title: 'Lumière Hotel — Khách Sạn Boutique Sang Trọng',
  description: 'Trải nghiệm không gian nghỉ dưỡng tinh tế, sang trọng và dịch vụ cá nhân hóa đỉnh cao tại trung tâm thành phố. Đặt phòng ngay để nhận ưu đãi tốt nhất.',
};

export default async function Home() {
  let featuredRooms: Room[] = [];
  let errorMsg = '';

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .order('price_per_night', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error fetching featured rooms:', error);
      errorMsg = 'Không thể tải danh sách phòng nổi bật.';
    } else {
      featuredRooms = data || [];
    }
  } catch (err) {
    console.error('Error connecting to database:', err);
    errorMsg = 'Không thể kết nối đến cơ sở dữ liệu.';
  }

  const amenities = [
    { icon: Wifi, title: 'Wifi Siêu Tốc', desc: 'Hệ thống mạng không dây tốc độ cao phủ sóng toàn bộ khách sạn.' },
    { icon: Waves, title: 'Bể Bơi Vô Cực', desc: 'Bể bơi tầng thượng với tầm nhìn toàn cảnh thành phố thơ mộng.' },
    { icon: Utensils, title: 'Nhà Hàng Fine Dining', desc: 'Tinh hoa ẩm thực Á-Âu được chế biến bởi các đầu bếp hàng đầu.' },
    { icon: Coffee, title: 'Lounge & Cafe', desc: 'Không gian thư giãn thưởng thức những tách cafe thượng hạng và cocktail độc bản.' },
    { icon: Compass, title: 'Dịch Vụ Quản Gia', desc: 'Hỗ trợ sắp xếp lịch trình lịch lãm và phục vụ riêng biệt 24/7.' },
    { icon: Activity, title: 'Spa & Wellness', desc: 'Liệu trình chăm sóc sức khỏe và tinh thần chuyên sâu từ thiên nhiên.' },
  ];

  const reasons = [
    { icon: Award, title: 'Phong Cách Độc Bản', desc: 'Thiết kế boutique cổ điển châu Âu kết hợp hài hòa cùng hơi thở Đông Dương đương đại.' },
    { icon: Sparkles, title: 'Dịch Vụ Cá Nhân Hóa', desc: 'Mọi chi tiết trải nghiệm đều được tinh chỉnh tỉ mỉ theo đúng sở thích của từng vị khách.' },
    { icon: Shield, title: 'Sự Riêng Tư Tuyệt Đối', desc: 'Không gian yên tĩnh biệt lập mang đến sự an tâm và thư giãn trọn vẹn nhất.' },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        {/* Hero Section */}
        <section className="relative h-[85vh] min-h-[500px] w-full flex items-center justify-center bg-stone-900 overflow-hidden">
          <Image
            src="/images/hero-bg.jpg"
            alt="Lumiere Hotel Lobby"
            fill
            priority
            className="object-cover opacity-45 select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/70" />
          
          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center space-y-6">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] text-[#c5a880] block">
              Trải nghiệm nghỉ dưỡng Boutique độc bản
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide text-white leading-tight">
              LUMIÈRE HOTEL
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 font-light leading-relaxed">
              Nơi thời gian ngưng đọng trong không gian nghệ thuật tinh tế. Mỗi góc nhỏ tại Lumière kể một câu chuyện về sự sang trọng và lòng hiếu khách chuẩn mực.
            </p>
            <div className="pt-4">
              <Link
                href="/rooms"
                className="inline-block bg-[#c5a880] hover:bg-[#b0936d] text-stone-950 font-serif font-semibold uppercase tracking-widest text-xs py-3.5 px-8 rounded transition-all shadow-md hover:scale-105"
              >
                Khám phá phòng nghỉ
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Search Form Container */}
        <section className="relative z-20 mx-auto max-w-6xl px-4 -mt-16 sm:-mt-12 mb-20">
          <QuickSearch />
        </section>

        {/* Featured Rooms Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a880]">Phòng nghỉ nổi bật</span>
            <h2 className="font-serif text-3xl font-medium text-stone-900">Không Gian Nghỉ Dưỡng Thượng Lưu</h2>
            <div className="h-0.5 w-16 bg-[#c5a880] mx-auto mt-4" />
          </div>

          {errorMsg ? (
            <div className="text-center py-12 text-stone-500 font-light">{errorMsg}</div>
          ) : featuredRooms.length === 0 ? (
            <div className="text-center py-12 text-stone-500 font-light">Không có phòng trống khả dụng vào lúc này.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 border-b border-stone-800 text-stone-900 hover:text-[#c5a880] hover:border-[#c5a880] text-sm font-semibold tracking-wider transition-all pb-1 uppercase font-serif"
            >
              Xem tất cả các phòng nghỉ
            </Link>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-stone-900 text-stone-100 py-20 border-t border-b border-stone-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a880]">Tại sao chọn chúng tôi</span>
              <h2 className="font-serif text-3xl font-medium text-white">Sự Khác Biệt Làm Nên Thương Hiệu</h2>
              <div className="h-0.5 w-16 bg-[#c5a880] mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {reasons.map((reason, idx) => (
                <div key={idx} className="space-y-4 px-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-800 border border-stone-700 text-[#c5a880]">
                    <reason.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-100">{reason.title}</h3>
                  <p className="text-stone-400 text-sm font-light leading-relaxed">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section id="amenities" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a880]">Tiện ích đặc quyền</span>
            <h2 className="font-serif text-3xl font-medium text-stone-900">Tiện Nghi Chuẩn Boutique</h2>
            <div className="h-0.5 w-16 bg-[#c5a880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {amenities.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white rounded-lg border border-stone-200 shadow-sm hover:shadow transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-stone-50 border border-stone-200 text-[#c5a880] shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-semibold text-stone-900">{item.title}</h3>
                  <p className="text-stone-500 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
