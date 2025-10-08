-- Import Assistant schema (multi-tenant + RLS + provider/tenant config)

-- Requires pgcrypto or uuid-ossp for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS imp_runs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_type text NOT NULL,
  file_bucket text NOT NULL,
  file_key text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  est_tokens_in int DEFAULT 0,
  est_tokens_out int DEFAULT 0,
  est_ai_cents int DEFAULT 0,
  est_infra_cents int DEFAULT 0,
  est_retail_cents int DEFAULT 0,
  cost_cents integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS imp_summaries(
  run_id uuid PRIMARY KEY REFERENCES imp_runs(id) ON DELETE CASCADE,
  stats_jsonb jsonb NOT NULL,
  sample_masked_jsonb jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS imp_suggestions(
  run_id uuid PRIMARY KEY REFERENCES imp_runs(id) ON DELETE CASCADE,
  mappings_jsonb jsonb NOT NULL,
  transforms_jsonb jsonb,
  validations_jsonb jsonb,
  dedupe_jsonb jsonb,
  model text,
  tokens_in int DEFAULT 0,
  tokens_out int DEFAULT 0,
  confidence_overall numeric DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS imp_overrides(
  run_id uuid PRIMARY KEY REFERENCES imp_runs(id) ON DELETE CASCADE,
  mappings_jsonb jsonb,
  transforms_jsonb jsonb,
  validations_jsonb jsonb,
  dedupe_jsonb jsonb,
  approved_by uuid,
  approved_at timestamptz
);

CREATE TABLE IF NOT EXISTS imp_results(
  run_id uuid PRIMARY KEY REFERENCES imp_runs(id) ON DELETE CASCADE,
  inserted_count int DEFAULT 0,
  updated_count int DEFAULT 0,
  skipped_count int DEFAULT 0,
  failed_count int DEFAULT 0,
  errors_jsonb jsonb
);

CREATE TABLE IF NOT EXISTS imp_costs(
  run_id uuid PRIMARY KEY REFERENCES imp_runs(id) ON DELETE CASCADE,
  breakdown_jsonb jsonb NOT NULL
);

-- Provider pricing (single row global control)
CREATE TABLE IF NOT EXISTS provider_import_pricing(
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  light_cents int NOT NULL DEFAULT 99,
  standard_cents int NOT NULL DEFAULT 299,
  complex_cents int NOT NULL DEFAULT 499,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO provider_import_pricing (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Tenant wallets (simple model for AI budget guard)
CREATE TABLE IF NOT EXISTS tenant_wallets(
  tenant_id uuid PRIMARY KEY,
  available_cents int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE imp_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE imp_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE imp_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE imp_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE imp_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE imp_costs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY imp_runs_tenant ON imp_runs USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY imp_summaries_tenant ON imp_summaries USING (EXISTS (SELECT 1 FROM imp_runs r WHERE r.id = run_id AND r.tenant_id = current_setting('app.tenant_id')::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY imp_suggestions_tenant ON imp_suggestions USING (EXISTS (SELECT 1 FROM imp_runs r WHERE r.id = run_id AND r.tenant_id = current_setting('app.tenant_id')::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY imp_overrides_tenant ON imp_overrides USING (EXISTS (SELECT 1 FROM imp_runs r WHERE r.id = run_id AND r.tenant_id = current_setting('app.tenant_id')::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY imp_results_tenant ON imp_results USING (EXISTS (SELECT 1 FROM imp_runs r WHERE r.id = run_id AND r.tenant_id = current_setting('app.tenant_id')::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY imp_costs_tenant ON imp_costs USING (EXISTS (SELECT 1 FROM imp_runs r WHERE r.id = run_id AND r.tenant_id = current_setting('app.tenant_id')::uuid)); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Provider analytics
CREATE OR REPLACE VIEW provider_import_metrics AS
SELECT date_trunc('day', r.created_at) AS day,
       count(*) AS imports,
       coalesce(sum((c.breakdown_jsonb->>'ai_cents')::int),0) AS ai_cents,
       coalesce(sum((c.breakdown_jsonb->>'infra_cents')::int),0) AS infra_cents,
       coalesce(sum(r.cost_cents),0) AS billed_cents
FROM imp_runs r
LEFT JOIN imp_costs c ON c.run_id=r.id
GROUP BY 1 ORDER BY 1 DESC;
