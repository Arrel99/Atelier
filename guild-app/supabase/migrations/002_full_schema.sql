-- 002_full_schema.sql
-- Creative Freelance Hub - Full Schema Extension

-- ============================================
-- NEW TABLES
-- ============================================

-- Waitlist for slot overflow
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_config_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id),
  position INT NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'confirmed', 'expired', 'cancelled')),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counter offers
CREATE TABLE IF NOT EXISTS public.counter_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  proposed_price DECIMAL(12,2),
  proposed_deadline DATE,
  scope_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revisions ledger
CREATE TABLE IF NOT EXISTS public.revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  feedback TEXT NOT NULL,
  reference_urls JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Payments (Midtrans escrow)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('downpayment', 'settlement', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'released', 'refunded', 'failed')),
  midtrans_order_id TEXT UNIQUE,
  midtrans_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  filed_by UUID NOT NULL REFERENCES public.users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_creator', 'resolved_client', 'cancelled')),
  mediator_id UUID REFERENCES public.users(id),
  mediator_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (in-app)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  order_id UUID REFERENCES public.orders(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment windows (feedback scheduling)
CREATE TABLE IF NOT EXISTS public.comment_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Comments within windows
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  window_id UUID NOT NULL REFERENCES public.comment_windows(id),
  author_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reputation badges
CREATE TABLE IF NOT EXISTS public.reputation_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Pro subscriptions
CREATE TABLE IF NOT EXISTS public.pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  midtrans_subscription_id TEXT,
  midtrans_order_id TEXT UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Slot boosts (featured listings)
CREATE TABLE IF NOT EXISTS public.slot_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Studios (multi-creator)
CREATE TABLE IF NOT EXISTS public.studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Studio members
CREATE TABLE IF NOT EXISTS public.studio_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES public.studios(id),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(studio_id, creator_id)
);

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Add columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ;

-- Add columns to creator_profiles
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS probation_orders_done INT DEFAULT 0;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS tracker_stages JSONB DEFAULT '["Antrean","Sketsa","Revisi","Final"]';
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS max_revisions INT DEFAULT 2;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS min_brief_score INT DEFAULT 70;
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS total_completed INT DEFAULT 0;

-- Add columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS slot_config_id UUID REFERENCES public.slots(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS agreed_price DECIMAL(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('full', 'milestone'));

-- Update orders status check
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'BRIEF_PENDING', 'PENDING_APPROVAL', 'COUNTER_OFFER',
  'PAYMENT_PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED',
  'FINAL_REVIEW', 'APPROVED', 'COMPLETED',
  'DECLINED', 'CANCELLED', 'DISPUTE'
));

-- Add columns to deliverables
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('draft', 'revision', 'final'));
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS original_url TEXT;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS watermarked_url TEXT;
ALTER TABLE public.deliverables ADD COLUMN IF NOT EXISTS public_id TEXT;

-- ============================================
-- NEW TRIGGERS
-- ============================================

-- Auto-notify waitlist on cancel
CREATE OR REPLACE FUNCTION notify_waitlist_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  next_in_line RECORD;
BEGIN
  IF NEW.status IN ('CANCELLED', 'DECLINED') AND OLD.status NOT IN ('CANCELLED', 'DECLINED') THEN
    SELECT * INTO next_in_line FROM waitlist
    WHERE slot_config_id = NEW.slot_config_id AND status = 'waiting'
    ORDER BY position ASC LIMIT 1;
    IF FOUND THEN
      UPDATE waitlist SET status = 'notified', notified_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'
      WHERE id = next_in_line.id;
      INSERT INTO notifications(user_id, type, title, body)
      VALUES(next_in_line.client_id, 'waitlist_available', 'Slot Tersedia!', 'Slot yang kamu tunggu kini tersedia. Konfirmasi dalam 24 jam.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_waitlist ON public.orders;
CREATE TRIGGER trg_notify_waitlist
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION notify_waitlist_on_cancel();

-- Auto-release payment on approve
CREATE OR REPLACE FUNCTION release_payment_on_approve()
RETURNS TRIGGER AS $$
DECLARE
  creator_is_pro BOOLEAN;
  commission_rate DECIMAL;
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status = 'FINAL_REVIEW' THEN
    SELECT EXISTS(
      SELECT 1 FROM pro_subscriptions
      WHERE creator_id = NEW.creator_id AND status = 'active' AND expires_at > NOW()
    ) INTO creator_is_pro;
    commission_rate := CASE WHEN creator_is_pro THEN 0.08 ELSE 0.12 END;
    UPDATE payments SET
      status = 'released',
      released_at = NOW(),
      net_amount = amount * (1 - commission_rate),
      commission_amount = amount * commission_rate
    WHERE order_id = NEW.id AND status = 'paid';
    UPDATE orders SET status = 'COMPLETED' WHERE id = NEW.id;
    INSERT INTO notifications(user_id, order_id, type, title, body)
    SELECT cp.user_id, NEW.id, 'payment_released', 'Dana Dicairkan!', 'Pembayaran telah masuk ke dompet digitalmu.'
    FROM creator_profiles cp WHERE cp.id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_release_on_approve ON public.orders;
CREATE TRIGGER trg_release_on_approve
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION release_payment_on_approve();

-- ============================================
-- ROW LEVEL SECURITY (additional)
-- ============================================

-- Waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='waitlist' AND policyname='Users can view own waitlist') THEN CREATE POLICY "Users can view own waitlist" ON public.waitlist FOR SELECT USING (auth.uid() = client_id); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='waitlist' AND policyname='Users can join waitlist') THEN CREATE POLICY "Users can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (auth.uid() = client_id); END IF; END;$$;

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Users can view payments of their orders') THEN CREATE POLICY "Users can view payments of their orders" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND (orders.client_id = auth.uid() OR EXISTS (SELECT 1 FROM public.creator_profiles WHERE id = orders.creator_id AND user_id = auth.uid())))); END IF; END;$$;

-- Disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disputes' AND policyname='Users can view disputes of their orders') THEN CREATE POLICY "Users can view disputes of their orders" ON public.disputes FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = disputes.order_id AND (orders.client_id = auth.uid() OR EXISTS (SELECT 1 FROM public.creator_profiles WHERE id = orders.creator_id AND user_id = auth.uid())))); END IF; END;$$;

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can view own notifications') THEN CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can update own notifications') THEN CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id); END IF; END;$$;

-- Comment windows
ALTER TABLE public.comment_windows ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comment_windows' AND policyname='Users can view comment windows of their orders') THEN CREATE POLICY "Users can view comment windows of their orders" ON public.comment_windows FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = comment_windows.order_id AND (orders.client_id = auth.uid() OR EXISTS (SELECT 1 FROM public.creator_profiles WHERE id = orders.creator_id AND user_id = auth.uid())))); END IF; END;$$;

-- Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Users can view comments of their orders') THEN CREATE POLICY "Users can view comments of their orders" ON public.comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = comments.order_id AND (orders.client_id = auth.uid() OR EXISTS (SELECT 1 FROM public.creator_profiles WHERE id = orders.creator_id AND user_id = auth.uid())))); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Users can comment when window active') THEN CREATE POLICY "Users can comment when window active" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id); END IF; END;$$;

-- Reputation badges
ALTER TABLE public.reputation_badges ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reputation_badges' AND policyname='Anyone can view badges') THEN CREATE POLICY "Anyone can view badges" ON public.reputation_badges FOR SELECT USING (TRUE); END IF; END;$$;

-- Studios
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='studios' AND policyname='Anyone can view studios') THEN CREATE POLICY "Anyone can view studios" ON public.studios FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='studios' AND policyname='Users can create studios') THEN CREATE POLICY "Users can create studios" ON public.studios FOR INSERT WITH CHECK (auth.uid() = owner_id); END IF; END;$$;

-- Studio members
ALTER TABLE public.studio_members ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='studio_members' AND policyname='Anyone can view studio members') THEN CREATE POLICY "Anyone can view studio members" ON public.studio_members FOR SELECT USING (TRUE); END IF; END;$$;

-- Pro subscriptions
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='pro_subscriptions' AND policyname='Creators can view own subscriptions') THEN CREATE POLICY "Creators can view own subscriptions" ON public.pro_subscriptions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM creator_profiles WHERE id = pro_subscriptions.creator_id)); END IF; END;$$;
