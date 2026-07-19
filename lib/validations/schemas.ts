import { z } from 'zod';

export const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/;

export const bookingSchema = z.object({
  guest_name: z.string()
    .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
    .max(100, { message: 'Họ và tên không quá 100 ký tự.' })
    .trim(),
  guest_phone: z.string()
    .transform((val) => val.replace(/[\s\-.()]/g, '')) // pre-clean
    .refine((clean) => phoneRegex.test(clean), {
      message: 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678).',
    }),
  guest_email: z.union([
    z.string().email({ message: 'Email không đúng định dạng.' }),
    z.literal(''),
    z.null()
  ]).optional().transform((val) => val || null),
  check_in_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Ngày nhận phòng không hợp lệ.',
    })
    .refine((val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(val) >= today;
    }, {
      message: 'Ngày nhận phòng không được là ngày trong quá khứ.',
    }),
  check_out_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày trả phòng không hợp lệ.',
  }),
  number_of_guests: z.number().int().min(1, { message: 'Số lượng khách phải lớn hơn hoặc bằng 1.' }),
  special_request: z.union([
    z.string().max(500, { message: 'Yêu cầu đặc biệt không được quá 500 ký tự.' }),
    z.null()
  ]).optional().transform(val => val || null),
  agree_policy: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải đồng ý với chính sách của khách sạn.',
  }),
}).refine((data) => {
  const inDate = new Date(data.check_in_date);
  const outDate = new Date(data.check_out_date);
  return outDate > inDate;
}, {
  message: 'Ngày trả phòng phải sau ngày nhận phòng.',
  path: ['check_out_date'],
});


export const adminLoginSchema = z.object({
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu.' }),
});

export const roomFilterSchema = z.object({
  check_in_date: z.string().optional().or(z.literal('')),
  check_out_date: z.string().optional().or(z.literal('')),
  guests: z.coerce.number().int().min(1).optional().default(1),
  minPrice: z.coerce.number().optional().default(0),
  maxPrice: z.coerce.number().optional().default(10000000),
});
