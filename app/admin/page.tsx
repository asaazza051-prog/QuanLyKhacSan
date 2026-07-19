import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/actions/admin';
import { createAdminClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin-dashboard';
import { Booking } from '@/types/database.types';

export const metadata = {
  title: 'Bảng Điều Khiển Quản Trị — Lumière Hotel',
  description: 'Trang quản trị các đơn đặt phòng, theo dõi doanh thu và duyệt trạng thái đơn tại Lumière Hotel.',
};

export const revalidate = 0; // Disable server component page caching to ensure fresh bookings are loaded

export default async function AdminPage() {
  // 1. Guard check server-side
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    redirect('/admin/login');
  }

  let bookings: Booking[] = [];

  try {
    // 2. Fetch all bookings directly bypassing RLS using the admin client
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_code,
        room_id,
        guest_name,
        guest_phone,
        guest_email,
        check_in_date,
        check_out_date,
        number_of_guests,
        number_of_nights,
        price_per_night,
        total_price,
        special_request,
        status,
        created_at,
        updated_at,
        rooms (
          name,
          room_type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying bookings in AdminPage:', error);
    } else {
      bookings = (data as unknown as Booking[]) || [];
    }
  } catch (err) {
    console.error('Database connection error in AdminPage:', err);
  }

  return <AdminDashboard initialBookings={bookings} />;
}
