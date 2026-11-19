CREATE TABLE public.mk_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_key text NOT NULL UNIQUE,
  name text,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.mk_guests TO service_role;
ALTER TABLE public.mk_guests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.mk_bonus_ops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id text NOT NULL UNIQUE,
  guest_key text NOT NULL,
  points integer NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  evotor_user_id text,
  store_id text,
  receipt_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.mk_bonus_ops TO service_role;
ALTER TABLE public.mk_bonus_ops ENABLE ROW LEVEL SECURITY;
CREATE INDEX mk_bonus_ops_guest_idx ON public.mk_bonus_ops(guest_key, created_at DESC);

-- Атомарно и без повторов: один чек меняет баланс только один раз.
CREATE OR REPLACE FUNCTION public.mk_apply_bonus(
  p_receipt_id text, p_guest_key text, p_points integer, p_amount numeric,
  p_evotor_user_id text, p_store_id text, p_receipt_at timestamptz
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_balance integer;
BEGIN
  INSERT INTO mk_bonus_ops(receipt_id, guest_key, points, amount, evotor_user_id, store_id, receipt_at)
  VALUES (p_receipt_id, p_guest_key, p_points, p_amount, p_evotor_user_id, p_store_id, p_receipt_at)
  ON CONFLICT (receipt_id) DO NOTHING;
  IF NOT FOUND THEN
    SELECT balance INTO v_balance FROM mk_guests WHERE guest_key = p_guest_key;
    RETURN v_balance;
  END IF;
  INSERT INTO mk_guests(guest_key, balance) VALUES (p_guest_key, GREATEST(0, p_points))
  ON CONFLICT (guest_key) DO UPDATE SET balance = GREATEST(0, mk_guests.balance + p_points), updated_at = now()
  RETURNING balance INTO v_balance;
  RETURN v_balance;
END $$;
REVOKE ALL ON FUNCTION public.mk_apply_bonus(text,text,integer,numeric,text,text,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mk_apply_bonus(text,text,integer,numeric,text,text,timestamptz) TO service_role;