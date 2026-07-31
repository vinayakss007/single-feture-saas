// GENERATED FILE — DO NOT EDIT.
// Source: db/schema.sql   Regenerate: pnpm sync
//
// The schema is compiled into a module so it ships inside the bundle. See the
// comment on migrate() in lib/db.ts for why it is not read from disk.

export const SCHEMA_SQL = `-- Abet Works single-feature SaaS framework — canonical schema.
--
-- ONE database serves ALL products. A customer signs up once and that account
-- works across every product in the suite, which is the whole commercial point:
-- cross-sell costs nothing and there is one login to support.
--
-- Product-scoped tables carry a \`product\` column (the product slug). Users and
-- sessions are global.
--
-- This file is idempotent. Running it repeatedly is safe, which is what makes it
-- usable as a migration on every boot.

-- No CREATE EXTENSION anywhere in this file, deliberately.
--
-- \`gen_random_uuid()\` has been in core Postgres since 13, so pgcrypto is not
-- needed for it. Requiring an extension would be a real cost: managed providers
-- vary in what they allow, and several only permit extensions to be installed by
-- a superuser the application role is not. That turns "point the app at a database
-- and it works" into a support ticket.
--
-- Password hashing is done in the application with node:crypto scrypt, not in the
-- database, so the database never sees a plaintext password.
DO $$
BEGIN
  IF to_regprocedure('gen_random_uuid()') IS NULL THEN
    RAISE EXCEPTION
      'gen_random_uuid() is unavailable. This schema needs PostgreSQL 13 or newer; you appear to be on %.',
      current_setting('server_version');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  email_lower     text GENERATED ALWAYS AS (lower(email)) STORED,
  name            text,
  password_hash   text NOT NULL,
  email_verified_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (email_lower);

-- Opaque session tokens. Only the SHA-256 of the token is stored, so a database
-- leak does not hand out live sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   text NOT NULL UNIQUE,
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ip           text,
  user_agent   text
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS password_resets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets (user_id);

-- ---------------------------------------------------------------------------
-- API access
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS api_keys (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product      text NOT NULL,
  name         text NOT NULL DEFAULT 'default',
  key_hash     text NOT NULL UNIQUE,
  key_prefix   text NOT NULL,
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_keys_user_product_idx ON api_keys (user_id, product);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON api_keys (key_hash) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- Billing
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product                  text NOT NULL,
  plan_code                text NOT NULL DEFAULT 'free',
  status                   text NOT NULL DEFAULT 'active',
  provider                 text,
  provider_customer_id     text,
  provider_subscription_id text,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_product_key UNIQUE (user_id, product),
  CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused'))
);

CREATE INDEX IF NOT EXISTS subscriptions_provider_sub_idx
  ON subscriptions (provider_subscription_id) WHERE provider_subscription_id IS NOT NULL;

-- Every webhook is recorded before it is acted on. Payment providers retry, and
-- without this a retry would upgrade a plan or double-count a payment.
CREATE TABLE IF NOT EXISTS webhook_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider     text NOT NULL,
  event_id     text NOT NULL,
  event_type   text,
  payload      jsonb NOT NULL,
  processed_at timestamptz,
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_provider_event_key UNIQUE (provider, event_id)
);

-- ---------------------------------------------------------------------------
-- Metering
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usage_events (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  api_key_id  uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  product     text NOT NULL,
  endpoint    text NOT NULL DEFAULT '/api/v1/run',
  units       integer NOT NULL DEFAULT 1,
  status      integer NOT NULL DEFAULT 200,
  duration_ms integer,
  ip          text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- The quota check runs on every metered request, so it must hit an index.
CREATE INDEX IF NOT EXISTS usage_events_user_product_created_idx
  ON usage_events (user_id, product, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_events_ip_created_idx
  ON usage_events (ip, created_at DESC) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS usage_events_created_idx ON usage_events (created_at DESC);

-- ---------------------------------------------------------------------------
-- Housekeeping
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_touch ON users;
CREATE TRIGGER users_touch BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS subscriptions_touch ON subscriptions;
CREATE TRIGGER subscriptions_touch BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Retention. Called daily by /api/cron/purge.
--
-- Usage events are kept far longer than everything else (400 days by default)
-- because they are the evidence behind an invoice; a billing dispute six months
-- later has to be answerable. Sessions, reset tokens and processed webhooks have
-- no such value once they are spent.
--
-- Dropped rather than replaced because the return type changes as retention rules
-- are added, and CREATE OR REPLACE cannot alter a function's signature.
--
-- Every overload is dropped by looking them up, rather than by listing signatures
-- explicitly. A hardcoded list has to be extended every time an argument is added,
-- and forgetting means the second application of this file fails with "function
-- already exists" — which breaks the idempotency the whole migrate() strategy
-- depends on. That is exactly the bug this replaced.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT oid::regprocedure AS signature
      FROM pg_proc
     WHERE proname = 'purge_expired'
       AND pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s', fn.signature);
  END LOOP;
END $$;

CREATE FUNCTION purge_expired(
  usage_retention_days integer DEFAULT 400,
  ip_retention_days integer DEFAULT 30
)
RETURNS TABLE(sessions bigint, resets bigint, webhooks bigint, usage bigint, ips_cleared bigint) AS $$
DECLARE
  s bigint; r bigint; w bigint; u bigint; i bigint;
BEGIN
  DELETE FROM sessions WHERE expires_at < now();
  GET DIAGNOSTICS s = ROW_COUNT;

  DELETE FROM password_resets WHERE expires_at < now() OR used_at IS NOT NULL;
  GET DIAGNOSTICS r = ROW_COUNT;

  -- Only processed events. An unprocessed one is a bug that still needs replaying.
  DELETE FROM webhook_events
   WHERE processed_at IS NOT NULL AND created_at < now() - interval '30 days';
  GET DIAGNOSTICS w = ROW_COUNT;

  DELETE FROM usage_events
   WHERE created_at < now() - (usage_retention_days * interval '1 day');
  GET DIAGNOSTICS u = ROW_COUNT;

  -- Anonymise old IP addresses without deleting the row.
  --
  -- An IP is only ever recorded for an anonymous caller, and its only purpose is
  -- enforcing the daily allowance — which resets every day. Keeping it for the
  -- full 400-day usage retention would be personal data held long after the
  -- purpose it was collected for has expired, which is precisely what data
  -- minimisation prohibits. The row itself is kept, because volume counts are
  -- still useful; only the identifier goes.
  --
  -- Authenticated rows never have an IP, so this only ever touches anonymous ones.
  UPDATE usage_events
     SET ip = NULL
   WHERE ip IS NOT NULL
     AND created_at < now() - (ip_retention_days * interval '1 day');
  GET DIAGNOSTICS i = ROW_COUNT;

  RETURN QUERY SELECT s, r, w, u, i;
END;
$$ LANGUAGE plpgsql;
`;
