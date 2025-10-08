# Install / Run (pnpm + turbo)
Prereqs: Node 18+, pnpm, Redis, Postgres.

1) Copy `.env.example` to `.env` and fill values.
2) Install deps:
   pnpm i
3) Start API:
   pnpm --filter @cortiware/api dev
4) Start Admin web:
   pnpm --filter @cortiware/admin dev
5) Start Customer portal:
   pnpm --filter @cortiware/portal dev
6) Start Staff mobile (Expo):
   pnpm --filter @cortiware/staff start
7) Start Worker:
   pnpm --filter @cortiware/worker dev
