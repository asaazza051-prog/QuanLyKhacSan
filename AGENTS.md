# Lumière Hotel — AI Agent Build Specification

> Đặc tả nguồn duy nhất cho project web đặt phòng khách sạn mini.
> Hãy đọc toàn bộ tài liệu trước khi triển khai và thực hiện liên tục, không dừng lại hỏi xác nhận ở từng bước.

## 1. Vai trò và mục tiêu

Bạn là **Senior Full-stack Developer kiêm UI/UX Designer**.

Hãy xây dựng hoàn chỉnh một website đặt phòng khách sạn mini bằng tiếng Việt với các tiêu chí:

- Code sạch, dễ hiểu và dễ mở rộng.
- Giao diện hiện đại, responsive, mobile-first.
- Luồng đặt phòng hoạt động thật với Supabase.
- Có validation, bảo mật, xử lý lỗi và kiểm thử cơ bản.
- Có thể chạy local và deploy lên Vercel.
- Không chỉ mô tả hoặc viết pseudocode; phải tạo đầy đủ source code.
- Sau khi hoàn thành phải chạy kiểm tra, tự sửa lỗi và báo cáo kết quả trung thực.

## 2. Phạm vi MVP

### Chức năng bắt buộc

- Xem danh sách phòng.
- Xem chi tiết từng phòng.
- Tìm phòng theo ngày nhận, ngày trả và số khách.
- Kiểm tra phòng còn trống.
- Tạo đơn đặt phòng.
- Hiển thị mã đặt phòng sau khi thành công.
- Tra cứu booking bằng mã đặt phòng và số điện thoại.
- Admin đăng nhập, xem dashboard và quản lý trạng thái booking.

### Không xây dựng trong phiên bản này

- Thanh toán online.
- Tài khoản khách hàng.
- Đánh giá phòng.
- Nhiều chi nhánh khách sạn.
- Email hoặc SMS tự động.
- Quản lý nhà hàng hoặc dịch vụ bổ sung.
- CRUD phòng trong trang admin.

## 3. Công nghệ bắt buộc

Sử dụng:

- Next.js phiên bản ổn định mới nhất với App Router.
- TypeScript strict.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- Supabase làm database.
- Zod để validate dữ liệu.
- React Hook Form để xử lý form.
- date-fns để xử lý ngày.
- Vercel để deploy.

Quy ước:

- Không sử dụng ORM nếu không thực sự cần thiết.
- Kết nối trực tiếp với Supabase.
- Ưu tiên Server Components.
- Chỉ dùng Client Components khi cần tương tác phía client.
- Không sử dụng `any` nếu không thật sự cần.

## 4. Database — chỉ đúng 2 bảng nghiệp vụ

Tuyệt đối không tạo thêm bảng `users`, `hotels`, `room_types`, `amenities`, `payments` hoặc bảng nghiệp vụ nào khác.

### 4.1. Bảng `rooms`

```sql
id uuid primary key default gen_random_uuid()
name text not null
slug text unique not null
room_type text not null
description text
price_per_night integer not null
capacity integer not null default 2
bed_type text
area integer
image_url text
amenities jsonb default '[]'::jsonb
status text not null check (status in ('available', 'maintenance', 'inactive'))
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### 4.2. Bảng `bookings`

Đây là bảng lưu đơn đặt phòng.

```sql
id uuid primary key default gen_random_uuid()
booking_code text unique not null
room_id uuid not null references rooms(id)
guest_name text not null
guest_phone text not null
guest_email text
check_in_date date not null
check_out_date date not null
number_of_guests integer not null default 1
number_of_nights integer not null
price_per_night integer not null
total_price integer not null
special_request text
status text not null check (status in ('pending', 'confirmed', 'cancelled', 'completed'))
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### 4.3. Yêu cầu database

Tạo đầy đủ:

- Foreign key.
- Check constraints hợp lý.
- Index cho `room_id`, `booking_code`, `check_in_date`, `check_out_date` và `status`.
- Trigger tự động cập nhật `updated_at`.
- File SQL migration hoàn chỉnh.
- Seed data cho 6 phòng mẫu bằng tiếng Việt.

## 5. Quy tắc kiểm tra phòng trống

Một booking mới bị trùng lịch nếu tồn tại booking cùng phòng thỏa mãn:

```text
status thuộc pending hoặc confirmed
AND booking.check_in_date < ngày trả phòng mới
AND booking.check_out_date > ngày nhận phòng mới
```

Quy tắc bổ sung:

- Không tính booking `cancelled` hoặc `completed` là lịch đang giữ phòng.
- Cho phép booking mới nhận phòng đúng ngày booking cũ trả phòng.
- Phải kiểm tra ở server, không chỉ ở frontend.
- Chỉ cho đặt phòng có `rooms.status = 'available'`.
- Ngày trả phòng phải sau ngày nhận phòng.
- Không cho đặt ngày nhận phòng trong quá khứ.
- Số khách phải từ 1 đến `rooms.capacity`.
- `number_of_nights = check_out_date - check_in_date`.
- Server phải đọc lại `price_per_night` từ bảng `rooms`.
- Không tin giá, số đêm hoặc tổng tiền do client gửi.
- `total_price = number_of_nights × price_per_night`.

## 6. Chống race condition khi đặt phòng

Đưa logic kiểm tra phòng trống và tạo booking vào một PostgreSQL function.

Yêu cầu:

- Sử dụng transaction hoặc advisory lock phù hợp.
- Không tạo thêm bảng.
- Frontend hoặc server action gọi function thay vì insert booking trực tiếp.
- Function phải đọc giá và capacity từ `rooms`.
- Function phải kiểm tra lại toàn bộ điều kiện trước khi insert.
- Trả lỗi rõ ràng bằng tiếng Việt nếu phòng vừa được người khác đặt.
- Nếu dùng `SECURITY DEFINER`, cố định `search_path` an toàn.
- Thiết lập `GRANT` và `REVOKE` phù hợp.

Sinh `booking_code` theo định dạng tương tự:

```text
HTL-20260719-A8K2
```

Mã phải đủ khó trùng và có unique constraint.

## 7. Các trang public

### 7.1. Trang chủ `/`

Bao gồm:

- Logo chữ “Lumière Hotel”.
- Menu: Trang chủ, Phòng nghỉ, Tiện nghi, Liên hệ.
- Hero section sang trọng, tối giản.
- Form tìm phòng nhanh:
  - Ngày nhận phòng.
  - Ngày trả phòng.
  - Số khách.
- Danh sách phòng nổi bật.
- Khu vực tiện nghi.
- Khu vực lý do lựa chọn khách sạn.
- Footer đầy đủ.

### 7.2. Danh sách phòng `/rooms`

Mỗi card phòng hiển thị:

- Ảnh.
- Tên phòng.
- Loại phòng.
- Sức chứa.
- Loại giường.
- Diện tích.
- Giá mỗi đêm.
- Nút “Xem chi tiết”.
- Nút “Đặt phòng”.

Bộ lọc:

- Ngày nhận và trả phòng.
- Số khách.
- Khoảng giá.

Nếu người dùng đã chọn ngày, chỉ hiển thị phòng phù hợp và còn trống.

### 7.3. Chi tiết phòng `/rooms/[slug]`

Bao gồm:

- Ảnh lớn.
- Tên, mô tả và giá.
- Danh sách tiện nghi.
- Sức chứa, diện tích và loại giường.
- Form đặt phòng bên phải trên desktop.
- Form đặt phòng phía dưới trên mobile.
- Tự động tính số đêm và tổng tiền.
- Hiển thị lỗi nếu phòng không còn trống.

### 7.4. Đặt phòng thành công `/booking-success`

Hiển thị:

- Icon thành công.
- Mã đặt phòng.
- Tên khách.
- Phòng đã đặt.
- Ngày nhận và trả phòng.
- Số đêm.
- Tổng tiền.
- Trạng thái “Chờ xác nhận”.
- Nút quay về trang chủ.

Không đưa dữ liệu nhạy cảm vào URL. Có thể truyền mã booking và lấy thông tin cần thiết ở server.

### 7.5. Tra cứu booking `/booking-lookup`

Cho phép tra cứu bằng đồng thời:

- Mã đặt phòng.
- Số điện thoại.

Chỉ trả booking khi cả hai thông tin khớp nhau.

Hiển thị:

- Mã đặt phòng.
- Tên phòng.
- Ngày nhận và trả phòng.
- Tổng tiền.
- Trạng thái.

Che bớt email và số điện thoại khi hiển thị.

## 8. Form đặt phòng

Các trường:

- Họ và tên.
- Số điện thoại.
- Email không bắt buộc.
- Ngày nhận phòng.
- Ngày trả phòng.
- Số khách.
- Yêu cầu đặc biệt không bắt buộc.
- Checkbox đồng ý chính sách đặt phòng.
- Tóm tắt giá, số đêm và tổng tiền.

Validation bằng Zod ở cả client và server:

- Họ tên tối thiểu 2 ký tự.
- Số điện thoại Việt Nam hợp lệ ở mức cơ bản.
- Email đúng định dạng nếu được nhập.
- Yêu cầu đặc biệt tối đa 500 ký tự.
- Số khách hợp lệ với capacity.
- Khoảng ngày hợp lệ.

Trải nghiệm form:

- Chuẩn hóa số điện thoại trước khi lưu.
- Chống submit nhiều lần.
- Hiển thị loading.
- Disable button đúng trạng thái.
- Hiển thị lỗi bằng tiếng Việt.
- Không reset form nếu tạo booking thất bại.

## 9. Admin

### 9.1. Đăng nhập

Route: `/admin/login`

Yêu cầu:

- Mật khẩu lấy từ `ADMIN_PASSWORD`.
- Không hard-code mật khẩu.
- Không tạo bảng admin hoặc users.
- Khi đăng nhập thành công, tạo cookie HTTP-only.
- Cookie dùng `SameSite=Lax`.
- Cookie dùng `Secure` trong production.
- Session được ký và kiểm tra bằng `ADMIN_SESSION_SECRET`.
- Không lưu trực tiếp `ADMIN_PASSWORD` trong cookie.
- Có chức năng đăng xuất.
- Bảo vệ toàn bộ route admin bằng middleware hoặc server-side guard.

Đây là giải pháp dành cho MVP cá nhân; ghi rõ hạn chế trong README.

### 9.2. Dashboard `/admin`

Hiển thị:

- Tổng số booking.
- Booking đang chờ xác nhận.
- Booking đã xác nhận.
- Doanh thu dự kiến từ booking `confirmed` và `completed`.
- Bảng danh sách booking.
- Tìm kiếm theo booking code, tên hoặc số điện thoại.
- Lọc theo trạng thái.
- Lọc theo khoảng ngày.
- Xem chi tiết booking.

Cho phép chuyển trạng thái:

```text
pending → confirmed
pending → cancelled
confirmed → completed
confirmed → cancelled
```

Hiển thị hộp xác nhận trước khi đổi trạng thái.

Không cần CRUD phòng trong admin ở phiên bản đầu tiên.

## 10. Server-side logic

Có các chức năng server-side sau:

- Lấy danh sách phòng.
- Lấy chi tiết phòng theo slug.
- Kiểm tra phòng trống.
- Tạo booking an toàn.
- Tra cứu booking.
- Đăng nhập và đăng xuất admin.
- Lấy danh sách booking cho admin.
- Cập nhật trạng thái booking.

Ưu tiên Server Actions hoặc Route Handlers phù hợp.

Yêu cầu:

- Không expose Supabase service role key cho client.
- Validate tất cả input ở server bằng Zod.
- Chuẩn hóa số điện thoại trước khi lưu hoặc so sánh.
- Xử lý dữ liệu người dùng an toàn.
- Có cơ chế xử lý lỗi thống nhất.
- Không log thông tin nhạy cảm.
- Chống open redirect.
- Hạn chế spam cho endpoint tạo và tra cứu booking.
- Nếu rate limit dùng bộ nhớ tiến trình, ghi rõ hạn chế khi chạy serverless và đề xuất Redis cho production.

## 11. Supabase RLS

Bật Row Level Security cho cả hai bảng.

Policy theo hướng:

- Public chỉ đọc phòng có `status = 'available'`.
- Public không được đọc trực tiếp toàn bộ bảng `bookings`.
- Tạo booking phải đi qua PostgreSQL function hoặc server có kiểm soát.
- Admin sử dụng service role key phía server.
- Client không được tự cập nhật trạng thái booking.
- Client không được sửa giá, số đêm hoặc tổng tiền.

Cung cấp SQL đầy đủ cho:

- Bật RLS.
- Policies.
- Function.
- Grants và revokes.
- Trigger và indexes.

## 12. Thiết kế giao diện

Phong cách:

- Boutique hotel hiện đại.
- Sang trọng nhưng tối giản.
- Màu chính: xanh navy đậm.
- Màu phụ: vàng champagne.
- Nền kem nhạt.
- Typography rõ ràng.
- Bo góc vừa phải.
- Shadow nhẹ.
- Nhiều khoảng trắng.
- Không lạm dụng gradient.
- Khu vực public không mang cảm giác dashboard SaaS.

Responsive:

- Mobile-first.
- Hoạt động tốt trên điện thoại, tablet và desktop.
- Header mobile có menu thu gọn.
- Form dễ dùng trên màn hình nhỏ.
- Không tràn ngang.

Accessibility:

- Semantic HTML.
- Label đầy đủ.
- Điều hướng bằng bàn phím.
- Focus state rõ.
- Độ tương phản phù hợp.
- Alt text cho ảnh.
- Loading và disabled state chính xác.

## 13. Trạng thái giao diện

Mỗi trang phải xử lý phù hợp:

- Loading state.
- Skeleton loading.
- Empty state.
- Error state.
- Success state.
- Toast thông báo.
- Trang 404.
- Trang lỗi chung.

Không để giao diện trắng hoàn toàn khi tải dữ liệu hoặc có lỗi.

## 14. Dữ liệu mẫu và ảnh

Seed 6 phòng mẫu:

1. Phòng Deluxe Hướng Phố.
2. Phòng Deluxe Hướng Vườn.
3. Phòng Executive.
4. Phòng Family.
5. Junior Suite.
6. Presidential Suite.

Yêu cầu:

- Nội dung bằng tiếng Việt.
- Dùng ảnh local trong `public` hoặc nguồn placeholder ổn định.
- Nếu dùng ảnh remote, cấu hình `next/image` đúng cách.
- Có fallback khi ảnh lỗi.
- Giá dùng VNĐ.
- Định dạng tiền bằng `Intl.NumberFormat("vi-VN")`.
- Ngày hiển thị theo chuẩn Việt Nam.
- Xử lý timezone ngày đặt phòng nhất quán.

## 15. Cấu trúc source code

Tổ chức rõ ràng, gợi ý:

```text
app/
components/
components/ui/
lib/
lib/supabase/
lib/validations/
actions/
types/
supabase/migrations/
public/
```

Tách riêng:

- UI components.
- Database queries.
- Business logic.
- Validation schemas.
- TypeScript types.
- Helpers xử lý ngày, điện thoại và tiền.

Không viết toàn bộ logic trong một file lớn.

## 16. Biến môi trường

Tạo `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Yêu cầu:

- Không tạo `.env` chứa secret thật.
- Không commit secret.
- Không expose biến bí mật cho client.

## 17. README

Tạo `README.md` bằng tiếng Việt gồm:

- Giới thiệu project.
- Danh sách công nghệ.
- Yêu cầu môi trường.
- Hướng dẫn cài đặt.
- Hướng dẫn tạo Supabase project.
- Cách chạy migration.
- Cách seed dữ liệu.
- Cách thiết lập biến môi trường.
- Cách chạy local.
- Cách build production.
- Cách deploy Vercel.
- Hướng dẫn admin demo.
- Hạn chế của MVP.
- Gợi ý nâng cấp.

## 18. Chất lượng code

Bắt buộc:

- TypeScript strict.
- Không dùng `any` nếu không cần.
- Không còn lỗi TypeScript.
- Không còn lỗi ESLint nghiêm trọng.
- Không có import thừa.
- Không để TODO ở chức năng chính.
- Không mock luồng đặt phòng.
- Truy vấn Supabase phải hoạt động thật.
- Project chạy được sau khi cấu hình môi trường và migration.
- Tránh hydration error.
- Xử lý lỗi database và network.
- Code có kiểu rõ ràng, dễ bảo trì.

## 19. Kiểm thử

Tạo test cơ bản cho:

- Tính số đêm.
- Tính tổng tiền.
- Kiểm tra khoảng ngày bị trùng.
- Validation ngày nhận và trả phòng.
- Validation số khách.
- Chuẩn hóa số điện thoại.
- Sinh mã booking.

Checklist kiểm thử thủ công:

1. Đặt một phòng thành công.
2. Không thể đặt cùng phòng với ngày bị trùng.
3. Có thể đặt hai khoảng ngày liền nhau; booking cũ trả ngày 10 và booking mới nhận ngày 10.
4. Không thể đặt ngày trong quá khứ.
5. Không thể gửi số khách vượt capacity.
6. Không thể sửa giá từ client.
7. Không thể truy cập admin khi chưa đăng nhập.
8. Có thể tra cứu đúng booking bằng mã và số điện thoại.

## 20. Quy trình thực hiện bắt buộc

Thực hiện liên tục theo thứ tự:

1. Khởi tạo project và dependencies.
2. Tạo migration, function, trigger, indexes, RLS và seed data.
3. Tạo Supabase clients cho server và client đúng cách.
4. Tạo types, validation schemas và helpers.
5. Xây dựng giao diện public.
6. Xây dựng luồng đặt phòng.
7. Xây dựng tra cứu booking.
8. Xây dựng đăng nhập và dashboard admin.
9. Thêm loading, error, empty state và responsive.
10. Tạo tests, README và `.env.example`.
11. Chạy type-check, lint, test và production build.
12. Tự sửa tất cả lỗi phát hiện được.

Không dừng lại hỏi xác nhận ở từng bước.

Nếu phải tự quyết định một chi tiết nhỏ chưa được quy định, hãy chọn phương án:

1. Đơn giản.
2. An toàn.
3. Phù hợp với MVP cá nhân.
4. Dễ bảo trì.

Ghi các quyết định kỹ thuật quan trọng vào README.

## 21. Tiêu chí bàn giao

Khi hoàn thành, trả về:

- Cây thư mục project.
- Danh sách file đã tạo.
- SQL migration đầy đủ.
- Hướng dẫn chạy project.
- Danh sách biến môi trường.
- Các quyết định kỹ thuật quan trọng.
- Kết quả type-check.
- Kết quả lint.
- Kết quả test.
- Kết quả production build.

## 22. Lệnh cuối cùng dành cho Agent

> Hãy tạo đầy đủ source code có thể chạy sau khi cấu hình biến môi trường và migration. Không chỉ giải thích. Không tạo quá 2 bảng nghiệp vụ là `rooms` và `bookings`. Sau khi code xong, phải thực sự chạy type-check, lint, test và production build; tự sửa lỗi trước khi bàn giao và báo cáo kết quả trung thực.
