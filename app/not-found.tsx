import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = {
  title: 'Không Tìm Thấy Trang — Lumière Hotel',
  description: 'Trang quý khách truy cập không tồn tại hoặc đã được di chuyển.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 shadow-lg rounded-lg p-8 text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500 mb-2">
            <HelpCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              Không tìm thấy trang
            </h1>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              Trang quý khách đang tìm kiếm không tồn tại, đã bị gỡ bỏ hoặc thay đổi địa chỉ liên kết.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-block bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white font-serif font-semibold uppercase tracking-widest text-xs py-3.5 px-8 rounded transition-colors shadow-sm"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
