# Cortiware — Universal Monorepo (v4.1U)
Generated: 2025-10-08 06:13:47

This bundle makes **one set of app shells** (Admin web, Staff mobile, Customer portal)
and **one API gateway**, with verticals loaded as **plugin packs**. The Cleaning pack is included.

- Apps: `apps/admin`, `apps/staff-mobile`, `apps/customer-portal` (vertical-agnostic shells)
- API: `services/api` (loads vertical routers from `packages/verticals/*/apiRouter.ts`)
- Vertical packs: `packages/verticals/<key>` (UI routes + API router + metadata)
- Shared code: `shared/*`
- Jobs/workers: `jobs/worker` (BullMQ-ready stubs for permits/SAM/VSS)

Use `INSTALL.md` for quick start.
