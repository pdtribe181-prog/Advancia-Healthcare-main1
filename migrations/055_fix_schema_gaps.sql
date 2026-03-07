-- Migration 055: Fix schema gaps (missing tables, columns, and column name mismatches)
-- This migration creates objects that earlier migrations failed to create
-- Safe to re-run (all statements are IF NOT EXISTS / IF EXISTS guarded)

-- ============================================================
-- 1. CREATE NOTIFICATION QUEUE TABLE (failed in 023 due to cron extension)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts int DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON public.notification_queue(user_id);

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_queue' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications"
    ON public.notification_queue
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 2. CREATE REFUNDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id),
  patient_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'failed', 'rejected')),
  reason text,
  processed_at timestamptz,
  processed_by uuid,
  notes text,
  stripe_refund_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_transaction ON public.refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_patient ON public.refunds(patient_id);
CREATE INDEX IF NOT EXISTS idx_refunds_provider ON public.refunds(provider_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'users_view_own_refunds') THEN
    CREATE POLICY "users_view_own_refunds"
    ON public.refunds
    FOR SELECT TO authenticated
    USING (
      patient_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = refunds.provider_id AND p.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'admins_manage_refunds') THEN
    CREATE POLICY "admins_manage_refunds"
    ON public.refunds
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- ============================================================
-- 3. ADD user_id TO api_usage_logs AND email_history
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_usage_logs' AND column_name = 'user_id') THEN
    ALTER TABLE public.api_usage_logs ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_history' AND column_name = 'user_id') THEN
    ALTER TABLE public.email_history ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Backfill api_usage_logs.user_id from api_keys
UPDATE public.api_usage_logs aul
SET user_id = ak.user_id
FROM public.api_keys ak
WHERE aul.api_key_id = ak.id AND aul.user_id IS NULL;
