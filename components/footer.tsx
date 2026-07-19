import Link from 'next/link';
import { Mail, Phone, MapPin, Hotel, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Hotel className="h-6 w-6 text-[#c5a880]" />
              <span className="font-serif text-lg font-semibold tracking-[0.2em] text-[#c5a880] uppercase">
                Lumière Hotel
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 font-light">
              Khách sạn boutique phong cách cổ điển xen lẫn nét đương đại. Lumière mang đến không gian nghỉ dưỡng tĩnh lặng, tinh tế và dịch vụ chăm sóc chu đáo chuẩn cá nhân hóa tại trung tâm thành phố.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-100 uppercase">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-[#c5a880] transition-colors flex items-center gap-1">
                  Trang chủ <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-[#c5a880] transition-colors flex items-center gap-1">
                  Phòng nghỉ <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                </Link>
              </li>
              <li>
                <Link href="/booking-lookup" className="hover:text-[#c5a880] transition-colors flex items-center gap-1">
                  Tra cứu đặt phòng <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#c5a880] transition-colors flex items-center gap-1 text-stone-500">
                  Trang Quản trị <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-6">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-100 uppercase">
              Liên hệ với chúng tôi
            </h3>
            <ul className="space-y-4 text-sm text-stone-400 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#c5a880] shrink-0" />
                <span>B50TT15 Hội Y Học Giấc Ngủ Việt Nam, Văn Quán, Hà Đông, Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#c5a880] shrink-0" />
                <a href="tel:0349159682" className="hover:text-[#c5a880] transition-colors">
                  0349159683
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#c5a880] shrink-0" />
                <a href="mailto:info@lumierehotel.vn" className="hover:text-[#c5a880] transition-colors">
                  duongdinh242009@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-16 border-t border-stone-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500 font-light">
            © {new Date().getFullYear()} Lumière Hotel. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex gap-6 text-xs text-stone-500 font-light">
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <a href="#" className="hover:underline">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
