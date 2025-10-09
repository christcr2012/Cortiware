# Emergency Access & Federation Roadmap

> Current configuration context: Emergency access is DISABLED in Production, ENABLED in Development/Preview for testing; portals are read-only by default; no TOTP configured; Provider/Developer emergency credential hashes already set in Vercel.

All tasks below are NOT_STARTED and organized by priority/category. This document persists the task list for future sessions.

---

## Parent Epic: Resilience & Emergency Access Improvement Plan

Master plan to improve federation reliability and prepare a safe, auditable emergency fallback.

- Current state/context:
  - Emergency access is DISABLED in Production and ENABLED only in Development and Preview for testing
  - Emergency portals are read-only by default
  - No TOTP required
  - Provider/Developer emergency credential hashes already set in Vercel
  - Scope includes federation resiliency, observability/alerts, security guardrails, tests, documentation, and (optional later) minimal emergency actions

Status: NOT_STARTED

---

### Category: Federation Resiliency (NOT_STARTED)

1) External health checks for federation endpoints (NOT_STARTED)
   - Set up multi-region external health checks (e.g., UptimeRobot/Pingdom/StatusCake) for critical federation/auth endpoints
   - Define success criteria (2xx), thresholds (p95 latency), and alert targets
   - Do not modify production traffic
   - Output: monitors created, alert routing documented

2) Define failover criteria and playbook (NOT_STARTED)
   - Document objective criteria to declare partial/full federation outage (error rate, latency, availability)
   - Specify manual/automated steps for failover and recovery, including communication flow
   - Output: living doc linked in runbook and on-call handbook

3) Maintenance banner feature flag + UI integration (NOT_STARTED)
   - Introduce a global feature flag to display a maintenance/incident banner across tenant UIs
   - Implement a small shared component in @cortiware/themes and wire to apps
   - Ensure banner can be toggled without redeploy
   - Output: flag, component, usage docs

4) Incident status page link in UIs (NOT_STARTED)
   - Surface a link to a public status/incident page (or placeholder) in the banner/component
   - Output: link, copy, and placement guidelines documented

5) Schedule monthly federation game-day drills (NOT_STARTED)
   - Define and schedule a 30-minute monthly drill to rehearse outage detection, comms, and recovery
   - Track outcomes and improvements
   - Output: calendar series + checklist template

---

### Category: Security & Observability (NOT_STARTED)

1) Notifications on emergency access events (NOT_STARTED)
   - Send Slack/Teams/Webhook notifications on successful emergency login and tenant selection
   - Include: actor email, role (provider/developer), tenantId, IP, user-agent, timestamp, correlationId
   - Ensure no secrets logged
   - Output: notifier service/module, environment configuration, and docs

2) Persist emergency access events to database AuditLog (NOT_STARTED)
   - Ensure emergency login attempts and tenant selections are persisted with full context (actor, role, orgId, ip, ua, ts, correlationId, result)
   - Define retention and build export/report (CSV or simple admin view)
   - Output: Prisma model updates if needed, write path, and query/report path

3) Distributed rate limiting for auth-emergency (NOT_STARTED)
   - Switch current auth-emergency rate limit to a distributed KV-backed limiter (per-IP, sliding window, e.g., 5/min)
   - Fail secure on store errors
   - Ensure headers return standard rate-limit info
   - Output: KV limiter utility, integration in endpoint, and tests

4) IP allowlist posture for emergency endpoints (NOT_STARTED)
   - Keep allowlist values in env for now; validate CIDR/IPv4 support and sanitize parsing
   - Document a later design for a small admin UI to manage IPs (out of scope to implement now)
   - Output: env validation, parsing utility, and design doc stub

5) Add /emergency/logout endpoint (NOT_STARTED)
   - Implement endpoint to clear emergency cookies (rs_emergency, rs_emergency_role, rs_active_tenant, rs_provider, rs_developer) and redirect to /emergency/provider with a message
   - Ensure cookie SameSite/HttpOnly flags mirror login
   - Output: Next.js route, tests, and docs

6) Middleware guard for emergency cookies (NOT_STARTED)
   - Add middleware to restrict acceptance of emergency cookies to /emergency/* routes only
   - Block attempts to use emergency auth on other routes
   - Provide clear 403/redirect UX and audit the violation
   - Output: middleware file, config, and tests

---

### Category: Testing (NOT_STARTED)

1) Unit/Integration tests for emergency flow (NOT_STARTED)
   - Cover: (1) emergency pages render, (2) EMERGENCY_LOGIN_ENABLED=false blocks access and redirects appropriately, (3) EMERGENCY_LOGIN_ENABLED=true permits flow, (4) rate-limits enforced for repeated attempts, (5) tenant selection sets rs_active_tenant and redirects to /emergency/dashboard
   - Output: test files, fixtures/mocks, and CI integration

2) Minimal E2E smoke tests (optional) (NOT_STARTED)
   - Create lightweight headless E2E checks to visit /emergency/provider and /emergency/tenants
   - Verify redirects and content, without using real secrets
   - Run on preview builds only
   - Output: E2E scripts and docs

3) Preview CI smoke job for emergency endpoints (NOT_STARTED)
   - Add a CI job that runs on preview deployments to hit /emergency/provider and /emergency/tenants and assert 200/redirect expectations
   - Do not run on production
   - Output: CI config changes and documentation

---

### Category: Documentation & Policy (NOT_STARTED)

1) Federation Outage Runbook (NOT_STARTED)
   - Create a detailed runbook for partial/full federation outages covering: detection signals, failover criteria, communication plan, emergency portal usage (dev/preview only), and recovery validation
   - Link to health checks and playbook tasks
   - Output: docs/security/FEDERATION_OUTAGE_RUNBOOK.md

2) Update Emergency Access Runbook (current flags) (NOT_STARTED)
   - Amend EMERGENCY_ACCESS_RUNBOOK.md to explicitly document current configuration: Production disabled; Development & Preview enabled for testing; no TOTP; read-only by default
   - Include steps to enable/disable via Vercel CLI and validation checks

3) Approval policy for enabling Production emergency access (NOT_STARTED)
   - Define who can enable prod emergency, required dual-approval, and how approvals are recorded (ticket/PR template)
   - Include backout steps and post-incident review requirements
   - Output: POLICY doc and PR/Ticket templates

4) Emergency Access FAQ (internal support) (NOT_STARTED)
   - Short FAQ for internal support: when to use emergency access, read-only limitations, how to request Production enablement, auditing expectations, and who to page
   - Output: docs/security/EMERGENCY_ACCESS_FAQ.md

5) Code comments/READMEs for emergency endpoints & middleware (NOT_STARTED)
   - Add inline code comments and READMEs explaining /api/auth/emergency, /api/emergency/select-tenant, (future) /emergency/logout, and middleware guards, including cookie names/TTL/flags
   - Output: README snippets colocated with routes/middleware

6) Deployment/config guide updates (NOT_STARTED)
   - Update deployment docs to cover EMERGENCY_LOGIN_ENABLED values per environment, how to change via Vercel CLI, and safe rollout/rollback
   - Clarify that Production remains disabled unless explicitly approved

---

### Category: Minimal Emergency Actions (Future, optional) (NOT_STARTED)

1) Unlock user / reset MFA (emergency action) (NOT_STARTED)
   - Add a narrowly-scoped emergency action to unlock a user or reset MFA when federation is down
   - Guardrails: emergency session TTL, IP allowlist, audit, notifications, optional dual-approval, read-logging, and post-action confirmation
   - Ship behind a feature flag and disabled in Production

2) Tenant maintenance banner toggle (emergency action) (NOT_STARTED)
   - Add a per-tenant maintenance banner toggle accessible only in emergency mode
   - Guardrails: same as above (TTL, IP allowlist, audit, notifications, optional dual-approval)
   - Disabled in Production by default
   - Ensure banner rendering is idempotent and clearly visible

3) Dual-approval workflow & notifications for emergency actions (NOT_STARTED)
   - Design an approval workflow for any write operation in emergency mode
   - Require a second approver, record approvals, send notifications, and enforce time limits
   - Provide rollback steps
   - Disabled in Production unless explicitly enabled

4) Ensure guardrails applied to emergency actions (NOT_STARTED)
   - Apply and verify session TTL (30–60 min), IP allowlist, per-action audit logging, and notifications for all emergency write actions
   - Add automated checks where possible
   - Document which guardrails are mandatory

