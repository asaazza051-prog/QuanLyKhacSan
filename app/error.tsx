'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application level error trapped:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 shadow-lg rounded-lg p-8 text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-2">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              Đã xảy ra lỗi hệ thống
            </h1>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              Thành thật xin lỗi quý khách, hệ thống gặp sự cố ngoài ý muốn khi xử lý yêu cầu này.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              className="bg-slate-900 hover:bg-[#c5a880] hover:text-slate-900 text-white text-xs font-semibold uppercase tracking-widest py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Thử tải lại trang
            </button>
            <Link
              href="/"
              className="bg-stone-100 hover:bg-stone-200 text-stone-850 text-xs font-semibold uppercase tracking-widest py-3 px-6 rounded transition-colors flex items-center justify-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
