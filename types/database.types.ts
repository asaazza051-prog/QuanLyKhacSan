export type RoomStatus = 'available' | 'maintenance' | 'inactive';

export interface Room {
  id: string;
  name: string;
  slug: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  bed_type: string | null;
  area: number | null;
  image_url: string | null;
  amenities: string[]; // JSONB stored as array of strings
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  booking_code: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  check_in_date: string; // ISO date string (YYYY-MM-DD)
  check_out_date: string; // ISO date string (YYYY-MM-DD)
  number_of_guests: number;
  number_of_nights: number;
  price_per_night: number;
  total_price: number;
  special_request: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  // Join properties (optional)
  rooms?: Room;
}
