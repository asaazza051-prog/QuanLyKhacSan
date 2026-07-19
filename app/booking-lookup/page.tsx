import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingLookupClient from '@/components/booking-lookup-client';

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export const metadata = {
  title: 'Tra Cứu Đơn Đặt Phòng — Lumière Hotel',
  description: 'Tra cứu thông tin chi tiết đơn đặt phòng, kiểm tra trạng thái xác nhận và chi phí tại Lumière Hotel.',
};

export default async function BookingLookupPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialCode = resolvedSearchParams.code || '';

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c5a880]">
              Cổng tra cứu thông tin
            </span>
            <h1 className="font-serif text-3xl font-medium text-stone-900">
              Tra Cứu Đơn Đặt Phòng
            </h1>
            <div className="h-0.5 w-16 bg-[#c5a880] mx-auto mt-4" />
          </div>

          {/* Core Lookup Interface */}
          <BookingLookupClient initialCode={initialCode} />
        </div>
      </main>
      <Footer />
    </>
  );
}
