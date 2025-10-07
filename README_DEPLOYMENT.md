# 🚀 Cortiware Deployment Guide

**Welcome!** This guide will help you deploy your Cortiware monorepo to production.

---

## 📋 Quick Start

**Total Time**: ~2 hours  
**Difficulty**: Intermediate  
**Prerequisites**: Domains purchased, Vercel account created

### Step-by-Step Checklist

1. **[ ] Domain Setup** (~30 min)
   - 📖 See: `docs/DOMAIN_SETUP_GUIDE.md`
   - Add domains to Vercel projects
   - Configure DNS records
   - Verify SSL certificates

2. **[ ] Environment Variables** (~45 min)
   - 📖 See: `docs/USER_ACTION_GUIDE.md` Part 2
   - Generate secrets (HMAC, cookies, password hashes)
   - Add to Vercel projects
   - Redeploy apps

3. **[ ] Database Setup** (~15 min)
   - 📖 See: `docs/USER_ACTION_GUIDE.md` Part 3
   - Create Vercel Postgres (or external)
   - Run migrations
   - Seed initial data

4. **[ ] Verify Everything** (~15 min)
   - 📖 See: `docs/USER_ACTION_GUIDE.md` Part 4
   - Test provider portal
   - Test tenant app
   - Test SSO flow

5. **[ ] Phase 2 Setup - KV** (~15 min)
   - 📖 See: `docs/USER_ACTION_GUIDE.md` Part 5
   - Create Vercel KV
   - Connect to tenant-app
   - Verify working

---

## 📚 Documentation Index

### For You (User Actions)
- **`docs/USER_ACTION_GUIDE.md`** - What YOU need to do (start here!)
- **`docs/DOMAIN_SETUP_GUIDE.md`** - Step-by-step domain configuration
- **`docs/ENVIRONMENT_VARIABLES.md`** - Complete env var reference

### For Developers (Technical Details)
- **`docs/COMPLETE_IMPLEMENTATION_SUMMARY.md`** - Full Phase 1 + 2 summary
- **`docs/PHASE_2_IMPLEMENTATION.md`** - Phase 2 technical details
- **`docs/IMPLEMENTATION_SUMMARY.md`** - Phase 1 technical details
- **`docs/MONOREPO_GUIDE.md`** - Monorepo best practices
- **`docs/THEME_ARCHITECTURE.md`** - Theme system architecture

### For Operations
- **`docs/runbooks/SSO_OUTAGE_RECOVERY.md`** - Emergency procedures
- **`ops/vercel/MY_DEPLOYMENT_GUIDE.md`** - Vercel deployment details

---

## 🎯 What's Been Built

### Phase 1: Monorepo-First Architecture ✅
- ✅ Shared theme system (`@cortiware/themes`)
- ✅ Shared auth logic (`@cortiware/auth-service`)
- ✅ Shared database client (`@cortiware/db`)
- ✅ 27 themes across 9 categories
- ✅ SSO authentication with emergency access
- ✅ Direct access banner and restrictions
- ✅ Comprehensive audit logging

### Phase 2: Production Enhancements ✅
- ✅ KV/Redis integration (`@cortiware/kv`)
- ✅ Distributed nonce store (multi-instance safe)
- ✅ Refresh token system (15 min access + 7 day refresh)
- ✅ Optional token rotation
- ✅ Session validation in KV
- ✅ Fully horizontally scalable

---

## 🏗️ Architecture

```
Cortiware Monorepo (Turborepo)
│
├── Apps (4)
│   ├── provider-portal      → Provider admin portal
│   ├── tenant-app            → Multi-tenant client app
│   ├── marketing-robinson    → Robinson marketing site
│   └── marketing-cortiware   → Cortiware marketing site
│
├── Shared Packages (4)
│   ├── @cortiware/themes     → CSS + theme metadata (27 themes)
│   ├── @cortiware/auth-service → Auth logic (SSO, TOTP, cookies)
│   ├── @cortiware/db         → Prisma client singleton
│   └── @cortiware/kv         → KV/Redis operations
│
└── Documentation (10+ guides)
```

---

## 🔐 Security Features

- ✅ HMAC-signed SSO tickets (120s expiry)
- ✅ Nonce-based replay protection (KV-backed)
- ✅ Short-lived access tokens (15 min)
- ✅ Long-lived refresh tokens (7 days)
- ✅ Optional token rotation
- ✅ Rate limiting on auth endpoints
- ✅ Comprehensive audit logging
- ✅ Emergency Provider/Developer access
- ✅ IP allowlisting (optional)
- ✅ TOTP 2FA support

---

## 📊 Build Status

All builds passing:
```
✓ provider-portal (19.4s)
✓ tenant-app (12.2s)
✓ @cortiware/themes
✓ @cortiware/auth-service
✓ @cortiware/db
✓ @cortiware/kv
```

---

## 💰 Estimated Costs

### Development (Free Tier)
- Vercel Hosting: Free
- Vercel Postgres: Free (256 MB)
- Vercel KV: Free (10K commands/day)
- **Total**: $0/month

### Small Production (1000 users)
- Vercel Pro: $20/month
- Postgres: $10-20/month
- KV: Free tier sufficient
- **Total**: $30-40/month

### Medium Production (10,000 users)
- Vercel Pro: $20/month
- Postgres: $50-100/month
- KV: $10-20/month
- **Total**: $80-140/month

---

## 🎓 Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo 2.5.8
- **Database**: PostgreSQL + Prisma
- **Cache**: Vercel KV (Redis)
- **Auth**: Custom SSO + JWT
- **Styling**: Tailwind CSS + CSS Variables
- **Deployment**: Vercel
- **Language**: TypeScript

---

## ✅ Success Criteria

After deployment, verify:

- [ ] All 4 domains working with SSL
- [ ] Provider portal login works
- [ ] Tenant app login works
- [ ] Theme switcher works in both apps
- [ ] SSO flow works (provider → tenant)
- [ ] Emergency access works (if enabled)
- [ ] Database connected and seeded
- [ ] Vercel KV connected and working
- [ ] No errors in deployment logs
- [ ] All builds passing

---

## 🆘 Need Help?

### Common Issues

**Domain not working?**
→ See `docs/DOMAIN_SETUP_GUIDE.md` troubleshooting section

**Build failing?**
→ Check Vercel logs, verify environment variables

**Auth not working?**
→ Verify `AUTH_TICKET_HMAC_SECRET` is identical in both apps

**KV not working?**
→ Check Vercel KV is connected, check logs for "Using Vercel KV"

### Support Resources

- **Documentation**: Check `docs/` folder
- **Vercel Support**: Dashboard → Help → Contact Support
- **Domain Issues**: Contact your registrar's support
- **Community**: Vercel Discord, GitHub Discussions

---

## 🚀 Next Steps After Deployment

1. **Monitor**: Set up alerts for errors and downtime
2. **Analytics**: Add Google Analytics or Plausible
3. **Email**: Configure SendGrid for transactional emails
4. **Backups**: Set up automated database backups
5. **Testing**: Add E2E tests with Playwright
6. **CI/CD**: Set up GitHub Actions for automated testing
7. **Monitoring**: Add Sentry for error tracking

---

## 🔮 Future Roadmap

### Phase 3: Single-Tenant Portals
- Dedicated Provider/Developer UIs in tenant-app
- Emergency toolkit MVP
- Enhanced permissions

### Phase 4: Advanced Features
- Multi-device session management
- Suspicious activity detection
- Advanced analytics

### Phase 5: Multi-Region
- Global deployment
- CDN optimization
- Performance monitoring

---

## 📝 Git Commits

All work has been committed and pushed:

- ✅ **Phase 1**: `feat: complete Phase 1 - monorepo-first theme system, auth, and shared packages`
- ✅ **Phase 2**: `feat: implement Phase 2 - KV nonce store and refresh tokens`
- ✅ **Docs**: `docs: add comprehensive user guides for deployment and domain setup`

---

## 🎉 You're Ready!

Everything is built and ready for deployment. Follow the guides in order:

1. Start with `docs/USER_ACTION_GUIDE.md`
2. Follow the checklist step-by-step
3. Refer to detailed guides as needed
4. Verify everything works
5. You're live! 🚀

**Good luck with your deployment!**

