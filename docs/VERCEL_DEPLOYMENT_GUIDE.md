# Vercel Deployment Guide

**Date:** 2025-10-05  
**Status:** ✅ Build Passing Locally

## Current Status

✅ **Local Build:** Passing  
✅ **TypeScript:** No errors  
✅ **Next.js 15.5.4:** App Router fully functional  
⚠️ **Vercel Deployment:** Needs environment variables

---

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **PostgreSQL Database** (Neon, Supabase, or other provider)
2. **Vercel Account** with project connected to GitHub
3. **Environment Variables** ready to configure

---

## Required Environment Variables

### 1. Database (REQUIRED)

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

**Where to get it:**
- **Neon:** Dashboard → Connection String → Pooled Connection
- **Supabase:** Project Settings → Database → Connection String (Transaction mode)
- **Railway:** Database → Connect → PostgreSQL Connection URL

### 2. Federation Flags (Optional)

```bash
FED_ENABLED=false
FED_OIDC_ENABLED=false
```

**Default:** Both are `false` if not set.

### 3. Authentication Credentials (Development/Testing)

For local development and testing, you can set these in Vercel:

```bash
# Provider credentials (environment-based)
PROVIDER_EMAIL=admin@example.com
PROVIDER_PASSWORD=your-secure-password

# Developer credentials (environment-based)
DEVELOPER_EMAIL=dev@example.com
DEVELOPER_PASSWORD=your-secure-password

# Accountant credentials (environment-based)
ACCOUNTANT_EMAIL=accountant@example.com
ACCOUNTANT_PASSWORD=your-secure-password
```

**Note:** These are placeholders. In production, use OIDC authentication.

---

## Vercel Configuration Steps

### Step 1: Set Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `FED_ENABLED` | `false` | Production, Preview, Development |
| `FED_OIDC_ENABLED` | `false` | Production, Preview, Development |

### Step 2: Run Database Migrations

After setting `DATABASE_URL`, you need to run Prisma migrations:

**Option A: Using Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Using Prisma Data Platform**
- Connect your database to Prisma Data Platform
- Run migrations from the dashboard

**Option C: Manual SQL**
- Export your schema: `npx prisma migrate diff --to-schema-datamodel prisma/schema.prisma --script > migration.sql`
- Run the SQL against your database

### Step 3: Trigger Deployment

1. Push your latest code to GitHub:
   ```bash
   git push origin main
   ```

2. Vercel will automatically deploy

3. Check deployment logs for any errors

### Step 4: Verify Deployment

Once deployed, test these endpoints:

1. **Root:** `https://your-app.vercel.app/` → Should redirect to `/login`
2. **Login:** `https://your-app.vercel.app/login` → Should show login page
3. **API Health:** `https://your-app.vercel.app/api/v2/me` → Should return 401 (not authenticated)

---

## Build Configuration

The project uses the following build settings (already configured in `package.json`):

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

**Important:** The build script does NOT run `prisma migrate deploy` to avoid issues with Vercel's build environment. Migrations must be run separately.

---

## Common Issues & Solutions

### Issue 1: "Prisma Client not generated"

**Solution:**
- The build script includes `prisma generate`
- If still failing, add `postinstall` script:
  ```json
  "postinstall": "prisma generate"
  ```

### Issue 2: "DATABASE_URL not found"

**Solution:**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Make sure it's enabled for all environments (Production, Preview, Development)
- Redeploy after adding the variable

### Issue 3: "Table does not exist"

**Solution:**
- Run migrations against your database:
  ```bash
  npx prisma migrate deploy
  ```
- Or use Prisma Studio to create tables manually

### Issue 4: "Build succeeds but runtime errors"

**Solution:**
- Check Vercel function logs for runtime errors
- Ensure all environment variables are set correctly
- Verify database connection string is correct

### Issue 5: ".next directory too large"

**Solution:**
- Already handled: `.gitignore` excludes `.next/` and `node_modules/`
- If still occurring, run: `git rm -r --cached .next node_modules`

---

## Database Schema

The application uses the following Prisma schema:

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  ownerId     String
  brandConfig Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
  leads       Lead[]
}

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String?
  roles          String[]
  orgId          String
  organization   Organization @relation(fields: [orgId], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model Lead {
  id             String       @id @default(cuid())
  name           String
  email          String?
  phone          String?
  status         String       @default("new")
  orgId          String
  createdBy      String
  organization   Organization @relation(fields: [orgId], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

---

## Seed Data (Optional)

To populate your database with test data:

1. Create `prisma/seed.ts` (if not exists)
2. Run: `npx prisma db seed`

Example seed data:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      ownerId: 'user_test',
      brandConfig: {
        name: 'Test Org',
        color: '#10b981',
        logoUrl: null,
      },
    },
  });

  // Create user
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      roles: ['owner'],
      orgId: org.id,
    },
  });

  console.log('Seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Monitoring & Debugging

### Vercel Logs

1. Go to your deployment in Vercel dashboard
2. Click on **Functions** tab
3. View real-time logs for each API route

### Prisma Studio

View and edit database data:
```bash
npx prisma studio
```

### Local Testing

Test the production build locally:
```bash
npm run build
npm start
```

---

## Next Steps

After successful deployment:

1. ✅ **Test all authentication flows**
   - Client login (`/login`)
   - Provider login (`/provider/login`)
   - Developer login (`/developer/login`)
   - Accountant login (`/accountant/login`)

2. ✅ **Verify portal access**
   - Client dashboard (`/dashboard`)
   - Provider portal (`/provider`)
   - Developer portal (`/developer`)
   - Accountant portal (`/accountant`)

3. ✅ **Test API endpoints**
   - `/api/v2/me` - User info
   - `/api/v2/leads` - CRM leads
   - `/api/fed/providers/tenants` - Federation API

4. ✅ **Configure custom domain** (optional)
   - Add domain in Vercel settings
   - Update DNS records
   - Enable SSL

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure database is accessible from Vercel
4. Review this guide for common solutions

---

## Summary

✅ **Build:** Passing locally  
✅ **TypeScript:** No errors  
✅ **Next.js:** 15.5.4 with App Router  
✅ **Database:** Prisma + PostgreSQL  
⚠️ **Action Required:** Set `DATABASE_URL` in Vercel environment variables

Once `DATABASE_URL` is configured, the deployment should succeed automatically.

