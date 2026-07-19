-- ============================================================
-- Lumière Hotel — Migration SQL
-- Chạy file này trong Supabase SQL Editor (New Query > Paste > Run)
-- An toàn cho cả lần đầu chạy lẫn chạy lại để reset dữ liệu.
-- ============================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing triggers safely (dùng DO block để tránh lỗi khi bảng chưa tồn tại)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
    END IF;
END $$;

-- Drop functions and tables (IF EXISTS tự bỏ qua nếu không tồn tại)
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_booking_secure(uuid, text, text, text, date, date, integer, text);
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;

-- 3. Create updated_at automated column updates function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    room_type TEXT NOT NULL,
    description TEXT,
    price_per_night INTEGER NOT NULL CHECK (price_per_night > 0),
    capacity INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
    bed_type TEXT,
    area INTEGER CHECK (area > 0),
    image_url TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('available', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Register update_updated_at trigger for rooms
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Create Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms(id),
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests > 0),
    number_of_nights INTEGER NOT NULL CHECK (number_of_nights > 0),
    price_per_night INTEGER NOT NULL CHECK (price_per_night > 0),
    total_price INTEGER NOT NULL CHECK (total_price > 0),
    special_request TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

-- Register update_updated_at trigger for bookings
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Setup Indexes
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_rooms_status ON rooms(status);

-- 7. Define Secure Booking Function (concurrency-safe)
CREATE OR REPLACE FUNCTION create_booking_secure(
    p_room_id UUID,
    p_guest_name TEXT,
    p_guest_phone TEXT,
    p_guest_email TEXT,
    p_check_in_date DATE,
    p_check_out_date DATE,
    p_number_of_guests INTEGER,
    p_special_request TEXT
)
RETURNS TABLE (
    id UUID,
    booking_code TEXT,
    room_id UUID,
    guest_name TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    check_in_date DATE,
    check_out_date DATE,
    number_of_guests INTEGER,
    number_of_nights INTEGER,
    price_per_night INTEGER,
    total_price INTEGER,
    special_request TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
#variable_conflict use_column
DECLARE
    r_room RECORD;
    v_nights INTEGER;
    v_total_price INTEGER;
    v_code TEXT;
    v_code_exists BOOLEAN;
    v_conflict BOOLEAN;
BEGIN
    -- STEP 1: Lock the rooms row to prevent concurrent booking check (prevents race conditions)
    SELECT * INTO r_room 
    FROM rooms 
    WHERE id = p_room_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Phòng không tồn tại.';
    END IF;
    
    -- STEP 2: Verify room availability status
    IF r_room.status != 'available' THEN
        RAISE EXCEPTION 'Phòng hiện tại không sẵn sàng để đặt (đang bảo trì hoặc ngừng hoạt động).';
    END IF;
    
    -- STEP 3: Validate check-in date is not in the past
    IF p_check_in_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Ngày nhận phòng không được ở trong quá khứ.';
    END IF;
    
    -- STEP 4: Validate check-out date is after check-in date
    IF p_check_out_date <= p_check_in_date THEN
        RAISE EXCEPTION 'Ngày trả phòng phải sau ngày nhận phòng.';
    END IF;
    
    -- STEP 5: Validate capacity bounds
    IF p_number_of_guests < 1 OR p_number_of_guests > r_room.capacity THEN
        RAISE EXCEPTION 'Số khách vượt quá sức chứa tối đa của phòng (%) hoặc ít hơn 1.', r_room.capacity;
    END IF;
    
    -- STEP 6: Compute number of nights
    v_nights := p_check_out_date - p_check_in_date;
    
    -- STEP 7: Check overlap with active bookings (pending or confirmed)
    SELECT EXISTS (
        SELECT 1 
        FROM bookings 
        WHERE room_id = p_room_id 
          AND status IN ('pending', 'confirmed')
          AND check_in_date < p_check_out_date
          AND check_out_date > p_check_in_date
    ) INTO v_conflict;
    
    IF v_conflict THEN
        RAISE EXCEPTION 'Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác hoặc phòng khác.';
    END IF;
    
    -- STEP 8: Calculate price on server side
    v_total_price := v_nights * r_room.price_per_night;
    
    -- STEP 9: Generate unique booking code in format HTL-YYYYMMDD-XXXX
    LOOP
        v_code := 'HTL-' || TO_CHAR(p_check_in_date, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        SELECT EXISTS (
            SELECT 1 FROM bookings WHERE booking_code = v_code
        ) INTO v_code_exists;
        EXIT WHEN NOT v_code_exists;
    END LOOP;
    
    -- STEP 10: Insert booking
    RETURN QUERY
    INSERT INTO bookings (
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
        status
    ) VALUES (
        v_code,
        p_room_id,
        p_guest_name,
        p_guest_phone,
        p_guest_email,
        p_check_in_date,
        p_check_out_date,
        p_number_of_guests,
        v_nights,
        r_room.price_per_night,
        v_total_price,
        p_special_request,
        'pending'
    )
    RETURNING 
        bookings.id,
        bookings.booking_code,
        bookings.room_id,
        bookings.guest_name,
        bookings.guest_phone,
        bookings.guest_email,
        bookings.check_in_date,
        bookings.check_out_date,
        bookings.number_of_guests,
        bookings.number_of_nights,
        bookings.price_per_night,
        bookings.total_price,
        bookings.special_request,
        bookings.status,
        bookings.created_at,
        bookings.updated_at;
END;
$$ LANGUAGE plpgsql;

-- 8. Row Level Security Policies (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Rooms Policy: anyone can read available rooms
CREATE POLICY select_available_rooms ON rooms
    FOR SELECT
    USING (status = 'available');

-- Function SECURITY DEFINER: allows the function to bypass RLS when called by public
ALTER FUNCTION create_booking_secure(uuid, text, text, text, date, date, integer, text) SECURITY DEFINER SET search_path = public;

-- 9. Seed 6 rooms in Vietnamese
INSERT INTO rooms (name, slug, room_type, description, price_per_night, capacity, bed_type, area, image_url, amenities, status) VALUES
(
    'Phòng Deluxe Hướng Phố',
    'deluxe-huong-pho',
    'Deluxe',
    'Phòng Deluxe Hướng Phố mang lại trải nghiệm nghỉ dưỡng hiện đại giữa lòng thành phố náo nhiệt. Căn phòng được trang bị đầy đủ tiện nghi sang trọng cùng hệ thống cửa kính lớn nhìn ra thành phố lung linh ánh đèn.',
    1200000,
    2,
    '1 Giường Đôi Cỡ Lớn (King)',
    28,
    '/images/rooms/deluxe-city.jpg',
    '["Wifi miễn phí", "Điều hòa", "Tivi thông minh", "Mini bar", "Máy sấy tóc", "Két an toàn", "Bàn làm việc"]'::jsonb,
    'available'
),
(
    'Phòng Deluxe Hướng Vườn',
    'deluxe-huong-vuon',
    'Deluxe',
    'Yên bình và gần gũi với thiên nhiên, phòng Deluxe Hướng Vườn mang đến không gian thư giãn tuyệt đối với tầm nhìn rộng mở ra khu vườn nhiệt đới xanh mát của khách sạn.',
    1350000,
    2,
    '1 Giường Đôi hoặc 2 Giường Đơn',
    32,
    '/images/rooms/deluxe-garden.jpg',
    '["Wifi miễn phí", "Điều hòa", "Ban công", "Trà & Cà phê", "Tivi thông minh", "Mini bar", "Két an toàn"]'::jsonb,
    'available'
),
(
    'Phòng Executive',
    'executive',
    'Executive',
    'Thiết kế tinh tế dành riêng cho doanh nhân hoặc các cặp đôi yêu thích không gian rộng rãi. Phòng Executive có khu vực làm việc chuyên nghiệp riêng biệt và dịch vụ phòng cao cấp.',
    1800000,
    2,
    '1 Giường Đôi Cực Lớn (Super King)',
    40,
    '/images/rooms/executive.jpg',
    '["Wifi tốc độ cao", "Điều hòa", "Máy pha cà phê", "Bồn tắm nằm", "Trái cây chào mừng", "Dịch vụ giặt là miễn phí (2 món)", "Bàn làm việc rộng"]'::jsonb,
    'available'
),
(
    'Phòng Family',
    'family',
    'Family',
    'Không gian lý tưởng cho cả gia đình nghỉ ngơi thoải mái. Phòng Family được trang bị 2 giường đôi cỡ lớn, khu vực sinh hoạt chung ấm cúng cùng nhiều tiện ích thân thiện cho trẻ nhỏ.',
    2200000,
    4,
    '2 Giường Đôi Cỡ Lớn (King)',
    50,
    '/images/rooms/family.jpg',
    '["Wifi miễn phí", "Điều hòa", "Sofa giường", "Lò vi sóng", "Tivi thông minh lớn", "Mini bar", "Trà & Cà phê", "Đồ chơi cho bé"]'::jsonb,
    'available'
),
(
    'Junior Suite',
    'junior-suite',
    'Suite',
    'Là sự kết hợp hoàn hảo giữa sang trọng và tiện nghi. Junior Suite sở hữu phòng khách độc lập, phòng ngủ riêng tư cùng phòng tắm lát đá marble cao cấp có bồn jacuzzi thư giãn.',
    2800000,
    3,
    '1 Giường Đôi Cực Lớn + 1 Sofa Bed',
    60,
    '/images/rooms/junior-suite.jpg',
    '["Wifi miễn phí", "Điều hòa", "Phòng khách riêng", "Bồn jacuzzi", "Loa Bluetooth", "Dịch vụ quản gia", "Quầy bar mini"]'::jsonb,
    'available'
),
(
    'Presidential Suite',
    'presidential-suite',
    'Suite',
    'Biểu tượng của sự xa hoa và đẳng cấp bậc nhất. Căn hộ tổng thống Presidential Suite sở hữu diện tích siêu rộng với phòng khách lớn, phòng ăn sang trọng, quầy bar riêng và tầm nhìn bao quát toàn bộ thành phố.',
    7500000,
    4,
    '2 Giường Đôi Cực Lớn (Super King)',
    120,
    '/images/rooms/presidential-suite.jpg',
    '["Wifi siêu tốc", "Điều hòa trung tâm", "Phòng khách lớn", "Phòng ăn & Bếp phụ", "Quầy bar riêng", "Phòng xông hơi", "Hồ bơi mini riêng", "Dịch vụ quản gia 24/7"]'::jsonb,
    'available'
);
