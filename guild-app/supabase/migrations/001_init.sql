-- 001_init.sql
-- Complete schema for Atelier

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- 1. Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('creator', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Creator Profiles
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL UNIQUE,
  bio TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  max_slots INTEGER NOT NULL DEFAULT 3,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  on_time_rate DECIMAL(5,2) DEFAULT 0,
  repeat_client_rate DECIMAL(5,2) DEFAULT 0,
  brief_accuracy_score DECIMAL(5,2) DEFAULT 0,
  probation_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Slots
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'regular' CHECK (tier IN ('regular', 'rush', 'waitlist')),
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  client_id UUID NOT NULL REFERENCES public.users(id),
  slot_id UUID REFERENCES public.slots(id),
  status TEXT NOT NULL DEFAULT 'BRIEF_PENDING' CHECK (status IN (
    'BRIEF_PENDING', 'PENDING_APPROVAL', 'COUNTER_OFFER',
    'IN_PROGRESS', 'FINAL_REVIEW', 'APPROVED',
    'DECLINED', 'DISPUTED', 'CANCELLED'
  )),
  tracker_stages TEXT[] NOT NULL DEFAULT ARRAY['Antrean', 'Sketsa', 'Coloring', 'Revisi', 'Final', 'Selesai'],
  current_stage_index INTEGER NOT NULL DEFAULT 0,
  revision_count INTEGER NOT NULL DEFAULT 0,
  max_revisions INTEGER NOT NULL DEFAULT 2,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  down_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
  down_payment_released BOOLEAN NOT NULL DEFAULT FALSE,
  creator_notes TEXT DEFAULT '',
  client_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Briefs
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  completeness_score INTEGER NOT NULL DEFAULT 0,
  fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Deliverables
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  is_watermarked BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order History (Audit Trail)
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRIGGER: Auto-create user row on auth signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-create creator_profile when role = creator
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'creator' THEN
    INSERT INTO public.creator_profiles (user_id, display_name, category)
    VALUES (
      NEW.id,
      COALESCE(NEW.full_name, 'creator-' || substr(NEW.id::text, 1, 8)),
      ''
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_creator_profile ON public.users;
CREATE TRIGGER on_user_created_creator_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_creator();

-- ============================================
-- TRIGGER: Log order status changes
-- ============================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_history (order_id, from_status, to_status, notes, created_by)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
      NEW.client_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own data') THEN
    CREATE POLICY "Users can view own data"
      ON public.users FOR SELECT
      USING (auth.uid() = id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END;
$$;

-- Creator profiles
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'creator_profiles' AND policyname = 'Anyone can view creator profiles') THEN
    CREATE POLICY "Anyone can view creator profiles"
      ON public.creator_profiles FOR SELECT
      USING (TRUE);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'creator_profiles' AND policyname = 'Creators can update own profile') THEN
    CREATE POLICY "Creators can update own profile"
      ON public.creator_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END;
$$;

-- Slots
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'slots' AND policyname = 'Anyone can view available slots') THEN
    CREATE POLICY "Anyone can view available slots"
      ON public.slots FOR SELECT
      USING (TRUE);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'slots' AND policyname = 'Creators can manage own slots') THEN
    CREATE POLICY "Creators can manage own slots"
      ON public.slots FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.creator_profiles
          WHERE id = slots.creator_id AND user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients can view own orders') THEN
    CREATE POLICY "Clients can view own orders"
      ON public.orders FOR SELECT
      USING (auth.uid() = client_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Creators can view assigned orders') THEN
    CREATE POLICY "Creators can view assigned orders"
      ON public.orders FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.creator_profiles
          WHERE id = orders.creator_id AND user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients can create orders') THEN
    CREATE POLICY "Clients can create orders"
      ON public.orders FOR INSERT
      WITH CHECK (auth.uid() = client_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients can update own orders') THEN
    CREATE POLICY "Clients can update own orders"
      ON public.orders FOR UPDATE
      USING (auth.uid() = client_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Creators can update assigned orders') THEN
    CREATE POLICY "Creators can update assigned orders"
      ON public.orders FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.creator_profiles
          WHERE id = orders.creator_id AND user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- Briefs
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'briefs' AND policyname = 'Users can view briefs of their orders') THEN
    CREATE POLICY "Users can view briefs of their orders"
      ON public.briefs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = briefs.order_id
          AND (orders.client_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creator_profiles
              WHERE creator_profiles.id = orders.creator_id AND creator_profiles.user_id = auth.uid()
            ))
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'briefs' AND policyname = 'Clients can create briefs') THEN
    CREATE POLICY "Clients can create briefs"
      ON public.briefs FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = briefs.order_id AND orders.client_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- Deliverables
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deliverables' AND policyname = 'Users can view deliverables of their orders') THEN
    CREATE POLICY "Users can view deliverables of their orders"
      ON public.deliverables FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = deliverables.order_id
          AND (orders.client_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creator_profiles
              WHERE creator_profiles.id = orders.creator_id AND creator_profiles.user_id = auth.uid()
            ))
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deliverables' AND policyname = 'Creators can create deliverables') THEN
    CREATE POLICY "Creators can create deliverables"
      ON public.deliverables FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders
          JOIN public.creator_profiles ON creator_profiles.id = orders.creator_id
          WHERE orders.id = deliverables.order_id AND creator_profiles.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- Order history
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_history' AND policyname = 'Users can view history of their orders') THEN
    CREATE POLICY "Users can view history of their orders"
      ON public.order_history FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.orders
          WHERE orders.id = order_history.order_id
          AND (orders.client_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creator_profiles
              WHERE creator_profiles.id = orders.creator_id AND creator_profiles.user_id = auth.uid()
            ))
        )
      );
  END IF;
END;
$$;
