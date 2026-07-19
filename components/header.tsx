'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Hotel } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-900 text-stone-100 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Hotel className="h-6 w-6 text-[#c5a880] transition-transform group-hover:scale-110" />
              <span className="font-serif text-xl font-semibold tracking-[0.2em] text-[#c5a880] uppercase">
                Lumière Hotel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium tracking-wider text-stone-300 hover:text-[#c5a880] transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/rooms"
              className="text-sm font-medium tracking-wider text-stone-300 hover:text-[#c5a880] transition-colors"
            >
              Phòng nghỉ
            </Link>
            <Link
              href="/#amenities"
              className="text-sm font-medium tracking-wider text-stone-300 hover:text-[#c5a880] transition-colors"
            >
              Tiện nghi
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium tracking-wider text-stone-300 hover:text-[#c5a880] transition-colors"
            >
              Liên hệ
            </Link>
            <Link
              href="/booking-lookup"
              className="ml-4 rounded bg-[#c5a880] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-stone-950 hover:bg-[#b0936d] transition-colors"
            >
              Tra cứu đặt phòng
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Mở menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden border-t border-stone-800 bg-stone-900/95 backdrop-blur-lg`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pb-4 pt-3 sm:px-3">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2.5 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100"
          >
            Trang chủ
          </Link>
          <Link
            href="/rooms"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2.5 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100"
          >
            Phòng nghỉ
          </Link>
          <Link
            href="/#amenities"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2.5 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100"
          >
            Tiện nghi
          </Link>
          <Link
            href="/#contact"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2.5 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100"
          >
            Liên hệ
          </Link>
          <div className="pt-4 pb-2 px-3">
            <Link
              href="/booking-lookup"
              onClick={() => setIsOpen(false)}
              className="flex w-full justify-center rounded bg-[#c5a880] py-3 text-sm font-semibold uppercase tracking-widest text-stone-950 hover:bg-[#b0936d] text-center"
            >
              Tra cứu đặt phòng
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
