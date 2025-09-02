--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'order',
    'payment',
    'system',
    'promotion'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'cancelled',
    'paid',
    'processing',
    'placed'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: refund_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refund_status AS ENUM (
    'requested',
    'approved',
    'processing',
    'completed',
    'failed',
    'canceled'
);


ALTER TYPE public.refund_status OWNER TO postgres;

--
-- Name: table_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.table_status AS ENUM (
    'available',
    'occupied',
    'reserved',
    'maintenance'
);


ALTER TYPE public.table_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'tenant_admin',
    'manager',
    'staff',
    'customer'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: add_order_status_event(uuid, uuid, text, text, uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.order_status_events
    (id, tenant_id, order_id, from_status, to_status, changed_by_staff_id, changed_at)
  values
    (gen_random_uuid(), p_tenant_id, p_order_id, p_from, p_to, p_by_staff_id, now());
end;
$$;


ALTER FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) OWNER TO postgres;

--
-- Name: analytics_revenue(text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.analytics_revenue(p_window text DEFAULT '30d'::text, p_granularity text DEFAULT 'day'::text) RETURNS TABLE(bucket_date date, revenue numeric, orders integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  d_start date;
  d_end   date := CURRENT_DATE;
BEGIN
  -- Resolve window → date range (inclusive)
  CASE lower(coalesce(p_window, '30d'))
    WHEN '7d'  THEN d_start := d_end - INTERVAL '6 days';
    WHEN '30d' THEN d_start := d_end - INTERVAL '29 days';
    WHEN '90d' THEN d_start := d_end - INTERVAL '89 days';
    WHEN 'mtd' THEN d_start := date_trunc('month', d_end)::date;
    WHEN 'qtd' THEN d_start := date_trunc('quarter', d_end)::date;
    WHEN 'ytd' THEN d_start := date_trunc('year', d_end)::date;
    ELSE            d_start := d_end - INTERVAL '29 days'; -- default 30d
  END CASE;

  RETURN QUERY
  WITH buckets AS (
    SELECT gs::date AS d
    FROM generate_series(d_start, d_end, '1 day') AS gs
  ),
  source AS (
    SELECT
      CASE lower(p_granularity)
        WHEN 'week'  THEN date_trunc('week', ad.day)::date
        WHEN 'month' THEN date_trunc('month', ad.day)::date
        ELSE              ad.day
      END AS bkt,
      ad.revenue_total,
      ad.orders_count
    FROM public.analytics_daily ad
    WHERE ad.day BETWEEN d_start AND d_end
      AND ad.tenant_id IN (
        SELECT s.tenant_id FROM public.staff s WHERE s.user_id = auth.uid()
      )
  ),
  rolled AS (
    SELECT
      CASE lower(p_granularity)
        WHEN 'week'  THEN date_trunc('week', d)::date
        WHEN 'month' THEN date_trunc('month', d)::date
        ELSE              d
      END AS bkt
    FROM buckets
    GROUP BY 1
  )
  SELECT
    r.bkt AS bucket_date,
    COALESCE(SUM(source.revenue_total), 0)::numeric AS revenue,
    COALESCE(SUM(source.orders_count),  0)::int     AS orders
  FROM rolled r
  LEFT JOIN source
    ON source.bkt = r.bkt
  GROUP BY r.bkt
  ORDER BY r.bkt;
END;
$$;


ALTER FUNCTION app.analytics_revenue(p_window text, p_granularity text) OWNER TO postgres;

--
-- Name: analytics_summary(text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.analytics_summary(p_window text DEFAULT '7d'::text) RETURNS TABLE(period text, orders integer, revenue numeric, dine_in integer, takeaway integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
  d_start date;
  d_end   date := CURRENT_DATE;
BEGIN
  -- Resolve window → date range (inclusive)
  CASE lower(coalesce(p_window, '7d'))
    WHEN '7d'  THEN d_start := d_end - INTERVAL '6 days';
    WHEN '30d' THEN d_start := d_end - INTERVAL '29 days';
    WHEN '90d' THEN d_start := d_end - INTERVAL '89 days';
    WHEN 'mtd' THEN d_start := date_trunc('month', d_end)::date;
    WHEN 'qtd' THEN d_start := date_trunc('quarter', d_end)::date;
    WHEN 'ytd' THEN d_start := date_trunc('year', d_end)::date;
    ELSE            d_start := d_end - INTERVAL '29 days';  -- default 30d
  END CASE;

  RETURN QUERY
  SELECT
    lower(coalesce(p_window,'30d'))::text AS period,
    COALESCE(SUM(ad.orders_count), 0)::int       AS orders,
    COALESCE(SUM(ad.revenue_total), 0)::numeric  AS revenue,
    COALESCE(SUM(ad.dine_in_count), 0)::int      AS dine_in,
    COALESCE(SUM(ad.takeaway_count), 0)::int     AS takeaway
  FROM public.analytics_daily ad
  WHERE ad.day BETWEEN d_start AND d_end
    AND ad.tenant_id IN (
      SELECT s.tenant_id
      FROM public.staff s
      WHERE s.user_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION app.analytics_summary(p_window text) OWNER TO postgres;

--
-- Name: avg_ticket_size(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.avg_ticket_size(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(window_label text, total_orders bigint, total_revenue numeric, avg_ticket numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve dynamic time window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.id, o.total_amount
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  )
  SELECT
    p_window AS window_label,
    COUNT(*)::bigint AS total_orders,
    COALESCE(SUM(o.total_amount), 0)::numeric AS total_revenue,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COALESCE(SUM(o.total_amount),0) / COUNT(*), 2)
    END AS avg_ticket
  FROM base_orders o;
END $$;


ALTER FUNCTION app.avg_ticket_size(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: checkout_order(uuid, text, text, uuid, integer, text, integer); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) RETURNS TABLE(order_id uuid, duplicate boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_cur_version integer;
  v_existing_id uuid;
begin
  -- Optional tenant guard if app.current_tenant_id() is available
  if p_tenant_id <> app.current_tenant_id() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Fast path: duplicate idempotency
  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
  end if;

  -- Transactional critical section (table-scoped advisory lock)
  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

  -- CAS: ensure cart_version matches and bump it
  select cart_version into v_cur_version
  from public.table_sessions
  where tenant_id = p_tenant_id and id = p_session_id
  for update;

  if not found or v_cur_version <> p_cart_version then
    raise exception 'stale_cart' using errcode = '55000';
  end if;

  update public.table_sessions
     set cart_version = cart_version + 1
   where tenant_id = p_tenant_id and id = p_session_id;

  -- One active order per table for dine-in (also enforced by partial unique index)
  if p_mode = 'table' and p_table_id is not null then
    if exists (
      select 1 from public.orders
       where tenant_id = p_tenant_id
         and table_id = p_table_id
         and status in ('pending','processing')
    ) then
      raise exception 'active_order_exists' using errcode = '55000';
    end if;
  end if;

  -- Insert order; tenant + idempotency_key unique handles duplicates
  insert into public.orders(
    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key
  ) values (
    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,
    p_mode, 'pending', p_total_cents, p_idempotency_key
  )
  returning id into v_existing_id;

  return query select v_existing_id, false;
end;
$$;


ALTER FUNCTION app.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) OWNER TO postgres;

--
-- Name: confirm_payment_and_close(uuid, uuid, uuid, numeric); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_prev text;
begin
  -- mark intent as completed
  update public.payment_intents
    set status = 'completed',
        updated_at = now()
  where id = p_intent_id
    and tenant_id = p_tenant_id
    and order_id = p_order_id;

  -- read latest order status to fill from_status
  select status into v_prev
  from public.v_orders_latest_status
  where tenant_id = p_tenant_id
    and order_id = p_order_id
  limit 1;

  -- append status event → paid
  perform app.add_order_status_event(p_tenant_id, p_order_id, coalesce(v_prev,'served'), 'paid', null);
end;
$$;


ALTER FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) OWNER TO postgres;

--
-- Name: create_intent_for_order(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text DEFAULT 'USD'::text, p_provider text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_amount   numeric;
  v_has_total_amount boolean;
  v_has_subtotal     boolean;
  v_has_tax_amount   boolean;
  v_has_oi_total     boolean;
  v_intent_id uuid;
BEGIN
  -- Probe available columns so we can compute amount robustly no matter the schema flavor.
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='total_amount'
  ) INTO v_has_total_amount;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='subtotal'
  ) INTO v_has_subtotal;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' AND column_name='tax_amount'
  ) INTO v_has_tax_amount;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='order_items' AND column_name='total_price'
  ) INTO v_has_oi_total;

  -- 1) Prefer orders.total_amount if present and non-null
  IF v_has_total_amount THEN
    SELECT o.total_amount INTO v_amount
    FROM public.orders o
    WHERE o.id = p_order_id;

    IF v_amount IS NOT NULL THEN
      v_amount := COALESCE(v_amount, 0);
    END IF;
  END IF;

  -- 2) Else, try subtotal + tax_amount if both columns exist
  IF v_amount IS NULL AND v_has_subtotal AND v_has_tax_amount THEN
    SELECT (COALESCE(o.subtotal,0) + COALESCE(o.tax_amount,0)) INTO v_amount
    FROM public.orders o
    WHERE o.id = p_order_id;
  END IF;

  -- 3) Else, fallback to SUM(order_items.total_price)
  IF v_amount IS NULL AND v_has_oi_total THEN
    SELECT COALESCE(SUM(oi.total_price),0) INTO v_amount
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id;
  END IF;

  -- 4) As a last resort, try orders.total_cents / 100 if column exists
  IF v_amount IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='total_cents'
    ) THEN
      SELECT COALESCE(o.total_cents,0)/100.0 INTO v_amount
      FROM public.orders o
      WHERE o.id = p_order_id;
    END IF;
  END IF;

  -- Safety: ensure we have a number
  v_amount := COALESCE(v_amount, 0);

  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'Computed order amount (%.2f) is not positive for order %', v_amount, p_order_id
      USING ERRCODE = '22023'; -- invalid_parameter_value
  END IF;

  -- Delegate to the canonical creator (enforces tenant/staff auth inside)
  v_intent_id := app.create_payment_intent(p_order_id, v_amount, p_currency, p_provider);

  RETURN v_intent_id;
END;
$$;


ALTER FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text, p_provider text) OWNER TO postgres;

--
-- Name: create_payment_intent(uuid, numeric, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text DEFAULT 'USD'::text, p_provider text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant_id uuid;
  v_allowed   boolean;
  v_intent_id uuid;
BEGIN
  -- Find the tenant for the order
  SELECT o.tenant_id INTO v_tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id USING ERRCODE = 'NO_DATA_FOUND';
  END IF;

  -- Check caller is staff of that tenant
  SELECT EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.user_id = auth.uid() AND s.tenant_id = v_tenant_id
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to create payment intents for this tenant' USING ERRCODE = '42501';
  END IF;

  -- Create the intent with minimal fields; status starts at 'pending'
  INSERT INTO public.payment_intents (tenant_id, order_id, amount, currency, status, provider, created_at, updated_at)
  VALUES (v_tenant_id, p_order_id, p_amount, p_currency, 'pending', p_provider, now(), now())
  RETURNING id INTO v_intent_id;

  RETURN v_intent_id;
END;
$$;


ALTER FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text) OWNER TO postgres;

--
-- Name: current_tenant_id(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.current_tenant_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select nullif(current_setting('request.jwt.claims.tenant_id', true), '')::uuid;
$$;


ALTER FUNCTION app.current_tenant_id() OWNER TO postgres;

--
-- Name: FUNCTION current_tenant_id(); Type: COMMENT; Schema: app; Owner: postgres
--

COMMENT ON FUNCTION app.current_tenant_id() IS 'Returns tenant_id::uuid from JWT claims; NULL if absent or invalid.';


--
-- Name: ensure_payment_intent(uuid, uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_id uuid;
begin
  -- try to find existing "pending/processing" intent for this order
  select id into v_id
  from public.payment_intents
  where tenant_id = p_tenant_id
    and order_id = p_order_id
    and status in ('pending','processing')
  limit 1;

  if v_id is null then
    insert into public.payment_intents (id, tenant_id, order_id, provider, status, created_at)
    values (gen_random_uuid(), p_tenant_id, p_order_id, coalesce(p_provider,'stripe'), 'pending', now())
    returning id into v_id;
  end if;

  return v_id;
end;
$$;


ALTER FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) OWNER TO postgres;

--
-- Name: handle_payment_success(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.handle_payment_success() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_order_id uuid;
BEGIN
    -- Get the linked order_id from payment_intents
    SELECT order_id INTO v_order_id
    FROM payment_intents
    WHERE id = NEW.payment_intent_id;

    -- Skip if no order attached
    IF v_order_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Insert into payments table
    INSERT INTO payments (
        id, tenant_id, order_id, amount, payment_method, status, processed_at, created_at
    )
    VALUES (
        gen_random_uuid(),
        NEW.tenant_id,
        v_order_id,
        NEW.payload ->> 'amount',
        NEW.provider,
        'completed',
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Update order status → PAID
    UPDATE orders
    SET status = 'paid'
    WHERE id = v_order_id;

    -- Log event into order_status_events
    INSERT INTO order_status_events (
        id, order_id, from_status, to_status, created_at
    )
    VALUES (
        gen_random_uuid(),
        v_order_id,
        'pending',
        'paid',
        now()
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION app.handle_payment_success() OWNER TO postgres;

--
-- Name: kds_counts(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_counts(p_tenant_id uuid) RETURNS TABLE(queued integer, preparing integer, ready integer)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  with s as (
    select v.status
    from public.v_orders_latest_status v
    where v.tenant_id = p_tenant_id
  )
  select
    count(*) filter (where app.kds_lane(status) = 'queued')    as queued,
    count(*) filter (where app.kds_lane(status) = 'preparing') as preparing,
    count(*) filter (where app.kds_lane(status) = 'ready')     as ready
  from s;
$$;


ALTER FUNCTION app.kds_counts(p_tenant_id uuid) OWNER TO postgres;

--
-- Name: kds_lane(text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_lane(status text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
  select case
    when status in ('new') then 'queued'
    when status in ('preparing') then 'preparing'
    when status in ('ready') then 'ready'
    else 'other'
  end;
$$;


ALTER FUNCTION app.kds_lane(status text) OWNER TO postgres;

--
-- Name: kds_lane_counts(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kds_lane_counts(p_tenant_id uuid) RETURNS TABLE(lane text, cnt integer)
    LANGUAGE sql STABLE
    AS $$
  SELECT lane,
         COUNT(*)::int AS cnt
  FROM public.v_orders_latest_status v
  WHERE v.tenant_id = p_tenant_id
    AND v.lane IN ('queued','preparing','ready')
  GROUP BY lane
$$;


ALTER FUNCTION app.kds_lane_counts(p_tenant_id uuid) OWNER TO postgres;

--
-- Name: kpi_summary(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text DEFAULT '7d'::text) RETURNS TABLE(orders_count integer, revenue_total numeric, dine_in_count integer, takeaway_count integer)
    LANGUAGE plpgsql STABLE
    AS $$
declare
  tz       text := 'Australia/Brisbane';
  start_ts timestamptz;
  end_ts   timestamptz := now();
begin
  -- resolve date window
  case upper(p_window)
    when '7D'  then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
    when '30D' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
    when '1M'  then start_ts := date_trunc('month', now() at time zone tz);
    when '3M'  then start_ts := (now() at time zone tz)::timestamptz - interval '3 months';
    when '12M' then start_ts := (now() at time zone tz)::timestamptz - interval '12 months';
    when 'MTD' then start_ts := date_trunc('month',  now() at time zone tz);
    when 'QTD' then start_ts := date_trunc('quarter',now() at time zone tz);
    when 'YTD' then start_ts := date_trunc('year',   now() at time zone tz);
    else
      if lower(p_window) = '7d' then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
      elsif lower(p_window) = '30d' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
      else
        raise exception 'Invalid window: %', p_window;
      end if;
  end case;

  return query
  with base_orders as (
    select o.id, o.order_type
    from orders o
    where o.tenant_id = p_tenant_id
      and o.created_at >= start_ts
      and o.created_at <= end_ts
  ),
  money as (
    select
      case
        when p.status = 'completed' then coalesce(p.amount,0)
        when p.status = 'refunded'  then -abs(coalesce(p.amount,0))
        else 0
      end as delta
    from payments p
    where p.tenant_id = p_tenant_id
      and p.created_at >= start_ts
      and p.created_at <= end_ts
  )
  select
    (select count(*)::int from base_orders)                                         as orders_count,
    (select coalesce(sum(delta),0)::numeric from money)                             as revenue_total,
    (select count(*)::int from base_orders where order_type = 'dine_in')            as dine_in_count,
    (select count(*)::int from base_orders where order_type = 'takeaway')           as takeaway_count;
end;
$$;


ALTER FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: mark_order_paid(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_paid(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT app.push_order_status(p_order_id, 'paid', p_note); $$;


ALTER FUNCTION app.mark_order_paid(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- Name: mark_order_preparing(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT app.push_order_status(p_order_id, 'preparing', p_note); $$;


ALTER FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- Name: mark_order_ready(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_ready(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT app.push_order_status(p_order_id, 'ready', p_note); $$;


ALTER FUNCTION app.mark_order_ready(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- Name: mark_order_served(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_order_served(p_order_id uuid, p_note text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT app.push_order_status(p_order_id, 'served', p_note); $$;


ALTER FUNCTION app.mark_order_served(p_order_id uuid, p_note text) OWNER TO postgres;

--
-- Name: mark_payment_intent_status(uuid, text, jsonb); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_new_status text, p_event jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  _provider text;
BEGIN
  -- Ensure the intent exists and capture its provider
  SELECT provider
    INTO _provider
  FROM public.payment_intents
  WHERE id = p_intent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment intent % not found', p_intent_id;
  END IF;

  -- Insert a payment event compatible with your table definition
  INSERT INTO public.payment_events (
    id,
    provider,
    payment_intent_id,
    event_type,
    payload,
    event_data,
    received_at,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    _provider,
    p_intent_id,
    COALESCE(p_event->>'event_type', 'status_' || p_new_status),
    COALESCE(p_event, '{}'::jsonb),   -- payload is NOT NULL in your schema
    p_event,                          -- optional extra context (nullable in schema)
    now(),
    now()
  );

  -- Update intent status (constraint on payment_intents will validate allowed values)
  UPDATE public.payment_intents
  SET status     = p_new_status,
      updated_at = now()
  WHERE id = p_intent_id;
END;
$$;


ALTER FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_new_status text, p_event jsonb) OWNER TO postgres;

--
-- Name: on_order_paid_upsert_daily(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_order_paid_upsert_daily() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
DECLARE
  _tenant_id   uuid;
  _day         date;
  _order_type  text;
  _revenue     numeric;
BEGIN
  -- Fire only on paid transition
  IF (NEW.to_status IS DISTINCT FROM 'paid') THEN
    RETURN NEW;
  END IF;

  -- Resolve tenant, day, order_type, and revenue from orders
  SELECT
    o.tenant_id,
    (COALESCE(NEW.changed_at, now()))::date AS day,
    o.order_type,
    COALESCE(o.total_amount, (o.total_cents::numeric / 100.0), 0) AS revenue
  INTO
    _tenant_id, _day, _order_type, _revenue
  FROM public.orders o
  WHERE o.id = NEW.order_id;

  IF _tenant_id IS NULL THEN
    RETURN NEW; -- no-op if order missing
  END IF;

  -- Upsert the daily rollup
  INSERT INTO public.analytics_daily (
    tenant_id, day, orders_count, revenue_total, dine_in_count, takeaway_count, updated_at
  )
  VALUES (
    _tenant_id,
    _day,
    1,
    COALESCE(_revenue, 0),
    CASE WHEN _order_type = 'dine_in'  THEN 1 ELSE 0 END,
    CASE WHEN _order_type = 'takeaway' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (tenant_id, day) DO UPDATE
  SET orders_count   = public.analytics_daily.orders_count + 1,
      revenue_total  = public.analytics_daily.revenue_total + COALESCE(EXCLUDED.revenue_total,0),
      dine_in_count  = public.analytics_daily.dine_in_count +
                        CASE WHEN _order_type = 'dine_in'  THEN 1 ELSE 0 END,
      takeaway_count = public.analytics_daily.takeaway_count +
                        CASE WHEN _order_type = 'takeaway' THEN 1 ELSE 0 END,
      updated_at     = now();

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.on_order_paid_upsert_daily() OWNER TO postgres;

--
-- Name: on_payment_intent_succeeded_mark_order_paid(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_payment_intent_succeeded_mark_order_paid() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- only act when status actually becomes 'succeeded' and we have an order
  IF NEW.status = 'succeeded' AND NEW.order_id IS NOT NULL THEN
    -- avoid duplicates: check if this order already has a 'paid' event
    IF NOT EXISTS (
      SELECT 1
      FROM public.order_status_events ose
      WHERE ose.order_id = NEW.order_id
        AND ose.to_status = 'paid'
    ) THEN
      INSERT INTO public.order_status_events (
        id,
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_at,
        updated_at,
        from_status,
        to_status,
        source,
        notes,
        created_by_user_id,
        tenant_id,
        created_at,
        changed_by_staff_id,
        changed_by_user,
        reason,
        meta
      )
      VALUES (
        gen_random_uuid(),
        NEW.order_id,
        NULL,
        'paid',                 -- legacy non-null column
        NULL,                   -- changed_by (user) unknown here
        now(),
        now(),
        NULL,                   -- from_status (optional)
        'paid',                 -- to_status (used by KDS views)
        'system',               -- system-generated
        'Payment intent succeeded',
        NULL,
        NEW.tenant_id,          -- rely on PI’s tenant_id
        now(),
        NULL,
        NULL,
        'Auto-marked paid from payment intent success',
        '{}'::jsonb
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION app.on_payment_intent_succeeded_mark_order_paid() OWNER TO postgres;

--
-- Name: on_payment_succeeded(); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.on_payment_succeeded() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.status = 'succeeded' THEN
    -- Update related order status automatically
    UPDATE public.orders
    SET status = 'paid',
        updated_at = now()
    WHERE id = NEW.order_id;

    -- Log order status transition
    INSERT INTO public.order_status_events (order_id, from_status, to_status, created_at)
    VALUES (NEW.order_id, 'pending', 'paid', now());
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION app.on_payment_succeeded() OWNER TO postgres;

--
-- Name: order_fulfillment_timeline(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text DEFAULT '7 days'::text) RETURNS TABLE(from_status text, to_status text, avg_seconds numeric, transitions bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz := now() - (p_window::interval);
  end_ts   timestamptz := now();
BEGIN
  RETURN QUERY
  WITH events AS (
    SELECT
      ose.order_id,
      ose.from_status AS from_st,
      ose.to_status   AS to_st,
      ose.changed_at
    FROM public.order_status_events ose
    WHERE ose.tenant_id = p_tenant_id
      AND ose.changed_at BETWEEN start_ts AND end_ts
      AND ose.from_status IS NOT NULL
      AND ose.to_status   IS NOT NULL
  ),
  next_event AS (
    -- For each (order_id, from_st -> to_st) find the next event that starts at that to_st
    SELECT
      e1.order_id,
      e1.from_st,
      e1.to_st,
      MIN(e2.changed_at) AS next_changed_at
    FROM events e1
    JOIN events e2
      ON e2.order_id = e1.order_id
     AND e2.changed_at > e1.changed_at
     AND e2.from_st = e1.to_st
    GROUP BY e1.order_id, e1.from_st, e1.to_st
  )
  SELECT
    ne.from_st AS from_status,
    ne.to_st   AS to_status,
    ROUND(AVG(EXTRACT(EPOCH FROM (ne.next_changed_at - e.changed_at)))::numeric, 2) AS avg_seconds,
    COUNT(*)::bigint AS transitions
  FROM events e
  JOIN next_event ne
    ON ne.order_id = e.order_id
   AND ne.from_st  = e.from_st
   AND ne.to_st    = e.to_st
  GROUP BY ne.from_st, ne.to_st
  ORDER BY ne.from_st, ne.to_st;
END;
$$;


ALTER FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_status_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    from_status text,
    to_status text,
    source text,
    notes text,
    created_by_user_id uuid,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    changed_by_staff_id uuid,
    changed_by_user uuid,
    reason text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT order_status_events_from_chk CHECK (((from_status IS NULL) OR (from_status = ANY (ARRAY['new'::text, 'preparing'::text, 'ready'::text, 'served'::text, 'paid'::text, 'cancelled'::text, 'refunded'::text])))),
    CONSTRAINT order_status_events_to_chk CHECK ((to_status = ANY (ARRAY['new'::text, 'preparing'::text, 'ready'::text, 'served'::text, 'paid'::text, 'cancelled'::text, 'refunded'::text])))
);

ALTER TABLE ONLY public.order_status_events REPLICA IDENTITY FULL;


ALTER TABLE public.order_status_events OWNER TO postgres;

--
-- Name: order_set_status(uuid, text, text, jsonb); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text DEFAULT NULL::text, p_meta jsonb DEFAULT '{}'::jsonb) RETURNS public.order_status_events
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'app'
    AS $$
DECLARE
  _tenant_id   uuid;
  _prev_status text;
  _uid         uuid := NULL;
  _allowed     text[] := ARRAY[
    'pending','confirmed','preparing','ready','served','cancelled','paid','processing','placed'
  ];
  _row         public.order_status_events;
BEGIN
  -- 1) Validate status
  IF p_to_status IS NULL OR NOT (p_to_status = ANY(_allowed)) THEN
    RAISE EXCEPTION 'Invalid to_status: %, must be one of %', p_to_status, _allowed;
  END IF;

  -- 2) Order & tenant
  SELECT o.tenant_id
    INTO _tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- 3) Latest previous status (based on your v_orders_latest_status)
  SELECT v.latest_status
    INTO _prev_status
  FROM public.v_orders_latest_status v
  WHERE v.order_id = p_order_id
  LIMIT 1;

  -- 4) Who is acting? (best-effort)
  BEGIN
    SELECT auth.uid() INTO _uid;
  EXCEPTION WHEN OTHERS THEN
    _uid := NULL;
  END;

  -- 5) Insert event (⚠ both columns set: new_status & to_status)
  INSERT INTO public.order_status_events (
    id,
    order_id,
    previous_status,
    new_status,
    changed_by,
    changed_at,
    updated_at,
    from_status,
    to_status,
    source,
    notes,
    created_by_user_id,
    tenant_id,
    created_at,
    changed_by_staff_id,
    changed_by_user,
    reason,
    meta
  )
  VALUES (
    gen_random_uuid(),
    p_order_id,
    _prev_status,              -- previous_status (nullable)
    p_to_status,               -- legacy NOT NULL column
    _uid,                      -- user (nullable)
    now(),
    now(),
    _prev_status,              -- from_status (nullable)
    p_to_status,               -- to_status (drives KDS lanes)
    'system',
    NULL,
    _uid,
    _tenant_id,
    now(),
    NULL,
    _uid,
    COALESCE(p_reason, format('Transition to %s', p_to_status)),
    COALESCE(p_meta, '{}'::jsonb)
  )
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;


ALTER FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb) OWNER TO postgres;

--
-- Name: payment_conversion_funnel(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text DEFAULT '7 days'::text) RETURNS TABLE(stage text, stage_order integer, intents bigint, amount_total numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz := now() - (p_window::interval);
  end_ts   timestamptz := now();
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT pi.status, pi.amount
    FROM public.payment_intents pi
    WHERE pi.tenant_id = p_tenant_id
      AND pi.created_at BETWEEN start_ts AND end_ts
  ),
  mapped AS (
    SELECT
      CASE
        WHEN status = 'requires_payment_method' THEN 'created'
        WHEN status = 'requires_action'         THEN 'requires_action'
        WHEN status = 'requires_confirmation'   THEN 'confirmed'
        WHEN status = 'processing'              THEN 'processing'
        WHEN status = 'succeeded'               THEN 'succeeded'
        WHEN status = 'failed'                  THEN 'failed'
        WHEN status = 'canceled'                THEN 'canceled'
        ELSE 'other'
      END AS m_stage,
      amount AS m_amount
    FROM base
  ),
  agg AS (
    SELECT
      m_stage,
      COUNT(*)::bigint               AS intents,
      COALESCE(SUM(m_amount), 0)::numeric AS amount_total
    FROM mapped
    GROUP BY m_stage
  )
  SELECT
    a.m_stage AS stage,
    CASE a.m_stage
      WHEN 'created'          THEN 1
      WHEN 'requires_action'  THEN 2
      WHEN 'confirmed'        THEN 3
      WHEN 'processing'       THEN 4
      WHEN 'succeeded'        THEN 5
      WHEN 'failed'           THEN 6
      WHEN 'canceled'         THEN 7
      ELSE 99
    END AS stage_order,
    a.intents,
    a.amount_total
  FROM agg a
  ORDER BY stage_order;
END;
$$;


ALTER FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: peak_hours_by_dow(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_by_dow(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(day_of_week smallint, orders_count bigint, revenue numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve the time window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.created_at
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  ),
  orders_by_dow AS (
    SELECT EXTRACT(ISODOW FROM created_at)::smallint AS dow, COUNT(*)::bigint AS cnt
    FROM base_orders
    GROUP BY 1
  ),
  money AS (
    -- Positive for completed, negative for refunded; ignore others
    SELECT
      EXTRACT(ISODOW FROM p.created_at)::smallint AS dow,
      SUM(
        CASE
          WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
          WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
          ELSE 0
        END
      )::numeric AS rev
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
    GROUP BY 1
  )
  SELECT
    d::smallint                                   AS day_of_week,   -- 1..7
    COALESCE(o.cnt, 0)::bigint                    AS orders_count,
    COALESCE(m.rev, 0)::numeric                   AS revenue
  FROM generate_series(1,7) AS d
  LEFT JOIN orders_by_dow o ON o.dow = d
  LEFT JOIN money          m ON m.dow = d
  ORDER BY 1;
END $$;


ALTER FUNCTION app.peak_hours_by_dow(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: peak_hours_by_hour(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_by_hour(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(hour_of_day smallint, orders_count bigint, revenue numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- Resolve window bounds
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH base_orders AS (
    SELECT o.created_at
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at >= start_ts
      AND o.created_at <= end_ts
  ),
  orders_by_hour AS (
    SELECT EXTRACT(HOUR FROM created_at)::smallint AS hr, COUNT(*)::bigint AS cnt
    FROM base_orders
    GROUP BY 1
  ),
  money AS (
    -- Positive for completed, negative for refunded; ignore others
    SELECT
      EXTRACT(HOUR FROM p.created_at)::smallint AS hr,
      SUM(
        CASE
          WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
          WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
          ELSE 0
        END
      )::numeric AS rev
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
    GROUP BY 1
  )
  SELECT
    h::smallint                                     AS hour_of_day,
    COALESCE(o.cnt, 0)::bigint                      AS orders_count,
    COALESCE(m.rev, 0)::numeric                     AS revenue
  FROM generate_series(0,23) AS h
  LEFT JOIN orders_by_hour o ON o.hr = h
  LEFT JOIN money          m ON m.hr = h
  ORDER BY 1;
END $$;


ALTER FUNCTION app.peak_hours_by_hour(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: peak_hours_heatmap(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text DEFAULT '7d'::text) RETURNS TABLE(weekday integer, hour24 integer, orders_count bigint, revenue_total numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
  win text := lower(coalesce(p_window,'7d'));
BEGIN
  -- map window → start timestamp (no casts in text)
  IF     win = '7d'  THEN start_ts := now() - interval '7 days';
  ELSIF  win = '30d' THEN start_ts := now() - interval '30 days';
  ELSIF  win = '90d' THEN start_ts := now() - interval '90 days';
  ELSIF  win = 'mtd' THEN start_ts := date_trunc('month',   now());
  ELSIF  win = 'qtd' THEN start_ts := date_trunc('quarter', now());
  ELSIF  win = 'ytd' THEN start_ts := date_trunc('year',    now());
  ELSE                   start_ts := now() - interval '7 days';
  END IF;

  RETURN QUERY
  WITH o AS (
    SELECT
      EXTRACT(dow  FROM o.created_at)::int AS o_dow,
      EXTRACT(hour FROM o.created_at)::int AS o_hour
    FROM public.orders o
    WHERE o.tenant_id = p_tenant_id
      AND o.created_at BETWEEN start_ts AND end_ts
  ),
  p AS (
    SELECT
      EXTRACT(dow  FROM p.created_at)::int AS p_dow,
      EXTRACT(hour FROM p.created_at)::int AS p_hour,
      CASE
        WHEN p.status = 'completed' THEN COALESCE(p.amount,0)
        WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount,0))
        ELSE 0
      END AS delta
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at BETWEEN start_ts AND end_ts
  ),
  oo AS (
    SELECT o_dow, o_hour, COUNT(*) AS cnt
    FROM o
    GROUP BY 1,2
  ),
  pp AS (
    SELECT p_dow, p_hour, SUM(delta)::numeric AS rev
    FROM p
    GROUP BY 1,2
  )
  SELECT
    COALESCE(oo.o_dow,  pp.p_dow)   AS weekday,
    COALESCE(oo.o_hour, pp.p_hour)  AS hour24,
    COALESCE(oo.cnt, 0)::bigint     AS orders_count,
    COALESCE(pp.rev, 0)::numeric    AS revenue_total
  FROM oo
  FULL OUTER JOIN pp
    ON oo.o_dow  = pp.p_dow
   AND oo.o_hour = pp.p_hour
  ORDER BY 1,2;
END;
$$;


ALTER FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: push_order_status(uuid, text, text, uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text DEFAULT NULL::text, p_by_user uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_tenant_id uuid;
  v_user_id   uuid;
BEGIN
  -- Fetch the order's tenant
  SELECT o.tenant_id INTO v_tenant_id
  FROM public.orders o
  WHERE o.id = p_order_id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN FALSE; -- no such order
  END IF;

  -- Resolve user id (prefer explicit, else auth.uid(), else NULL)
  v_user_id := COALESCE(p_by_user, NULLIF(auth.uid()::text,'' )::uuid);

  -- Write status event
  INSERT INTO public.order_status_events (tenant_id, order_id, status, note, created_by_user_id, created_at)
  VALUES (v_tenant_id, p_order_id, p_status, p_note, v_user_id, NOW());

  -- Update the order row
  UPDATE public.orders
  SET status = p_status,
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid) OWNER TO postgres;

--
-- Name: revenue_by_method(uuid, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text DEFAULT '30d'::text) RETURNS TABLE(method text, payments_count bigint, net_amount numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
  start_ts timestamptz;
  end_ts   timestamptz := now();
BEGIN
  -- resolve window
  CASE lower(coalesce(p_window,'30d'))
    WHEN '7d'  THEN start_ts := now() - interval '7 days';
    WHEN '30d' THEN start_ts := now() - interval '30 days';
    WHEN '90d' THEN start_ts := now() - interval '90 days';
    WHEN 'mtd' THEN start_ts := date_trunc('month', now());
    WHEN 'qtd' THEN start_ts := date_trunc('quarter', now());
    WHEN 'ytd' THEN start_ts := date_trunc('year', now());
    WHEN 'all' THEN start_ts := '-infinity'::timestamptz;
    ELSE           start_ts := now() - interval '30 days';
  END CASE;

  RETURN QUERY
  WITH money AS (
    SELECT
      p.payment_method AS method,
      CASE
        WHEN p.status = 'completed' THEN COALESCE(p.amount, 0)
        WHEN p.status = 'refunded'  THEN -ABS(COALESCE(p.amount, 0))
        ELSE 0
      END AS delta
    FROM public.payments p
    WHERE p.tenant_id = p_tenant_id
      AND p.created_at >= start_ts
      AND p.created_at <= end_ts
  )
  SELECT
    m.method,
    COUNT(*) FILTER (WHERE m.delta <> 0)::bigint AS payments_count,
    COALESCE(SUM(m.delta),0)::numeric            AS net_amount
  FROM money m
  GROUP BY m.method
  ORDER BY net_amount DESC NULLS LAST, method NULLS LAST;
END $$;


ALTER FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text) OWNER TO postgres;

--
-- Name: revenue_series(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_series(p_tenant_id uuid, p_window text DEFAULT '7d'::text, p_granularity text DEFAULT 'day'::text) RETURNS TABLE(bucket_date date, total numeric)
    LANGUAGE plpgsql STABLE
    AS $$
declare
  tz            text := 'Australia/Brisbane';
  start_ts      timestamptz;
  end_ts        timestamptz := now();
  bucket_trunc  text;
begin
  -- validate granularity
  if p_granularity not in ('day','week','month') then
    raise exception 'Invalid granularity: %', p_granularity;
  end if;

  -- resolve window -> start_ts (in tenant/UI timezone)
  case upper(p_window)
    when '7D'  then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
    when '30D' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
    when '1M'  then start_ts := date_trunc('month', now() at time zone tz);
    when '3M'  then start_ts := (now() at time zone tz)::timestamptz - interval '3 months';
    when '12M' then start_ts := (now() at time zone tz)::timestamptz - interval '12 months';
    when 'MTD' then start_ts := date_trunc('month', now() at time zone tz);
    when 'QTD' then start_ts := date_trunc('quarter', now() at time zone tz);
    when 'YTD' then start_ts := date_trunc('year', now() at time zone tz);
    else
      if lower(p_window) = '7d' then start_ts := (now() at time zone tz)::timestamptz - interval '7 days';
      elsif lower(p_window) = '30d' then start_ts := (now() at time zone tz)::timestamptz - interval '30 days';
      else
        raise exception 'Invalid window: %', p_window;
      end if;
  end case;

  -- pick date_trunc unit
  bucket_trunc := case p_granularity
                    when 'day'   then 'day'
                    when 'week'  then 'week'
                    when 'month' then 'month'
                  end;

  return query
  with buckets as (
    select generate_series(
             date_trunc(bucket_trunc, start_ts at time zone tz),
             date_trunc(bucket_trunc, end_ts   at time zone tz),
             case p_granularity when 'day' then interval '1 day'
                                when 'week' then interval '1 week'
                                when 'month' then interval '1 month' end
           )::date as bucket_date
  ),
  money as (
    select
      date_trunc(bucket_trunc, p.created_at at time zone tz)::date as bucket_date,
      case
        when p.status = 'completed' then coalesce(p.amount,0)
        when p.status = 'refunded'  then -abs(coalesce(p.amount,0))
        else 0
      end as delta
    from payments p
    where p.tenant_id = p_tenant_id
      and p.created_at >= start_ts
      and p.created_at <= end_ts
  )
  select b.bucket_date,
         coalesce(sum(m.delta),0)::numeric as total
  from buckets b
  left join money m on m.bucket_date = b.bucket_date
  group by 1
  order by 1;
end;
$$;


ALTER FUNCTION app.revenue_series(p_tenant_id uuid, p_window text, p_granularity text) OWNER TO postgres;

--
-- Name: revenue_timeseries(uuid, text, text); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) RETURNS TABLE(bucket timestamp with time zone, revenue_total numeric, orders_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH binned AS (
    SELECT
      date_trunc(p_granularity, created_at) AS bucket,
      COALESCE(SUM(total_amount),0)::numeric AS revenue_total,
      COUNT(*)::bigint AS orders_count
    FROM public.orders
    WHERE tenant_id = p_tenant_id
      AND created_at >= (NOW() - (p_window || ' days')::interval)
    GROUP BY bucket
  )
  SELECT * FROM binned ORDER BY bucket;
END;
$$;


ALTER FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) OWNER TO postgres;

--
-- Name: set_default_payment_provider(uuid); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.set_default_payment_provider(p_provider_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_tenant_id uuid;
  v_allowed boolean;
BEGIN
  -- 1) Load provider and its tenant
  SELECT tenant_id INTO v_tenant_id
  FROM public.payment_providers
  WHERE id = p_provider_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Provider % not found', p_provider_id USING ERRCODE = 'NO_DATA_FOUND';
  END IF;

  -- 2) Ensure caller is staff of that tenant
  SELECT EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.user_id = auth.uid() AND s.tenant_id = v_tenant_id
  ) INTO v_allowed;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to modify this tenant''s providers' USING ERRCODE = '42501';
  END IF;

  -- 3) Clear any current default for this tenant
  UPDATE public.payment_providers
     SET is_default = FALSE
   WHERE tenant_id = v_tenant_id
     AND is_default = TRUE;

  -- 4) Set the new default
  UPDATE public.payment_providers
     SET is_default = TRUE
   WHERE id = p_provider_id;
END;
$$;


ALTER FUNCTION app.set_default_payment_provider(p_provider_id uuid) OWNER TO postgres;

--
-- Name: top_items(uuid, text, integer); Type: FUNCTION; Schema: app; Owner: postgres
--

CREATE FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer DEFAULT 10) RETURNS TABLE(menu_item_id uuid, item_name text, qty_sold bigint)
    LANGUAGE plpgsql
    AS $$
declare
  start_ts timestamptz;
  end_ts   timestamptz := now();
begin
  -- resolve window
  case lower(coalesce(p_window,'7d'))
    when '7d'  then start_ts := now() - interval '7 days';
    when '30d' then start_ts := now() - interval '30 days';
    when '90d' then start_ts := now() - interval '90 days';
    when 'mtd' then start_ts := date_trunc('month', now());
    when 'qtd' then start_ts := date_trunc('quarter', now());
    when 'ytd' then start_ts := date_trunc('year', now());
    when 'all' then start_ts := '-infinity'::timestamptz;
    else          start_ts := now() - interval '7 days';
  end case;

  return query
  with o as (
    select id
    from public.orders
    where tenant_id = p_tenant_id
      and created_at >= start_ts
      and created_at <= end_ts
  )
  select
    oi.menu_item_id,
    coalesce(mi.name, '(unknown)') as item_name,
    sum(coalesce(oi.quantity,0))::bigint as qty_sold
  from public.order_items oi
  join o on o.id = oi.order_id
  left join public.menu_items mi on mi.id = oi.menu_item_id
  where oi.tenant_id = p_tenant_id
  group by oi.menu_item_id, mi.name
  order by qty_sold desc, item_name asc
  limit greatest(p_limit, 1);

end $$;


ALTER FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer) OWNER TO postgres;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: app_is_platform(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.app_is_platform() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$ SELECT current_setting('app.role', true) = 'platform' $$;


ALTER FUNCTION public.app_is_platform() OWNER TO postgres;

--
-- Name: app_tenant_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.app_tenant_id() RETURNS text
    LANGUAGE sql STABLE
    AS $$ SELECT current_setting('app.tenant_id', true) $$;


ALTER FUNCTION public.app_tenant_id() OWNER TO postgres;

--
-- Name: calculate_order_total(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_order_total(order_uuid uuid) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0) INTO total
  FROM order_items
  WHERE order_id = order_uuid;
  
  RETURN total;
END;
$$;


ALTER FUNCTION public.calculate_order_total(order_uuid uuid) OWNER TO postgres;

--
-- Name: can_user_see_menu_items(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_user_see_menu_items(uid uuid) RETURNS TABLE(tenant_code text, items integer)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select t.code as tenant_code, count(*)::int as items
  from public.menu_items mi
  join public.tenants t on t.id = mi.tenant_id
  where exists (
    select 1
    from public.staff s
    where s.user_id = uid
      and s.tenant_id = mi.tenant_id
  )
  group by t.code
$$;


ALTER FUNCTION public.can_user_see_menu_items(uid uuid) OWNER TO postgres;

--
-- Name: checkout_order(uuid, text, text, uuid, integer, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) RETURNS TABLE(order_id uuid, duplicate boolean)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_existing uuid;
  v_cur_cart integer;
BEGIN
  -- idempotent replay
  SELECT id INTO v_existing
  FROM orders
  WHERE tenant_id = p_tenant_id
    AND idempotency_key = p_idempotency_key;

  IF v_existing IS NOT NULL THEN
    RETURN QUERY SELECT v_existing, TRUE;
    RETURN;
  END IF;

  -- table-specific checks
  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    SELECT cart_version INTO v_cur_cart
    FROM table_sessions
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status = 'active';

    IF v_cur_cart IS NOT NULL AND p_cart_version <= v_cur_cart THEN
      RAISE EXCEPTION 'stale_cart';
    END IF;

    PERFORM 1
    FROM orders
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status IN ('pending','processing','confirmed','preparing','ready','placed')
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'active_order_exists';
    END IF;
  END IF;

  INSERT INTO orders (
    id, tenant_id, table_id, status,
    session_id, mode, total_cents, idempotency_key
  )
  VALUES (
    gen_random_uuid(), p_tenant_id, p_table_id, 'placed',
    p_session_id, p_mode, p_total_cents, p_idempotency_key
  )
  RETURNING id INTO v_existing;

  IF p_mode = 'table' AND p_table_id IS NOT NULL THEN
    UPDATE table_sessions
    SET cart_version = COALESCE(cart_version, 0) + 1
    WHERE tenant_id = p_tenant_id
      AND table_id = p_table_id
      AND status = 'active';
  END IF;

  RETURN QUERY SELECT v_existing, FALSE;
END;
$$;


ALTER FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) OWNER TO postgres;

--
-- Name: current_tenant_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_tenant_ids() RETURNS SETOF uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select tenant_id
  from public.staff
  where user_id = auth.uid()
$$;


ALTER FUNCTION public.current_tenant_ids() OWNER TO postgres;

--
-- Name: current_tenant_ids(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_tenant_ids(uid uuid DEFAULT auth.uid()) RETURNS SETOF uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select tenant_id
  from public.staff
  where user_id = uid
$$;


ALTER FUNCTION public.current_tenant_ids(uid uuid) OWNER TO postgres;

--
-- Name: generate_order_number(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number(tenant_uuid uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  order_count INTEGER;
  order_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO order_count
  FROM orders
  WHERE tenant_id = tenant_uuid
  AND DATE(created_at) = CURRENT_DATE;
  
  order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$;


ALTER FUNCTION public.generate_order_number(tenant_uuid uuid) OWNER TO postgres;

--
-- Name: kaf_apply_policies(text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kaf_apply_policies(tablename text, has_id boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  t regclass;
BEGIN
  t := to_regclass(tablename);
  IF t IS NULL THEN
    RAISE NOTICE 'Table % not found, skipping', tablename; RETURN;
  END IF;

  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);

  -- Drop old policies if present
  PERFORM 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = split_part(tablename, '.', 2)
      AND policyname IN ('p_select','p_insert','p_update','p_delete');
  IF FOUND THEN
    EXECUTE format('DROP POLICY IF EXISTS p_select ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_insert ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_update ON %s', t);
    EXECUTE format('DROP POLICY IF EXISTS p_delete ON %s', t);
  END IF;

  IF has_id THEN
    EXECUTE format(
      'CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR id::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR id::text = app_tenant_id()) WITH CHECK (app_is_platform() OR id::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform())',
      t
    );
  ELSE
    EXECUTE format(
      'CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR tenantId::text = app_tenant_id()) WITH CHECK (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
    EXECUTE format(
      'CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform() OR tenantId::text = app_tenant_id())',
      t
    );
  END IF;
END $$;


ALTER FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) OWNER TO postgres;

--
-- Name: kaf_apply_policies_col(regclass, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tab);

  -- Drop prior standard policies if present
  EXECUTE format('DROP POLICY IF EXISTS p_select ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_insert ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_update ON %s', tab);
  EXECUTE format('DROP POLICY IF EXISTS p_delete ON %s', tab);

  IF is_root THEN
    -- Root tenant table matches id to app_tenant_id(); only platform can INSERT/DELETE
    EXECUTE format('CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR id::text = app_tenant_id())', tab);
    EXECUTE format('CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform())', tab);
    EXECUTE format('CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR id::text = app_tenant_id()) WITH CHECK (app_is_platform() OR id::text = app_tenant_id())', tab);
    EXECUTE format('CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform())', tab);
  ELSE
    -- Regular tenant-scoped tables: match tenantId/tenant_id to app_tenant_id()
    EXECUTE format('CREATE POLICY p_select ON %s FOR SELECT USING (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
    EXECUTE format('CREATE POLICY p_insert ON %s FOR INSERT WITH CHECK (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
    EXECUTE format('CREATE POLICY p_update ON %s FOR UPDATE USING (app_is_platform() OR %I::text = app_tenant_id()) WITH CHECK (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col, tenant_col);
    EXECUTE format('CREATE POLICY p_delete ON %s FOR DELETE USING (app_is_platform() OR %I::text = app_tenant_id())', tab, tenant_col);
  END IF;
END $$;


ALTER FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) OWNER TO postgres;

--
-- Name: orders_fill_defaults(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.orders_fill_defaults() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.order_number is null or length(trim(new.order_number)) = 0 then
    new.order_number := 'ORD-' || substr(replace(gen_random_uuid()::text,'-',''),1,8);
  end if;

  if new.tenant_id is null and new.table_id is not null then
    select t.tenant_id into new.tenant_id
    from public.restaurant_tables t
    where t.id = new.table_id
    limit 1;
  end if;

  return new;
end $$;


ALTER FUNCTION public.orders_fill_defaults() OWNER TO postgres;

--
-- Name: protect_tenant_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.protect_tenant_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if TG_OP = 'UPDATE' and new.code <> old.code then
    raise exception 'tenant code is immutable';
  end if;
  return new;
end $$;


ALTER FUNCTION public.protect_tenant_code() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: tg_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;


ALTER FUNCTION public.tg_set_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    seats integer DEFAULT 2 NOT NULL,
    status text DEFAULT 'available'::text NOT NULL
);


ALTER TABLE public.tables OWNER TO postgres;

--
-- Name: analytics_active_tables_now; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_active_tables_now WITH (security_invoker='on') AS
 SELECT tenant_id,
    (count(*) FILTER (WHERE (status = ANY (ARRAY['occupied'::text, 'serving'::text]))))::integer AS active_tables_now
   FROM public.tables t
  GROUP BY tenant_id;


ALTER VIEW public.analytics_active_tables_now OWNER TO postgres;

--
-- Name: analytics_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_daily (
    tenant_id uuid NOT NULL,
    day date NOT NULL,
    orders_count integer DEFAULT 0 NOT NULL,
    revenue_total numeric DEFAULT 0 NOT NULL,
    dine_in_count integer DEFAULT 0 NOT NULL,
    takeaway_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.analytics_daily OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    customer_id uuid,
    table_id uuid,
    staff_id uuid,
    order_number text NOT NULL,
    order_type text DEFAULT 'dine_in'::text,
    status public.order_status DEFAULT 'pending'::public.order_status,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tip_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    special_instructions text,
    estimated_ready_time timestamp with time zone,
    ready_at timestamp with time zone,
    served_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    idempotency_key text,
    mode text DEFAULT 'takeaway'::text NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    session_id text DEFAULT ''::text NOT NULL
);

ALTER TABLE ONLY public.orders REPLICA IDENTITY FULL;

ALTER TABLE ONLY public.orders FORCE ROW LEVEL SECURITY;


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    order_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    provider_transaction_id text,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.payments REPLICA IDENTITY FULL;

ALTER TABLE ONLY public.payments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: analytics_kpi_summary_7d; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_kpi_summary_7d WITH (security_invoker='on') AS
 WITH rev AS (
         SELECT o_1.tenant_id,
                CASE
                    WHEN (p.status = 'completed'::public.payment_status) THEN COALESCE(p.amount, (0)::numeric)
                    WHEN (p.status = 'refunded'::public.payment_status) THEN (- abs(COALESCE(p.amount, (0)::numeric)))
                    ELSE (0)::numeric
                END AS delta
           FROM (public.orders o_1
             LEFT JOIN public.payments p ON (((p.order_id = o_1.id) AND (p.created_at >= (now() - '7 days'::interval)))))
          WHERE (o_1.created_at >= (now() - '7 days'::interval))
        )
 SELECT tenant_id,
    count(DISTINCT id) AS orders_7d,
    ( SELECT sum(r.delta) AS sum
           FROM rev r
          WHERE (r.tenant_id = o.tenant_id)) AS revenue_7d,
    count(*) FILTER (WHERE (order_type = 'dine_in'::text)) AS dine_in_7d,
    count(*) FILTER (WHERE (order_type = 'takeaway'::text)) AS takeaway_7d
   FROM public.orders o
  WHERE (created_at >= (now() - '7 days'::interval))
  GROUP BY tenant_id;


ALTER VIEW public.analytics_kpi_summary_7d OWNER TO postgres;

--
-- Name: analytics_revenue_7d; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_revenue_7d WITH (security_invoker='on') AS
 WITH money AS (
         SELECT p.tenant_id,
            (date_trunc('day'::text, p.created_at))::date AS d,
                CASE
                    WHEN (p.status = 'completed'::public.payment_status) THEN COALESCE(p.amount, (0)::numeric)
                    WHEN (p.status = 'refunded'::public.payment_status) THEN (- abs(COALESCE(p.amount, (0)::numeric)))
                    ELSE (0)::numeric
                END AS delta
           FROM public.payments p
          WHERE (p.created_at >= (now() - '7 days'::interval))
        )
 SELECT tenant_id,
    d,
    sum(delta) AS total
   FROM money
  GROUP BY tenant_id, d;


ALTER VIEW public.analytics_revenue_7d OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.audit_logs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    instructions text,
    added_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT '550e8400-e29b-41d4-a716-446655440000'::uuid NOT NULL,
    session_id uuid,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: cart_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid,
    session_token text NOT NULL,
    is_takeaway boolean DEFAULT false,
    expires_at timestamp with time zone DEFAULT (now() + '02:00:00'::interval),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cart_sessions OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.categories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    email text,
    phone text,
    first_name text,
    last_name text,
    date_of_birth date,
    preferences jsonb DEFAULT '{}'::jsonb,
    loyalty_points integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0,
    visit_count integer DEFAULT 0,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.customers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customization (
    tenant_id uuid NOT NULL,
    theme text DEFAULT 'default'::text,
    logo_url text,
    hero_video text,
    palette jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.customization OWNER TO postgres;

--
-- Name: daily_sales_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_sales_summary (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    date date NOT NULL,
    total_orders integer DEFAULT 0,
    total_revenue numeric(10,2) DEFAULT 0,
    total_customers integer DEFAULT 0,
    average_order_value numeric(10,2) DEFAULT 0,
    top_selling_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.daily_sales_summary FORCE ROW LEVEL SECURITY;


ALTER TABLE public.daily_sales_summary OWNER TO postgres;

--
-- Name: domain_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domain_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    aggregate_type text NOT NULL,
    aggregate_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.domain_events OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    current_stock numeric(10,3) DEFAULT 0 NOT NULL,
    minimum_stock numeric(10,3) DEFAULT 0 NOT NULL,
    maximum_stock numeric(10,3),
    cost_per_unit numeric(10,2),
    supplier_info jsonb DEFAULT '{}'::jsonb,
    last_restocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.inventory_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    timezone text DEFAULT 'Australia/Brisbane'::text NOT NULL,
    currency text DEFAULT 'AUD'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: menu_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    rank integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.menu_categories OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    category_id uuid,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    image_url text,
    images jsonb DEFAULT '[]'::jsonb,
    ingredients jsonb DEFAULT '[]'::jsonb,
    allergens jsonb DEFAULT '[]'::jsonb,
    nutritional_info jsonb DEFAULT '{}'::jsonb,
    dietary_info jsonb DEFAULT '{}'::jsonb,
    preparation_time integer,
    calories integer,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    variants jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL
);

ALTER TABLE ONLY public.menu_items FORCE ROW LEVEL SECURITY;


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.notifications FORCE ROW LEVEL SECURITY;


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid,
    menu_item_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    customizations jsonb DEFAULT '{}'::jsonb,
    special_instructions text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid NOT NULL
);

ALTER TABLE ONLY public.order_items REPLICA IDENTITY FULL;


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: payment_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider text NOT NULL,
    event_id text,
    tenant_id uuid,
    order_id uuid,
    payload jsonb NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    payment_intent_id uuid,
    event_type text,
    raw_payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    event_data jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT payment_events_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text, 'other'::text])))
);

ALTER TABLE ONLY public.payment_events REPLICA IDENTITY FULL;


ALTER TABLE public.payment_events OWNER TO postgres;

--
-- Name: payment_intents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_intents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    order_id uuid,
    provider text NOT NULL,
    provider_intent_id text,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text NOT NULL,
    client_secret_last4 text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    provider_id uuid,
    CONSTRAINT payment_intents_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT payment_intents_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text, 'other'::text]))),
    CONSTRAINT payment_intents_status_check CHECK ((status = ANY (ARRAY['requires_payment_method'::text, 'requires_confirmation'::text, 'processing'::text, 'succeeded'::text, 'canceled'::text, 'requires_action'::text, 'failed'::text])))
);

ALTER TABLE ONLY public.payment_intents REPLICA IDENTITY FULL;


ALTER TABLE public.payment_intents OWNER TO postgres;

--
-- Name: payment_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    provider text NOT NULL,
    api_key text NOT NULL,
    secret_key text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    display_name text,
    publishable_key text,
    secret_last4 text,
    is_live boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    CONSTRAINT payment_providers_provider_check CHECK ((provider = ANY (ARRAY['stripe'::text, 'razorpay'::text])))
);


ALTER TABLE public.payment_providers OWNER TO postgres;

--
-- Name: payment_refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    refund_amount numeric(10,2) NOT NULL,
    refund_reason text,
    refunded_by uuid,
    refunded_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'initiated'::text,
    tenant_id uuid,
    order_id uuid,
    amount numeric(12,2),
    reason text,
    processor_refund_id text,
    method text,
    requested_by_user_id uuid,
    processed_at timestamp with time zone,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_staff_id uuid,
    payment_intent_id uuid,
    CONSTRAINT payment_refunds_amount_chk CHECK ((amount > (0)::numeric)),
    CONSTRAINT payment_refunds_method_chk CHECK ((method = ANY (ARRAY['card'::text, 'cash'::text, 'wallet'::text, 'upi'::text]))),
    CONSTRAINT payment_refunds_status_check CHECK ((status = ANY (ARRAY['initiated'::text, 'processed'::text, 'failed'::text]))),
    CONSTRAINT payment_refunds_status_chk CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


ALTER TABLE public.payment_refunds OWNER TO postgres;

--
-- Name: payment_splits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    method text NOT NULL,
    amount numeric(10,2) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    order_id uuid NOT NULL,
    tenant_id uuid,
    payer_type text,
    staff_user_id uuid,
    note text,
    payer_user uuid,
    payer_staff_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_splits_amount_chk CHECK ((amount > (0)::numeric)),
    CONSTRAINT payment_splits_method_chk CHECK ((method = ANY (ARRAY['card'::text, 'cash'::text, 'wallet'::text, 'upi'::text]))),
    CONSTRAINT payment_splits_payer_type_chk CHECK ((payer_type = ANY (ARRAY['customer'::text, 'staff'::text])))
);


ALTER TABLE public.payment_splits OWNER TO postgres;

--
-- Name: printer_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.printer_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    printer_name text NOT NULL,
    printer_ip text,
    printer_port integer,
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.printer_configs OWNER TO postgres;

--
-- Name: qr_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid,
    scanned_by_user uuid,
    session_id text,
    device_info jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.qr_scans OWNER TO postgres;

--
-- Name: receipt_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipt_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    delivery_method text NOT NULL,
    delivery_address text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    CONSTRAINT receipt_deliveries_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['email'::text, 'sms'::text]))),
    CONSTRAINT receipt_deliveries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])))
);


ALTER TABLE public.receipt_deliveries OWNER TO postgres;

--
-- Name: restaurant_tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_tables (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    table_number text NOT NULL,
    capacity integer NOT NULL,
    location text,
    status public.table_status DEFAULT 'available'::public.table_status,
    qr_code text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.restaurant_tables FORCE ROW LEVEL SECURITY;


ALTER TABLE public.restaurant_tables OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT staff_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'waiter'::text, 'kitchen'::text])))
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_schedules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    staff_id uuid,
    shift_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    break_duration integer DEFAULT 0,
    hourly_rate numeric(8,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.staff_schedules FORCE ROW LEVEL SECURITY;


ALTER TABLE public.staff_schedules OWNER TO postgres;

--
-- Name: table_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    pin_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by text,
    cart_version integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY public.table_sessions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.table_sessions OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    website text,
    phone text,
    email text,
    address jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan text DEFAULT 'basic'::text,
    subscription_status text DEFAULT 'active'::text,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    code text NOT NULL,
    CONSTRAINT tenants_code_len_chk CHECK ((length(code) = 4))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    email text NOT NULL,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar_url text,
    role public.user_role DEFAULT 'staff'::public.user_role,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.users FORCE ROW LEVEL SECURITY;


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: v_analytics_daily_secure; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_analytics_daily_secure AS
 SELECT tenant_id,
    day,
    orders_count,
    revenue_total,
    dine_in_count,
    takeaway_count,
    updated_at
   FROM public.analytics_daily ad
  WHERE (tenant_id IN ( SELECT s.tenant_id
           FROM public.staff s
          WHERE (s.user_id = auth.uid())));


ALTER VIEW public.v_analytics_daily_secure OWNER TO postgres;

--
-- Name: v_current_staff; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_current_staff AS
 SELECT id,
    tenant_id,
    user_id,
    role,
    created_at
   FROM public.staff s
  WHERE (user_id = auth.uid());


ALTER VIEW public.v_current_staff OWNER TO postgres;

--
-- Name: v_orders_latest_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_orders_latest_status AS
 SELECT ose.order_id,
    ose.to_status AS latest_status,
    ose.changed_at,
        CASE
            WHEN (ose.to_status = ANY (ARRAY['pending'::text, 'placed'::text])) THEN 'queued'::text
            WHEN (ose.to_status = 'preparing'::text) THEN 'preparing'::text
            WHEN (ose.to_status = 'ready'::text) THEN 'ready'::text
            WHEN (ose.to_status = ANY (ARRAY['served'::text, 'paid'::text])) THEN 'completed'::text
            WHEN (ose.to_status = 'cancelled'::text) THEN 'cancelled'::text
            ELSE 'other'::text
        END AS lane
   FROM (public.order_status_events ose
     JOIN ( SELECT order_status_events.order_id,
            max(order_status_events.changed_at) AS latest_changed
           FROM public.order_status_events
          GROUP BY order_status_events.order_id) last ON (((last.order_id = ose.order_id) AND (last.latest_changed = ose.changed_at))));


ALTER VIEW public.v_orders_latest_status OWNER TO postgres;

--
-- Name: v_kds_lane_counts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_kds_lane_counts AS
 SELECT lane,
    (count(*))::integer AS orders
   FROM public.v_orders_latest_status
  GROUP BY lane;


ALTER VIEW public.v_kds_lane_counts OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_08_21; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_21 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_22; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_22 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_23; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_23 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_24; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_24 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_25; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_25 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_26; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_26 OWNER TO supabase_admin;

--
-- Name: messages_2025_08_27; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_08_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_08_27 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


ALTER TABLE supabase_migrations.seed_files OWNER TO postgres;

--
-- Name: messages_2025_08_21; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_21 FOR VALUES FROM ('2025-08-21 00:00:00') TO ('2025-08-22 00:00:00');


--
-- Name: messages_2025_08_22; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_22 FOR VALUES FROM ('2025-08-22 00:00:00') TO ('2025-08-23 00:00:00');


--
-- Name: messages_2025_08_23; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_23 FOR VALUES FROM ('2025-08-23 00:00:00') TO ('2025-08-24 00:00:00');


--
-- Name: messages_2025_08_24; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_24 FOR VALUES FROM ('2025-08-24 00:00:00') TO ('2025-08-25 00:00:00');


--
-- Name: messages_2025_08_25; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_25 FOR VALUES FROM ('2025-08-25 00:00:00') TO ('2025-08-26 00:00:00');


--
-- Name: messages_2025_08_26; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_26 FOR VALUES FROM ('2025-08-26 00:00:00') TO ('2025-08-27 00:00:00');


--
-- Name: messages_2025_08_27; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_27 FOR VALUES FROM ('2025-08-27 00:00:00') TO ('2025-08-28 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: analytics_daily analytics_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_daily
    ADD CONSTRAINT analytics_daily_pkey PRIMARY KEY (tenant_id, day);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_sessions cart_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_pkey PRIMARY KEY (id);


--
-- Name: cart_sessions cart_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_session_token_key UNIQUE (session_token);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- Name: customers customers_tenant_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_phone_key UNIQUE (tenant_id, phone);


--
-- Name: customization customization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customization
    ADD CONSTRAINT customization_pkey PRIMARY KEY (tenant_id);


--
-- Name: daily_sales_summary daily_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_pkey PRIMARY KEY (id);


--
-- Name: daily_sales_summary daily_sales_summary_tenant_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_tenant_id_date_key UNIQUE (tenant_id, date);


--
-- Name: domain_events domain_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_events
    ADD CONSTRAINT domain_events_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_events order_status_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- Name: payment_events payment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_pkey PRIMARY KEY (id);


--
-- Name: payment_intents payment_intents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_pkey PRIMARY KEY (id);


--
-- Name: payment_providers payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_pkey PRIMARY KEY (id);


--
-- Name: payment_providers payment_providers_tenant_provider_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_tenant_provider_key UNIQUE (tenant_id, provider);


--
-- Name: payment_refunds payment_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_pkey PRIMARY KEY (id);


--
-- Name: payment_splits payment_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: printer_configs printer_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer_configs
    ADD CONSTRAINT printer_configs_pkey PRIMARY KEY (id);


--
-- Name: qr_scans qr_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_pkey PRIMARY KEY (id);


--
-- Name: receipt_deliveries receipt_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_deliveries
    ADD CONSTRAINT receipt_deliveries_pkey PRIMARY KEY (id);


--
-- Name: restaurant_tables restaurant_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_pkey PRIMARY KEY (id);


--
-- Name: restaurant_tables restaurant_tables_tenant_id_table_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_tenant_id_table_number_key UNIQUE (tenant_id, table_number);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_schedules staff_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_pkey PRIMARY KEY (id);


--
-- Name: staff staff_tenant_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_tenant_id_user_id_key UNIQUE (tenant_id, user_id);


--
-- Name: table_sessions table_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_sessions
    ADD CONSTRAINT table_sessions_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: tables tables_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_21 messages_2025_08_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_21
    ADD CONSTRAINT messages_2025_08_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_22 messages_2025_08_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_22
    ADD CONSTRAINT messages_2025_08_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_23 messages_2025_08_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_23
    ADD CONSTRAINT messages_2025_08_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_24 messages_2025_08_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_24
    ADD CONSTRAINT messages_2025_08_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_25 messages_2025_08_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_25
    ADD CONSTRAINT messages_2025_08_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_26 messages_2025_08_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_26
    ADD CONSTRAINT messages_2025_08_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_27 messages_2025_08_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_08_27
    ADD CONSTRAINT messages_2025_08_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_analytics_daily_tenant_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_daily_tenant_day ON public.analytics_daily USING btree (tenant_id, day);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs USING btree (tenant_id);


--
-- Name: idx_cart_items_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_session ON public.cart_items USING btree (session_id);


--
-- Name: idx_menu_items_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_category_id ON public.menu_items USING btree (category_id);


--
-- Name: idx_menu_items_tenant_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_active ON public.menu_items USING btree (tenant_id, active);


--
-- Name: idx_menu_items_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_id ON public.menu_items USING btree (tenant_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_tenant ON public.order_items USING btree (tenant_id);


--
-- Name: idx_order_status_events_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_events_created_at ON public.order_status_events USING btree (created_at);


--
-- Name: idx_order_status_events_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_events_order_id ON public.order_status_events USING btree (order_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_created ON public.orders USING btree (tenant_id, created_at DESC);


--
-- Name: idx_orders_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_id ON public.orders USING btree (tenant_id);


--
-- Name: idx_orders_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant_status ON public.orders USING btree (tenant_id, status);


--
-- Name: idx_ose_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_created_at ON public.order_status_events USING btree (created_at);


--
-- Name: idx_ose_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_order ON public.order_status_events USING btree (order_id);


--
-- Name: idx_ose_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_order_id ON public.order_status_events USING btree (order_id);


--
-- Name: idx_ose_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_tenant ON public.order_status_events USING btree (tenant_id);


--
-- Name: idx_ose_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_tenant_created ON public.order_status_events USING btree (tenant_id, created_at);


--
-- Name: idx_ose_to_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ose_to_status ON public.order_status_events USING btree (to_status);


--
-- Name: idx_payment_events_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_created_at ON public.payment_events USING btree (created_at);


--
-- Name: idx_payment_events_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_event_type ON public.payment_events USING btree (event_type);


--
-- Name: idx_payment_events_intent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_intent_id ON public.payment_events USING btree (payment_intent_id);


--
-- Name: idx_payment_events_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_events_tenant_id ON public.payment_events USING btree (tenant_id);


--
-- Name: idx_payment_intents_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_order_id ON public.payment_intents USING btree (order_id);


--
-- Name: idx_payment_intents_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_status ON public.payment_intents USING btree (status);


--
-- Name: idx_payment_intents_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_intents_tenant_id ON public.payment_intents USING btree (tenant_id);


--
-- Name: idx_payment_refunds_intent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_intent_id ON public.payment_refunds USING btree (payment_intent_id);


--
-- Name: idx_payment_refunds_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_order ON public.payment_refunds USING btree (order_id);


--
-- Name: idx_payment_refunds_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_payment ON public.payment_refunds USING btree (payment_id);


--
-- Name: idx_payment_refunds_processed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_processed_at ON public.payment_refunds USING btree (processed_at);


--
-- Name: idx_payment_refunds_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_status ON public.payment_refunds USING btree (status);


--
-- Name: idx_payment_refunds_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_tenant ON public.payment_refunds USING btree (tenant_id);


--
-- Name: idx_payment_refunds_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_refunds_tenant_id ON public.payment_refunds USING btree (tenant_id);


--
-- Name: idx_payment_splits_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_splits_order ON public.payment_splits USING btree (order_id);


--
-- Name: idx_payment_splits_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_splits_payment ON public.payment_splits USING btree (payment_id);


--
-- Name: idx_payment_splits_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_splits_tenant ON public.payment_splits USING btree (tenant_id);


--
-- Name: idx_pe_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pe_event_id ON public.payment_events USING btree (provider, event_id);


--
-- Name: idx_pi_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_created_at ON public.payment_intents USING btree (created_at);


--
-- Name: idx_pi_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_order ON public.payment_intents USING btree (order_id);


--
-- Name: idx_pi_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_provider ON public.payment_intents USING btree (provider_id);


--
-- Name: idx_pi_provider_intent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_provider_intent ON public.payment_intents USING btree (provider, provider_intent_id);


--
-- Name: idx_pi_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_status ON public.payment_intents USING btree (status);


--
-- Name: idx_pi_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_tenant ON public.payment_intents USING btree (tenant_id);


--
-- Name: idx_pi_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pi_tenant_created ON public.payment_intents USING btree (tenant_id, created_at);


--
-- Name: idx_pp_provider; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pp_provider ON public.payment_providers USING btree (provider);


--
-- Name: idx_pp_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pp_tenant ON public.payment_providers USING btree (tenant_id);


--
-- Name: idx_pr_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_created_at ON public.payment_refunds USING btree (created_at);


--
-- Name: idx_pr_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_payment ON public.payment_refunds USING btree (payment_id);


--
-- Name: idx_pr_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pr_tenant_created ON public.payment_refunds USING btree (tenant_id, created_at);


--
-- Name: idx_ps_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_method ON public.payment_splits USING btree (method);


--
-- Name: idx_ps_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_order ON public.payment_splits USING btree (order_id);


--
-- Name: idx_ps_tenant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ps_tenant_created ON public.payment_splits USING btree (tenant_id, created_at);


--
-- Name: idx_staff_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_user ON public.staff USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);


--
-- Name: tenants_code_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_key_idx ON public.tenants USING btree (code);


--
-- Name: uniq_active_table_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_active_table_session ON public.table_sessions USING btree (tenant_id, table_id) WHERE (status = 'active'::text);


--
-- Name: uniq_default_provider_per_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_default_provider_per_tenant ON public.payment_providers USING btree (tenant_id) WHERE (is_default = true);


--
-- Name: ux_orders_active_per_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_orders_active_per_table ON public.orders USING btree (tenant_id, table_id) WHERE ((table_id IS NOT NULL) AND (status = ANY (ARRAY['pending'::public.order_status, 'processing'::public.order_status])));


--
-- Name: ux_orders_tenant_idem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_orders_tenant_idem ON public.orders USING btree (tenant_id, idempotency_key);


--
-- Name: ux_payment_providers_one_default_per_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_payment_providers_one_default_per_tenant ON public.payment_providers USING btree (tenant_id) WHERE (is_default = true);


--
-- Name: ux_restaurant_tables_qr_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_restaurant_tables_qr_code ON public.restaurant_tables USING btree (qr_code) WHERE (qr_code IS NOT NULL);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: messages_2025_08_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_21_pkey;


--
-- Name: messages_2025_08_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_22_pkey;


--
-- Name: messages_2025_08_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_23_pkey;


--
-- Name: messages_2025_08_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_24_pkey;


--
-- Name: messages_2025_08_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_25_pkey;


--
-- Name: messages_2025_08_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_26_pkey;


--
-- Name: messages_2025_08_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_27_pkey;


--
-- Name: order_status_events trg_order_paid_upsert_daily; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_order_paid_upsert_daily AFTER INSERT ON public.order_status_events FOR EACH ROW EXECUTE FUNCTION app.on_order_paid_upsert_daily();


--
-- Name: orders trg_orders_fill_defaults; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_orders_fill_defaults BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_fill_defaults();


--
-- Name: order_status_events trg_ose_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ose_set_updated_at BEFORE UPDATE ON public.order_status_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payment_intents trg_payment_intent_succeeded; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_intent_succeeded AFTER UPDATE ON public.payment_intents FOR EACH ROW WHEN ((new.status = 'succeeded'::text)) EXECUTE FUNCTION app.on_payment_succeeded();


--
-- Name: payment_intents trg_payment_intents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


--
-- Name: payment_refunds trg_payment_refunds_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_refunds_set_updated_at BEFORE UPDATE ON public.payment_refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payment_splits trg_payment_splits_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_splits_set_updated_at BEFORE UPDATE ON public.payment_splits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payment_events trg_payment_success; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_success AFTER INSERT ON public.payment_events FOR EACH ROW WHEN ((new.event_type = 'payment_succeeded'::text)) EXECUTE FUNCTION app.handle_payment_success();


--
-- Name: payment_intents trg_pi_mark_order_paid; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_pi_mark_order_paid AFTER UPDATE OF status ON public.payment_intents FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION app.on_payment_intent_succeeded_mark_order_paid();


--
-- Name: tenants trg_protect_tenant_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_protect_tenant_code BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.protect_tenant_code();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_items update_inventory_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: order_items update_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: restaurant_tables update_restaurant_tables_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: staff_schedules update_staff_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tenants update_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart_sessions(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- Name: cart_sessions cart_sessions_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.restaurant_tables(id) ON DELETE SET NULL;


--
-- Name: cart_sessions cart_sessions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_sessions
    ADD CONSTRAINT cart_sessions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: categories categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: customization customization_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customization
    ADD CONSTRAINT customization_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: daily_sales_summary daily_sales_summary_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: locations locations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_categories menu_categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_categories
    ADD CONSTRAINT menu_categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_status_events order_status_events_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: order_status_events order_status_events_changed_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_changed_by_staff_id_fkey FOREIGN KEY (changed_by_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: order_status_events order_status_events_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_status_events order_status_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_status_events order_status_events_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_status_events order_status_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_events
    ADD CONSTRAINT order_status_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: orders orders_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.restaurant_tables(id) ON DELETE SET NULL;


--
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_intents payment_intents_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: payment_intents payment_intents_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.payment_providers(id) ON DELETE SET NULL;


--
-- Name: payment_intents payment_intents_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intents
    ADD CONSTRAINT payment_intents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_providers payment_providers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_providers
    ADD CONSTRAINT payment_providers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_refunds payment_refunds_created_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_created_by_staff_id_fkey FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: payment_refunds payment_refunds_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: payment_refunds payment_refunds_payment_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_payment_fk FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- Name: payment_refunds payment_refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payment_refunds payment_refunds_refunded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_refunded_by_fkey FOREIGN KEY (refunded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: payment_refunds payment_refunds_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_refunds payment_refunds_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_splits payment_splits_order_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_order_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_splits payment_splits_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_splits payment_splits_payer_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payer_staff_id_fkey FOREIGN KEY (payer_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: payment_splits payment_splits_payment_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payment_fk FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- Name: payment_splits payment_splits_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payment_splits payment_splits_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_splits payment_splits_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_splits
    ADD CONSTRAINT payment_splits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: printer_configs printer_configs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer_configs
    ADD CONSTRAINT printer_configs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: qr_scans qr_scans_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.restaurant_tables(id) ON DELETE CASCADE;


--
-- Name: qr_scans qr_scans_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: receipt_deliveries receipt_deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipt_deliveries
    ADD CONSTRAINT receipt_deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: restaurant_tables restaurant_tables_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_tables
    ADD CONSTRAINT restaurant_tables_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: staff_schedules staff_schedules_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: staff_schedules staff_schedules_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: staff staff_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tables tables_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items Users can access order items through orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access order items through orders" ON public.order_items USING ((order_id IN ( SELECT orders.id
   FROM public.orders
  WHERE (orders.tenant_id = ( SELECT users.tenant_id
           FROM public.users
          WHERE (users.id = auth.uid()))))));


--
-- Name: notifications Users can access their notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their notifications" ON public.notifications USING ((user_id = auth.uid()));


--
-- Name: daily_sales_summary Users can access their tenant analytics; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant analytics" ON public.daily_sales_summary USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: audit_logs Users can access their tenant audit logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant audit logs" ON public.audit_logs USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: categories Users can access their tenant categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant categories" ON public.categories USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: customers Users can access their tenant customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant customers" ON public.customers USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: tenants Users can access their tenant data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant data" ON public.tenants USING ((id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: inventory_items Users can access their tenant inventory; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant inventory" ON public.inventory_items USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: payments Users can access their tenant payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant payments" ON public.payments USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: staff_schedules Users can access their tenant schedules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant schedules" ON public.staff_schedules USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: restaurant_tables Users can access their tenant tables; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant tables" ON public.restaurant_tables USING ((tenant_id = ( SELECT users.tenant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: users Users can access their tenant users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their tenant users" ON public.users USING ((tenant_id = ( SELECT users_1.tenant_id
   FROM public.users users_1
  WHERE (users_1.id = auth.uid()))));


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs audit_logs_ro_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_ro_same_tenant ON public.audit_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = audit_logs.tenant_id))));


--
-- Name: audit_logs audit_logs_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_delete ON public.audit_logs FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: audit_logs audit_logs_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_insert ON public.audit_logs FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: audit_logs audit_logs_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_select ON public.audit_logs FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: audit_logs audit_logs_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY audit_logs_tenant_update ON public.audit_logs FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: order_items auth_insert_order_items_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_insert_order_items_tenant ON public.order_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid)))));


--
-- Name: orders auth_insert_orders_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_insert_orders_tenant ON public.orders FOR INSERT TO authenticated WITH CHECK ((tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid));


--
-- Name: categories auth_read_categories_active_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_read_categories_active_tenant ON public.categories FOR SELECT TO authenticated USING (((is_active = true) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid)));


--
-- Name: order_items auth_read_order_items_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_read_order_items_tenant ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid)))));


--
-- Name: orders auth_read_orders_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_read_orders_tenant ON public.orders FOR SELECT TO authenticated USING ((tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid));


--
-- Name: restaurant_tables auth_read_restaurant_tables_for_qr_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auth_read_restaurant_tables_for_qr_tenant ON public.restaurant_tables FOR SELECT TO authenticated USING (((qr_code IS NOT NULL) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid)));


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: cart_items cart_items_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_items_rw_same_tenant ON public.cart_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = cart_items.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = cart_items.tenant_id)))));


--
-- Name: cart_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: cart_sessions cart_sessions_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cart_sessions_rw_same_tenant ON public.cart_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = cart_sessions.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = cart_sessions.tenant_id)))));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: categories categories_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_select_same_tenant ON public.categories FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id))));


--
-- Name: categories categories_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_delete ON public.categories FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: categories categories_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_insert ON public.categories FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: categories categories_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_select ON public.categories FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: categories categories_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_tenant_update ON public.categories FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: categories categories_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY categories_write_same_tenant ON public.categories TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = categories.tenant_id))));


--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: customers customers_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customers_tenant_delete ON public.customers FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: customers customers_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customers_tenant_insert ON public.customers FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: customers customers_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customers_tenant_select ON public.customers FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: customers customers_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customers_tenant_update ON public.customers FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: customization; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customization ENABLE ROW LEVEL SECURITY;

--
-- Name: customization customization_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_select_same_tenant ON public.customization FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- Name: customization customization_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customization_write_same_tenant ON public.customization TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = customization.tenant_id))));


--
-- Name: daily_sales_summary; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_sales_summary daily_sales_summary_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY daily_sales_summary_tenant_delete ON public.daily_sales_summary FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: daily_sales_summary daily_sales_summary_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY daily_sales_summary_tenant_insert ON public.daily_sales_summary FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: daily_sales_summary daily_sales_summary_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY daily_sales_summary_tenant_select ON public.daily_sales_summary FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: daily_sales_summary daily_sales_summary_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY daily_sales_summary_tenant_update ON public.daily_sales_summary FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: domain_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

--
-- Name: domain_events domain_events_ro_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY domain_events_ro_same_tenant ON public.domain_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = domain_events.tenant_id))));


--
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_items inventory_items_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inventory_items_tenant_delete ON public.inventory_items FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: inventory_items inventory_items_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inventory_items_tenant_insert ON public.inventory_items FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: inventory_items inventory_items_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inventory_items_tenant_select ON public.inventory_items FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: inventory_items inventory_items_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY inventory_items_tenant_update ON public.inventory_items FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: locations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

--
-- Name: locations locations_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_select_same_tenant ON public.locations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- Name: locations locations_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY locations_write_same_tenant ON public.locations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = locations.tenant_id))));


--
-- Name: menu_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_categories menu_categories_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_select_same_tenant ON public.menu_categories FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- Name: menu_categories menu_categories_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_categories_write_same_tenant ON public.menu_categories TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_categories.tenant_id))));


--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items menu_items_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_select_same_tenant ON public.menu_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_items.tenant_id))));


--
-- Name: menu_items menu_items_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY menu_items_write_same_tenant ON public.menu_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_items.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = menu_items.tenant_id))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_delete ON public.notifications FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: notifications notifications_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_insert ON public.notifications FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: notifications notifications_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_select ON public.notifications FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: notifications notifications_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_tenant_update ON public.notifications FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items order_items_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_select_same_tenant ON public.order_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = order_items.tenant_id))));


--
-- Name: order_items order_items_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_write_same_tenant ON public.order_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = order_items.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = order_items.tenant_id))));


--
-- Name: order_status_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

--
-- Name: order_status_events order_status_events_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_status_events_rw_same_tenant ON public.order_status_events TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id)))));


--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: orders orders_realtime_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_realtime_tenant_select ON public.orders FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = orders.tenant_id)))));


--
-- Name: orders orders_same_tenant_rw; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_same_tenant_rw ON public.orders USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: orders orders_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_select_same_tenant ON public.orders FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = orders.tenant_id))));


--
-- Name: orders orders_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_tenant_delete ON public.orders FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: orders orders_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_tenant_insert ON public.orders FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: orders orders_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_tenant_select ON public.orders FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: orders orders_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_tenant_update ON public.orders FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: orders orders_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_write_same_tenant ON public.orders TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = orders.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = orders.tenant_id))));


--
-- Name: order_status_events ose_insert_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_insert_same_tenant ON public.order_status_events FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id)))));


--
-- Name: order_status_events ose_realtime_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_realtime_tenant_select ON public.order_status_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.orders o
     JOIN public.staff s ON ((s.tenant_id = o.tenant_id)))
  WHERE ((o.id = order_status_events.order_id) AND (s.user_id = auth.uid())))));


--
-- Name: order_status_events ose_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_rw_same_tenant ON public.order_status_events TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id)))));


--
-- Name: order_status_events ose_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ose_select_same_tenant ON public.order_status_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = order_status_events.tenant_id)))));


--
-- Name: payment_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_events payment_events_rw_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_rw_policy ON public.payment_events TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id)))));


--
-- Name: payment_events payment_events_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_rw_same_tenant ON public.payment_events TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id)))));


--
-- Name: payment_events payment_events_tenant_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_events_tenant_read ON public.payment_events FOR SELECT TO authenticated USING (((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id))))));


--
-- Name: payment_intents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_intents payment_intents_rw_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_rw_policy ON public.payment_intents TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_intents.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_intents.tenant_id)))));


--
-- Name: payment_intents payment_intents_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_intents_rw_same_tenant ON public.payment_intents TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_intents.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_intents.tenant_id)))));


--
-- Name: payment_providers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_providers payment_providers_rw_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_rw_policy ON public.payment_providers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_providers.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_providers.tenant_id)))));


--
-- Name: payment_providers payment_providers_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_providers_rw_same_tenant ON public.payment_providers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_providers.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_providers.tenant_id)))));


--
-- Name: payment_refunds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_refunds payment_refunds_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_refunds_rw_same_tenant ON public.payment_refunds TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_refunds.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_refunds.tenant_id)))));


--
-- Name: payment_splits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_splits ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_splits payment_splits_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payment_splits_rw_same_tenant ON public.payment_splits TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_splits.tenant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_splits.tenant_id)))));


--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payments payments_realtime_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_realtime_tenant_select ON public.payments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payments.tenant_id)))));


--
-- Name: payments payments_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_select_same_tenant ON public.payments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payments.tenant_id))));


--
-- Name: payments payments_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_tenant_delete ON public.payments FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: payments payments_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_tenant_insert ON public.payments FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: payments payments_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_tenant_select ON public.payments FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: payments payments_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_tenant_update ON public.payments FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: payments payments_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_write_same_tenant ON public.payments TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payments.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = payments.tenant_id))));


--
-- Name: payment_events pe_realtime_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY pe_realtime_tenant_select ON public.payment_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_events.tenant_id)))));


--
-- Name: payment_intents pi_realtime_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY pi_realtime_tenant_select ON public.payment_intents FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = payment_intents.tenant_id)))));


--
-- Name: printer_configs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.printer_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: qr_scans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

--
-- Name: qr_scans qr_scans_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY qr_scans_select_same_tenant ON public.qr_scans FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.staff s
  WHERE ((s.user_id = auth.uid()) AND (s.tenant_id = qr_scans.tenant_id)))));


--
-- Name: restaurant_tables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_tables restaurant_tables_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_select_same_tenant ON public.restaurant_tables FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = restaurant_tables.tenant_id))));


--
-- Name: restaurant_tables restaurant_tables_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_tenant_delete ON public.restaurant_tables FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: restaurant_tables restaurant_tables_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_tenant_insert ON public.restaurant_tables FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: restaurant_tables restaurant_tables_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_tenant_select ON public.restaurant_tables FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: restaurant_tables restaurant_tables_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_tenant_update ON public.restaurant_tables FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: restaurant_tables restaurant_tables_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY restaurant_tables_write_same_tenant ON public.restaurant_tables TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = restaurant_tables.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = restaurant_tables.tenant_id))));


--
-- Name: staff; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

--
-- Name: staff staff_rw_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_rw_same_tenant ON public.staff TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = staff.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = staff.tenant_id))));


--
-- Name: staff_schedules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_schedules staff_schedules_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_delete ON public.staff_schedules FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: staff_schedules staff_schedules_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_insert ON public.staff_schedules FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: staff_schedules staff_schedules_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_select ON public.staff_schedules FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: staff_schedules staff_schedules_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_schedules_tenant_update ON public.staff_schedules FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: staff staff_self_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY staff_self_select ON public.staff FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: table_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: table_sessions table_sessions_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_tenant_delete ON public.table_sessions FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: table_sessions table_sessions_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_tenant_insert ON public.table_sessions FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: table_sessions table_sessions_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_tenant_select ON public.table_sessions FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: table_sessions table_sessions_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY table_sessions_tenant_update ON public.table_sessions FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: tables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

--
-- Name: tables tables_select_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_select_same_tenant ON public.tables FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = tables.tenant_id))));


--
-- Name: tables tables_write_same_tenant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tables_write_same_tenant ON public.tables TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = tables.tenant_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = tables.tenant_id))));


--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants tenants_select_for_staff; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tenants_select_for_staff ON public.tenants FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.current_tenant_ids(auth.uid()) ct(tenant_id)
  WHERE (ct.tenant_id = tenants.id))));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_tenant_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_delete ON public.users FOR DELETE USING ((tenant_id = app.current_tenant_id()));


--
-- Name: users users_tenant_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_insert ON public.users FOR INSERT WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: users users_tenant_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_select ON public.users FOR SELECT USING ((tenant_id = app.current_tenant_id()));


--
-- Name: users users_tenant_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY users_tenant_update ON public.users FOR UPDATE USING ((tenant_id = app.current_tenant_id())) WITH CHECK ((tenant_id = app.current_tenant_id()));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime order_items; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_items;


--
-- Name: supabase_realtime order_status_events; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.order_status_events;


--
-- Name: supabase_realtime orders; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.orders;


--
-- Name: supabase_realtime payment_events; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payment_events;


--
-- Name: supabase_realtime payment_intents; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payment_intents;


--
-- Name: supabase_realtime payments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.payments;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.add_order_status_event(p_tenant_id uuid, p_order_id uuid, p_from text, p_to text, p_by_staff_id uuid) TO authenticated;


--
-- Name: FUNCTION analytics_revenue(p_window text, p_granularity text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.analytics_revenue(p_window text, p_granularity text) TO authenticated;


--
-- Name: FUNCTION analytics_summary(p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.analytics_summary(p_window text) TO authenticated;


--
-- Name: FUNCTION confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.confirm_payment_and_close(p_tenant_id uuid, p_order_id uuid, p_intent_id uuid, p_amount numeric) TO authenticated;


--
-- Name: FUNCTION create_intent_for_order(p_order_id uuid, p_currency text, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.create_intent_for_order(p_order_id uuid, p_currency text, p_provider text) TO authenticated;


--
-- Name: FUNCTION create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.create_payment_intent(p_order_id uuid, p_amount numeric, p_currency text, p_provider text) TO authenticated;


--
-- Name: FUNCTION current_tenant_id(); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.current_tenant_id() TO authenticated;


--
-- Name: FUNCTION ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.ensure_payment_intent(p_tenant_id uuid, p_order_id uuid, p_provider text) TO authenticated;


--
-- Name: FUNCTION kds_counts(p_tenant_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_counts(p_tenant_id uuid) TO authenticated;


--
-- Name: FUNCTION kds_lane(status text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_lane(status text) TO authenticated;


--
-- Name: FUNCTION kds_lane_counts(p_tenant_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kds_lane_counts(p_tenant_id uuid) TO authenticated;


--
-- Name: FUNCTION kpi_summary(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.kpi_summary(p_tenant_id uuid, p_window text) TO authenticated;


--
-- Name: FUNCTION mark_order_paid(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_paid(p_order_id uuid, p_note text) TO authenticated;


--
-- Name: FUNCTION mark_order_preparing(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_preparing(p_order_id uuid, p_note text) TO authenticated;


--
-- Name: FUNCTION mark_order_ready(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_ready(p_order_id uuid, p_note text) TO authenticated;


--
-- Name: FUNCTION mark_order_served(p_order_id uuid, p_note text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_order_served(p_order_id uuid, p_note text) TO authenticated;


--
-- Name: FUNCTION mark_payment_intent_status(p_intent_id uuid, p_new_status text, p_event jsonb); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.mark_payment_intent_status(p_intent_id uuid, p_new_status text, p_event jsonb) TO authenticated;


--
-- Name: FUNCTION order_fulfillment_timeline(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.order_fulfillment_timeline(p_tenant_id uuid, p_window text) TO authenticated;


--
-- Name: TABLE order_status_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_events TO anon;
GRANT ALL ON TABLE public.order_status_events TO authenticated;
GRANT ALL ON TABLE public.order_status_events TO service_role;


--
-- Name: FUNCTION order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.order_set_status(p_order_id uuid, p_to_status text, p_reason text, p_meta jsonb) TO authenticated;


--
-- Name: FUNCTION payment_conversion_funnel(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.payment_conversion_funnel(p_tenant_id uuid, p_window text) TO authenticated;


--
-- Name: FUNCTION peak_hours_heatmap(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.peak_hours_heatmap(p_tenant_id uuid, p_window text) TO authenticated;


--
-- Name: FUNCTION push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.push_order_status(p_order_id uuid, p_status text, p_note text, p_by_user uuid) TO authenticated;


--
-- Name: FUNCTION revenue_by_method(p_tenant_id uuid, p_window text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.revenue_by_method(p_tenant_id uuid, p_window text) TO authenticated;


--
-- Name: FUNCTION revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.revenue_timeseries(p_tenant_id uuid, p_window text, p_granularity text) TO authenticated;


--
-- Name: FUNCTION set_default_payment_provider(p_provider_id uuid); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.set_default_payment_provider(p_provider_id uuid) TO authenticated;


--
-- Name: FUNCTION top_items(p_tenant_id uuid, p_window text, p_limit integer); Type: ACL; Schema: app; Owner: postgres
--

GRANT ALL ON FUNCTION app.top_items(p_tenant_id uuid, p_window text, p_limit integer) TO authenticated;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION app_is_platform(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.app_is_platform() TO anon;
GRANT ALL ON FUNCTION public.app_is_platform() TO authenticated;
GRANT ALL ON FUNCTION public.app_is_platform() TO service_role;


--
-- Name: FUNCTION app_tenant_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.app_tenant_id() TO anon;
GRANT ALL ON FUNCTION public.app_tenant_id() TO authenticated;
GRANT ALL ON FUNCTION public.app_tenant_id() TO service_role;


--
-- Name: FUNCTION calculate_order_total(order_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_order_total(order_uuid uuid) TO service_role;


--
-- Name: FUNCTION can_user_see_menu_items(uid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO anon;
GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_user_see_menu_items(uid uuid) TO service_role;


--
-- Name: FUNCTION checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO anon;
GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO authenticated;
GRANT ALL ON FUNCTION public.checkout_order(p_tenant_id uuid, p_session_id text, p_mode text, p_table_id uuid, p_cart_version integer, p_idempotency_key text, p_total_cents integer) TO service_role;


--
-- Name: FUNCTION current_tenant_ids(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_tenant_ids() TO anon;
GRANT ALL ON FUNCTION public.current_tenant_ids() TO authenticated;
GRANT ALL ON FUNCTION public.current_tenant_ids() TO service_role;


--
-- Name: FUNCTION current_tenant_ids(uid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO anon;
GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.current_tenant_ids(uid uuid) TO service_role;


--
-- Name: FUNCTION generate_order_number(tenant_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.generate_order_number(tenant_uuid uuid) TO service_role;


--
-- Name: FUNCTION kaf_apply_policies(tablename text, has_id boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO anon;
GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO authenticated;
GRANT ALL ON FUNCTION public.kaf_apply_policies(tablename text, has_id boolean) TO service_role;


--
-- Name: FUNCTION kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO anon;
GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO authenticated;
GRANT ALL ON FUNCTION public.kaf_apply_policies_col(tab regclass, tenant_col text, is_root boolean) TO service_role;


--
-- Name: FUNCTION orders_fill_defaults(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.orders_fill_defaults() TO anon;
GRANT ALL ON FUNCTION public.orders_fill_defaults() TO authenticated;
GRANT ALL ON FUNCTION public.orders_fill_defaults() TO service_role;


--
-- Name: FUNCTION protect_tenant_code(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.protect_tenant_code() TO anon;
GRANT ALL ON FUNCTION public.protect_tenant_code() TO authenticated;
GRANT ALL ON FUNCTION public.protect_tenant_code() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: FUNCTION tg_set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.tg_set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.tg_set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.tg_set_updated_at() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE tables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tables TO anon;
GRANT ALL ON TABLE public.tables TO authenticated;
GRANT ALL ON TABLE public.tables TO service_role;


--
-- Name: TABLE analytics_active_tables_now; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_active_tables_now TO anon;
GRANT ALL ON TABLE public.analytics_active_tables_now TO authenticated;
GRANT ALL ON TABLE public.analytics_active_tables_now TO service_role;


--
-- Name: TABLE analytics_daily; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_daily TO anon;
GRANT ALL ON TABLE public.analytics_daily TO authenticated;
GRANT ALL ON TABLE public.analytics_daily TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: TABLE analytics_kpi_summary_7d; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO anon;
GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO authenticated;
GRANT ALL ON TABLE public.analytics_kpi_summary_7d TO service_role;


--
-- Name: TABLE analytics_revenue_7d; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.analytics_revenue_7d TO anon;
GRANT ALL ON TABLE public.analytics_revenue_7d TO authenticated;
GRANT ALL ON TABLE public.analytics_revenue_7d TO service_role;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;


--
-- Name: TABLE cart_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_sessions TO anon;
GRANT ALL ON TABLE public.cart_sessions TO authenticated;
GRANT ALL ON TABLE public.cart_sessions TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- Name: TABLE customization; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customization TO anon;
GRANT ALL ON TABLE public.customization TO authenticated;
GRANT ALL ON TABLE public.customization TO service_role;


--
-- Name: TABLE daily_sales_summary; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_sales_summary TO anon;
GRANT ALL ON TABLE public.daily_sales_summary TO authenticated;
GRANT ALL ON TABLE public.daily_sales_summary TO service_role;


--
-- Name: TABLE domain_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.domain_events TO anon;
GRANT ALL ON TABLE public.domain_events TO authenticated;
GRANT ALL ON TABLE public.domain_events TO service_role;


--
-- Name: TABLE inventory_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_items TO anon;
GRANT ALL ON TABLE public.inventory_items TO authenticated;
GRANT ALL ON TABLE public.inventory_items TO service_role;


--
-- Name: TABLE locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.locations TO anon;
GRANT ALL ON TABLE public.locations TO authenticated;
GRANT ALL ON TABLE public.locations TO service_role;


--
-- Name: TABLE menu_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_categories TO anon;
GRANT ALL ON TABLE public.menu_categories TO authenticated;
GRANT ALL ON TABLE public.menu_categories TO service_role;


--
-- Name: TABLE menu_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_items TO anon;
GRANT ALL ON TABLE public.menu_items TO authenticated;
GRANT ALL ON TABLE public.menu_items TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- Name: TABLE payment_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_events TO anon;
GRANT ALL ON TABLE public.payment_events TO authenticated;
GRANT ALL ON TABLE public.payment_events TO service_role;


--
-- Name: TABLE payment_intents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_intents TO anon;
GRANT ALL ON TABLE public.payment_intents TO authenticated;
GRANT ALL ON TABLE public.payment_intents TO service_role;


--
-- Name: TABLE payment_providers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_providers TO anon;
GRANT ALL ON TABLE public.payment_providers TO authenticated;
GRANT ALL ON TABLE public.payment_providers TO service_role;


--
-- Name: TABLE payment_refunds; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_refunds TO anon;
GRANT ALL ON TABLE public.payment_refunds TO authenticated;
GRANT ALL ON TABLE public.payment_refunds TO service_role;


--
-- Name: TABLE payment_splits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_splits TO anon;
GRANT ALL ON TABLE public.payment_splits TO authenticated;
GRANT ALL ON TABLE public.payment_splits TO service_role;


--
-- Name: TABLE printer_configs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.printer_configs TO anon;
GRANT ALL ON TABLE public.printer_configs TO authenticated;
GRANT ALL ON TABLE public.printer_configs TO service_role;


--
-- Name: TABLE qr_scans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.qr_scans TO anon;
GRANT ALL ON TABLE public.qr_scans TO authenticated;
GRANT ALL ON TABLE public.qr_scans TO service_role;


--
-- Name: TABLE receipt_deliveries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.receipt_deliveries TO anon;
GRANT ALL ON TABLE public.receipt_deliveries TO authenticated;
GRANT ALL ON TABLE public.receipt_deliveries TO service_role;


--
-- Name: TABLE restaurant_tables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_tables TO anon;
GRANT ALL ON TABLE public.restaurant_tables TO authenticated;
GRANT ALL ON TABLE public.restaurant_tables TO service_role;


--
-- Name: TABLE staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff TO anon;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.staff TO service_role;


--
-- Name: TABLE staff_schedules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_schedules TO anon;
GRANT ALL ON TABLE public.staff_schedules TO authenticated;
GRANT ALL ON TABLE public.staff_schedules TO service_role;


--
-- Name: TABLE table_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.table_sessions TO anon;
GRANT ALL ON TABLE public.table_sessions TO authenticated;
GRANT ALL ON TABLE public.table_sessions TO service_role;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE v_analytics_daily_secure; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_analytics_daily_secure TO anon;
GRANT ALL ON TABLE public.v_analytics_daily_secure TO authenticated;
GRANT ALL ON TABLE public.v_analytics_daily_secure TO service_role;


--
-- Name: TABLE v_current_staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_current_staff TO anon;
GRANT ALL ON TABLE public.v_current_staff TO authenticated;
GRANT ALL ON TABLE public.v_current_staff TO service_role;


--
-- Name: TABLE v_orders_latest_status; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_orders_latest_status TO anon;
GRANT ALL ON TABLE public.v_orders_latest_status TO authenticated;
GRANT ALL ON TABLE public.v_orders_latest_status TO service_role;


--
-- Name: TABLE v_kds_lane_counts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.v_kds_lane_counts TO anon;
GRANT ALL ON TABLE public.v_kds_lane_counts TO authenticated;
GRANT ALL ON TABLE public.v_kds_lane_counts TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_08_21; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_21 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_21 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_22; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_22 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_22 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_23; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_23 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_23 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_24; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_24 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_24 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_25; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_25 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_25 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_26; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_26 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_26 TO dashboard_user;


--
-- Name: TABLE messages_2025_08_27; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_08_27 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_08_27 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

