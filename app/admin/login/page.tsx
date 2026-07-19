'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Loader2, AlertCircle, Hotel } from 'lucide-react';
import { adminLoginSchema } from '@/lib/validations/schemas';
import { loginAdminAction } from '@/actions/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await loginAdminAction(data);
      if (response.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[#c5a880] mb-2">
            <Hotel className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-[0.2em] text-[#c5a880] uppercase">
            LUMIÈRE HOTEL
          </h1>
          <p className="text-slate-400 text-xs font-light">
            Cổng thông tin quản trị viên khách sạn
          </p>
        </div>

        {/* Error Message banner */}
        {errorMessage && (
          <div className="rounded bg-red-950/50 p-3.5 border border-red-900/50 text-red-200 text-xs flex gap-2.5 items-start">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              Mật khẩu truy cập *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                placeholder="Nhập mật khẩu admin..."
                {...register('password')}
                className={`w-full pl-10 pr-4 py-2.5 rounded border ${
                  errors.password ? 'border-red-500 focus:ring-red-900/20' : 'border-slate-700 focus:ring-slate-800'
                } bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2`}
                autoFocus
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c5a880] hover:bg-[#b0936d] disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-serif font-semibold uppercase tracking-widest text-xs py-3 rounded transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập hệ thống'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
