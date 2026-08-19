-- ==============================================================================
-- SMARTPARK PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'mall_admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. MALLS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.malls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. MALL ADMINS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mall_admins (
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (mall_id, user_id)
);

-- ── 4. VEHICLES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reg_number TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'sedan' CHECK (vehicle_type IN ('sedan', 'suv', 'hatchback', 'coupe', 'ev', 'bike', 'other')),
    nickname TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reg_number)
);

-- ── 5. PARKING FLOORS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parking_floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "B2", "B1", "G", "B3"
    level INT NOT NULL, -- e.g. -2, -1, 0, -3
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mall_id, name)
);

-- ── 6. PARKING ZONES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parking_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID REFERENCES public.parking_floors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "Zone A", "Zone B"
    color_hex TEXT DEFAULT '#146BFF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(floor_id, name)
);

-- ── 7. PARKING PILLARS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parking_pillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES public.parking_zones(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "Pillar 18", "P-A18"
    position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. PARKING SLOTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID REFERENCES public.parking_floors(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.parking_zones(id) ON DELETE CASCADE NOT NULL,
    pillar_id UUID REFERENCES public.parking_pillars(id) ON DELETE SET NULL,
    slot_number TEXT NOT NULL, -- e.g. "Slot A-18"
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
    position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_z DOUBLE PRECISION NOT NULL DEFAULT 0,
    rotation_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(floor_id, slot_number)
);

-- ── 9. PARKING SESSIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parking_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT NOT NULL,
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE RESTRICT NOT NULL,
    entry_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    exit_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    pricing_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    final_amount NUMERIC(10, 2) DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. REWARDS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_hours')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) DEFAULT 0.00,
    code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reward_id)
);

-- ── 11. EXIT PASSES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exit_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.parking_sessions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pass_token TEXT UNIQUE NOT NULL,
    qr_payload TEXT NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. CAMERA INTEGRATION / ANPR ENTRIES & EXITS ───────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicle_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE NOT NULL,
    camera_id TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    image_url TEXT,
    entry_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    matched_session_id UUID REFERENCES public.parking_sessions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.vehicle_exits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mall_id UUID REFERENCES public.malls(id) ON DELETE CASCADE NOT NULL,
    camera_id TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    exit_pass_id UUID REFERENCES public.exit_passes(id) ON DELETE SET NULL,
    exit_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_authorized BOOLEAN DEFAULT FALSE
);

-- ── 13. INDOOR NAVIGATION GRAPH ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.navigation_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID REFERENCES public.parking_floors(id) ON DELETE CASCADE NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('entrance', 'elevator', 'stairs', 'walkway', 'slot', 'pillar')),
    name TEXT NOT NULL,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    pos_z DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.navigation_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_node_id UUID REFERENCES public.navigation_nodes(id) ON DELETE CASCADE NOT NULL,
    to_node_id UUID REFERENCES public.navigation_nodes(id) ON DELETE CASCADE NOT NULL,
    distance_meters DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 14. ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.malls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Public read for malls, floors, zones, slots, active rewards
CREATE POLICY "Public malls read" ON public.malls FOR SELECT USING (true);
CREATE POLICY "Public floors read" ON public.parking_floors FOR SELECT USING (true);
CREATE POLICY "Public zones read" ON public.parking_zones FOR SELECT USING (true);
CREATE POLICY "Public slots read" ON public.parking_slots FOR SELECT USING (true);
CREATE POLICY "Public rewards read" ON public.rewards FOR SELECT USING (is_active = true);

-- User scoped policies
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own sessions" ON public.parking_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own rewards" ON public.user_rewards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own exit passes" ON public.exit_passes FOR SELECT USING (auth.uid() = user_id);

-- ── 15. TRANSACTIONAL PARKING CONFIRMATION FUNCTION ─────────────────────────
-- Guarantees atomic slot booking and prevents double-booking race conditions
CREATE OR REPLACE FUNCTION public.confirm_parking_session(
    p_user_id UUID,
    p_vehicle_id UUID,
    p_mall_id UUID,
    p_slot_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slot_status TEXT;
    v_session_id UUID;
BEGIN
    -- Lock and verify slot status
    SELECT status INTO v_slot_status
    FROM public.parking_slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Parking slot not found');
    END IF;

    IF v_slot_status <> 'available' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot is no longer available');
    END IF;

    -- Check if user already has an active session
    IF EXISTS (
        SELECT 1 FROM public.parking_sessions
        WHERE user_id = p_user_id AND status = 'active'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already have an active parking session');
    END IF;

    -- Update slot to occupied
    UPDATE public.parking_slots
    SET status = 'occupied', updated_at = NOW()
    WHERE id = p_slot_id;

    -- Insert new session
    INSERT INTO public.parking_sessions (
        user_id,
        vehicle_id,
        mall_id,
        slot_id,
        entry_at,
        status
    )
    VALUES (
        p_user_id,
        p_vehicle_id,
        p_mall_id,
        p_slot_id,
        NOW(),
        'active'
    )
    RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
        'success', true,
        'session_id', v_session_id,
        'message', 'Parking session confirmed successfully'
    );
END;
$$;
