# Lumière Hotel — Website Đặt Phòng Khách Sạn Boutique

Dự án MVP website đặt phòng khách sạn boutique mini **Lumière Hotel**, được xây dựng với mục tiêu mang lại trải nghiệm đặt phòng sang trọng, mượt mà và bảo mật.

---

## ⚡ Khởi chạy nhanh (Quick Start)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env (xem hướng dẫn bên dưới)
copy .env.example .env

# 3. Chạy local
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)  
Trang quản trị: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Cấu hình tài khoản Admin

> **Đây là nơi bạn đặt mật khẩu admin — trong file `.env` ở thư mục gốc dự án.**

Mở (hoặc tạo) file `.env` tại `d:\web-project-khachsan\.env` và điền:

```env
# Mật khẩu đăng nhập trang /admin/login
ADMIN_PASSWORD=mat_khau_cua_ban_tai_day

# Khóa bí mật ký JWT session cookie (tối thiểu 32 ký tự bất kỳ)
ADMIN_SESSION_SECRET=lumiere_hotel_secret_key_2026_minimum_32_chars
```

> ✅ **Không cần tạo tài khoản trong database.** Chỉ cần đặt `ADMIN_PASSWORD` trong file `.env` là xong.  
> ⚠️ **Tuyệt đối KHÔNG commit file `.env` lên Git** — file này đã được thêm vào `.gitignore`.

**Quy tắc mật khẩu admin:**
- Không giới hạn độ dài, dùng ký tự bất kỳ
- Thay đổi bất kỳ lúc nào bằng cách sửa `ADMIN_PASSWORD` trong `.env` rồi restart server
- Chỉ có **1 tài khoản admin duy nhất** (thiết kế MVP)

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS v4 |
| Font | Playfair Display (serif) + Inter (sans) |
| Database | Supabase (PostgreSQL) |
| Form | React Hook Form + Zod |
| Auth | JWT cookie với jose |
| Icons | Lucide React |
| Date | date-fns |

---

## 2. Cấu trúc thư mục

```text
├── app/
│   ├── admin/                # Trang quản trị (login + dashboard)
│   ├── booking-lookup/       # Tra cứu đơn đặt phòng
│   ├── booking-success/      # Trang đặt phòng thành công
│   ├── rooms/                # Danh sách và chi tiết phòng
│   ├── robots.ts             # Tự generate /robots.txt cho SEO
│   ├── sitemap.ts            # Tự generate /sitemap.xml cho SEO
│   ├── error.tsx             # Trang lỗi
│   ├── layout.tsx            # Root layout (font, metadata, OG tags)
│   └── page.tsx              # Trang chủ
├── components/               # UI Components
├── lib/
│   ├── supabase/             # Supabase client (server + client)
│   ├── validations/          # Zod schemas
│   └── helpers.ts            # Format tiền, ngày, SĐT
├── actions/
│   ├── booking.ts            # Server Actions đặt phòng + tra cứu (có rate limit)
│   └── admin.ts              # Server Actions đăng nhập + quản lý (có brute-force protection)
├── types/
│   └── database.types.ts     # TypeScript interfaces
├── supabase/
│   └── migrations/           # SQL migration khởi tạo DB đầy đủ
├── public/images/            # Ảnh phòng và hero
└── .env.example              # Template biến môi trường
```

---

## 3. Hướng dẫn thiết lập đầy đủ

### Bước 1 — Tạo dự án Supabase

1. Truy cập [https://supabase.com](https://supabase.com) → **New Project**
2. Điền tên project, chọn region (Singapore gần nhất với Việt Nam)
3. Đặt database password và lưu lại
4. Chờ project khởi tạo (~2 phút)

### Bước 2 — Lấy API Keys

Trong trang Supabase project của bạn, vào **Settings → API**:

| Biến môi trường | Lấy từ đâu |
|----------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Mục **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mục **Project API keys → anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Mục **Project API keys → service_role** ⚠️ bí mật |

### Bước 3 — Chạy Migration SQL

1. Trong Supabase, vào **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung file `supabase/migrations/20260719000000_init.sql`
4. Dán vào editor và click **Run**

Migration sẽ tự động tạo:
- ✅ Bảng `rooms` và `bookings` với constraints đầy đủ
- ✅ Indexes tối ưu hiệu suất query
- ✅ Row Level Security (RLS) policies
- ✅ PostgreSQL function `create_booking_secure` (chống race condition)
- ✅ 6 phòng mẫu bằng tiếng Việt (Deluxe, Executive, Family, Suite...)

### Bước 4 — Tạo file `.env`

Tạo file `.env` tại thư mục gốc dự án (`d:\web-project-khachsan\.env`):

```env
# ---- Supabase ----
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ---- Admin Dashboard ----
# Đây là mật khẩu bạn dùng để đăng nhập /admin/login
ADMIN_PASSWORD=LumiereAdmin@2026

# Khóa ký session cookie JWT (tối thiểu 32 ký tự bất kỳ)
ADMIN_SESSION_SECRET=lumiere_hotel_jwt_secret_2026_secure_key_here

# ---- Site URL ----
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Bước 5 — Cài đặt và chạy

```bash
npm install
npm run dev
```

---

## 4. Sử dụng trang Quản trị Admin

### Đăng nhập
1. Truy cập [http://localhost:3000/admin](http://localhost:3000/admin)
2. Hệ thống tự redirect sang `/admin/login`
3. Nhập mật khẩu đã đặt trong `ADMIN_PASSWORD`
4. Click **Đăng nhập hệ thống**

### Tính năng Dashboard
| Tính năng | Mô tả |
|-----------|-------|
| 📊 **Thống kê tổng quan** | Tổng booking, chờ duyệt, đã xác nhận, doanh thu dự kiến |
| 🔍 **Tìm kiếm** | Theo mã booking, tên khách, số điện thoại |
| 🔽 **Bộ lọc** | Theo trạng thái, khoảng ngày nhận phòng |
| 📋 **Chi tiết booking** | Click vào dòng bất kỳ để xem đầy đủ thông tin |
| ✅ **Duyệt trạng thái** | `pending→confirmed`, `pending→cancelled`, `confirmed→completed`, `confirmed→cancelled` |
| 🚪 **Đăng xuất** | Nút đăng xuất ở header dashboard |

### Bảo mật Admin
- **Rate limiting**: Tối đa 5 lần thử đăng nhập/15 phút mỗi IP, sau đó bị khóa 15 phút
- **JWT cookie**: HTTP-only, SameSite=Lax, hết hạn sau 2 giờ
- **Middleware guard**: Toàn bộ route `/admin/*` được bảo vệ ở edge level

---

## 5. Build và Deploy lên Vercel

```bash
# Build production
npm run build

# Test production locally
npm run start
```

**Deploy Vercel:**
1. Push code lên GitHub (đảm bảo `.env` đã trong `.gitignore`)
2. Vào [vercel.com](https://vercel.com) → Import repository
3. Thiết lập **Environment Variables** trong Vercel dashboard (giống nội dung file `.env`)
4. Deploy!

---

## 6. Chạy kiểm thử

```bash
# Unit tests (tính đêm, validate, chuẩn hóa SĐT, kiểm tra trùng ngày)
npx tsx scratch/run-tests.ts

# TypeScript type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 7. Quyết định kỹ thuật & Hạn chế MVP

### Quyết định kỹ thuật
1. **Chống Race Condition**: PostgreSQL function `create_booking_secure` với `SELECT FOR UPDATE` — đảm bảo không bao giờ có 2 booking trùng phòng trùng ngày dù request cùng lúc
2. **Bảo mật dữ liệu**: RLS chặn client query thẳng bảng `bookings`; email và SĐT được mask trước khi gửi về client
3. **Security Headers**: `X-Frame-Options`, `HSTS`, `CSP`, `Permissions-Policy` đầy đủ
4. **Admin Auth**: JWT cookie HTTP-only, không lưu mật khẩu trong DB, brute-force protection

### Hạn chế MVP (không ảnh hưởng hoạt động)
- Chỉ hỗ trợ 1 tài khoản admin
- Rate limit dùng bộ nhớ tiến trình Node (reset khi serverless cold start) — dùng Redis/Upstash cho production thực sự
│   └── database.types.ts     # Interfaces Room, Booking
├── supabase/
│   └── migrations/           # File migration SQL khởi tạo Database
├── public/                   # Tài nguyên ảnh tĩnh và font chữ
│   └── images/               # Ảnh phòng mẫu và ảnh hero
└── scratch/                  # Scripts kiểm thử unit test
```

---

## 4. Hướng dẫn thiết lập & Chạy dự án

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 18+ (Dự án đi kèm Node v20.18.0 di động trong `scratch/` cho môi trường đặc biệt)
- **NPM / PNPM / YARN**

### Bước 1: Tạo dự án Supabase & Cấu hình Database
1. Truy cập [Supabase](https://supabase.com) và tạo một dự án mới.
2. Mở cổng **SQL Editor** trong trang quản trị Supabase.
3. Copy toàn bộ nội dung file SQL migration tại [20260719000000_init.sql](file:///d:/web-project-khachsan/supabase/migrations/20260719000000_init.sql) dán vào SQL Editor và nhấn **Run**.
   - Thao tác này sẽ tự động tạo bảng `rooms` và `bookings`, tạo indexes tối ưu, kích hoạt RLS (Row Level Security), cài đặt function tạo booking an toàn chống trùng lịch (`create_booking_secure`), và seed dữ liệu cho 6 phòng nghỉ mẫu bằng tiếng Việt.

### Bước 2: Thiết lập Biến môi trường
Tạo file `.env` từ `.env.example` ở thư mục gốc dự án:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key

ADMIN_PASSWORD=LumiereAdmin2026
ADMIN_SESSION_SECRET=a_secure_random_string_at_least_32_chars_long
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
> [!CAUTION]
> Tuyệt đối không commit file `.env` chứa khóa bảo mật thực lên Git.

### Bước 3: Cài đặt và chạy Local
Trong thư mục gốc dự án, chạy các lệnh sau:

```bash
# Cài đặt dependencies
npm install

# Khởi chạy server phát triển local
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) để trải nghiệm giao diện người dùng.

### Bước 4: Chạy kiểm thử tự động
Để chạy script test unit kiểm tra công thức tính đêm, tổng tiền, chuẩn hóa dữ liệu số điện thoại và thuật toán kiểm tra trùng ngày:
```bash
# Sử dụng Node local chạy file test
npm run test  # hoặc node scratch/run-tests.js
```

### Bước 5: Build và Deploy
Để build dự án sang bản tối ưu cho Production:
```bash
npm run build
```
Dự án được cấu hình hoàn chỉnh để sẵn sàng deploy trực tiếp lên **Vercel** bằng cách import repository và thiết lập các biến môi trường tương tự như file `.env`.

---

## 5. Quyết định kỹ thuật & Hạn chế MVP

### Các quyết định kỹ thuật quan trọng
1. **Chống Race Condition**: Sử dụng PostgreSQL function `create_booking_secure` trên DB với cơ chế khóa hàng `SELECT FOR UPDATE` trên bảng `rooms`. Điều này đảm bảo khi hai khách hàng cùng đặt một phòng tại cùng một khoảng thời gian trùng nhau ở cùng một phần miligiây, chỉ có một người được chấp nhận đặt phòng, người còn lại sẽ nhận thông báo lỗi chi tiết bằng tiếng Việt.
2. **Bảo mật dữ liệu cá nhân**: RLS được kích hoạt để chặn người dùng từ client query trực tiếp bảng `bookings`. Các chức năng xem thành công hoặc tra cứu đặt phòng đều thông qua Server Actions làm cổng trung chuyển, tự động che bớt (masking) Email và Số điện thoại trước khi gửi về giao diện client.
3. **Admin Authentication**: Đăng nhập bằng `ADMIN_PASSWORD` (từ biến môi trường, không lưu trong DB), tạo session an toàn bằng JWT cookie HTTP-only với SameSite Lax, ngăn chặn tuyệt đối các cuộc tấn công XSS.

### Hạn chế của MVP
- Mật khẩu admin sử dụng dạng tĩnh từ biến môi trường, chỉ hỗ trợ 1 tài khoản quản trị duy nhất.
- Chưa tích hợp cổng thanh toán trực tuyến (chỉ hỗ trợ đặt giữ chỗ chờ xác nhận).
- Chưa có tính năng CRUD (Thêm/Sửa/Xóa) danh sách phòng trực tiếp trên giao diện Admin (phải quản lý thông qua database/migration).
- Giới hạn rate limit API đơn giản trên bộ nhớ đệm tiến trình Node.js (khuyến nghị tích hợp Upstash/Redis khi lên Production).
