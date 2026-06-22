-- 004_creator_features.sql
-- Creator feature tables: forms, services, policies, settings, translations

-- ============================================
-- CUSTOM FORMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB,
  placeholder TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CUSTOM SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  delivery_time TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CUSTOM POLICIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CREATOR SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.creator_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE UNIQUE,
  tracker_stages JSONB NOT NULL DEFAULT '["Antrean","Sketsa","Revisi","Final"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRANSLATIONS (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'EN',
  target_lang TEXT NOT NULL DEFAULT 'ID',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Custom forms
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_forms' AND policyname='Anyone can view active forms') THEN CREATE POLICY "Anyone can view active forms" ON public.custom_forms FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_forms' AND policyname='Creators can manage own forms') THEN CREATE POLICY "Creators can manage own forms" ON public.custom_forms FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = custom_forms.creator_id)); END IF; END;$$;

-- Form fields
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_fields' AND policyname='Anyone can view form fields') THEN CREATE POLICY "Anyone can view form fields" ON public.form_fields FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_fields' AND policyname='Creators can manage own form fields') THEN CREATE POLICY "Creators can manage own form fields" ON public.form_fields FOR ALL USING (EXISTS (SELECT 1 FROM public.custom_forms WHERE custom_forms.id = form_fields.form_id AND custom_forms.creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()))); END IF; END;$$;

-- Custom services
ALTER TABLE public.custom_services ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_services' AND policyname='Anyone can view active services') THEN CREATE POLICY "Anyone can view active services" ON public.custom_services FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_services' AND policyname='Creators can manage own services') THEN CREATE POLICY "Creators can manage own services" ON public.custom_services FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = custom_services.creator_id)); END IF; END;$$;

-- Custom policies
ALTER TABLE public.custom_policies ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_policies' AND policyname='Anyone can view active policies') THEN CREATE POLICY "Anyone can view active policies" ON public.custom_policies FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='custom_policies' AND policyname='Creators can manage own policies') THEN CREATE POLICY "Creators can manage own policies" ON public.custom_policies FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = custom_policies.creator_id)); END IF; END;$$;

-- Creator settings
ALTER TABLE public.creator_settings ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='creator_settings' AND policyname='Anyone can view creator settings') THEN CREATE POLICY "Anyone can view creator settings" ON public.creator_settings FOR SELECT USING (TRUE); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='creator_settings' AND policyname='Creators can manage own settings') THEN CREATE POLICY "Creators can manage own settings" ON public.creator_settings FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = creator_settings.creator_id)); END IF; END;$$;

-- Translations
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='translations' AND policyname='Creators can view own translations') THEN CREATE POLICY "Creators can view own translations" ON public.translations FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = translations.creator_id)); END IF; END;$$;
DO $$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='translations' AND policyname='Creators can create translations') THEN CREATE POLICY "Creators can create translations" ON public.translations FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = translations.creator_id)); END IF; END;$$;
