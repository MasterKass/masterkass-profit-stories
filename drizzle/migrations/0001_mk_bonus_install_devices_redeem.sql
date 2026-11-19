CREATE TABLE public.mk_evotor_accounts (
  evotor_user_id text PRIMARY KEY,
  installed boolean NOT NULL DEFAULT true,
  api_token text,
  installed_at timestamptz,
  removed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.mk_evotor_accounts TO service_role;
ALTER TABLE public.mk_evotor_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.mk_devices (
  device_id text PRIMARY KEY,
  evotor_user_id text,
  name text,
  store_id text,
  serial_number text,
  model text,
  raw jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.mk_devices TO service_role;
ALTER TABLE public.mk_devices ENABLE ROW LEVEL SECURITY;
CREATE INDEX mk_devices_user_idx ON public.mk_devices(evotor_user_id);

CREATE OR REPLACE FUNCTION public.mk_redeem_bonus(
  p_request_id text, p_guest_key text, p_points integer, p_amount numeric,
  p_evotor_user_id text, p_store_id text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_balance integer;
BEGIN
  IF p_points <= 0 THEN RAISE EXCEPTION 'bad points'; END IF;
  SELECT balance INTO v_balance FROM mk_guests WHERE guest_key = p_guest_key FOR UPDATE;
  IF v_balance IS NULL THEN RAISE EXCEPTION 'guest not found'; END IF;
  IF EXISTS (SELECT 1 FROM mk_bonus_ops WHERE receipt_id = p_request_id) THEN RETURN v_balance; END IF;
  IF v_balance < p_points THEN RAISE EXCEPTION 'not enough points'; END IF;
  INSERT INTO mk_bonus_ops(receipt_id, guest_key, points, amount, evotor_user_id, store_id, receipt_at)
  VALUES (p_request_id, p_guest_key, -p_points, p_amount, p_evotor_user_id, p_store_id, now());
  UPDATE mk_guests SET balance = balance - p_points, updated_at = now() WHERE guest_key = p_guest_key
  RETURNING balance INTO v_balance;
  RETURN v_balance;
END $$;
REVOKE ALL ON FUNCTION public.mk_redeem_bonus(text,text,integer,numeric,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mk_redeem_bonus(text,text,integer,numeric,text,text) TO service_role;