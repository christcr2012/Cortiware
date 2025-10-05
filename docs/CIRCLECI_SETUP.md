# CircleCI Setup Guide

**Last Updated:** 2025-01-15

---

## 🎯 **WHAT THIS DOES**

CircleCI will automatically:
- ✅ Test your code on every push (all branches)
- ✅ Run type checking, linting, and builds
- ✅ Deploy to Vercel when you push to `main`
- ✅ Catch errors before they reach production

---

## 📋 **STEP-BY-STEP SETUP**

### **Step 1: Connect GitHub to CircleCI**

1. Go to [CircleCI](https://circleci.com/)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Sign up with GitHub"**
4. Authorize CircleCI to access your GitHub account

---

### **Step 2: Add Your Project**

1. Once logged in, click **"Projects"** in the left sidebar
2. Find **"StreamFlow"** in the list
3. Click **"Set Up Project"**
4. Choose **"Fastest"** option (we already have config file)
5. Click **"Set Up Project"**

CircleCI will automatically detect `.circleci/config.yml` in your repo!

---

### **Step 3: Configure Advanced Settings**

1. Click on your project **"StreamFlow"**
2. Click **"Project Settings"** (gear icon)
3. Click **"Advanced"** in the left sidebar
4. You'll see these options - configure them:

```
✅ VCS Status Updates: ON (default - leave it)
✅ Auto-cancel redundant workflows: ON (turn this ON)
❌ Enable dynamic config using setup workflows: OFF (leave it off)
❌ Disable SSH Reruns for this project: OFF (leave it off)
❌ Allow triggering pipelines with unversioned config: OFF (leave it off)
```

**What to do:**
- Turn ON: **"Auto-cancel redundant workflows"**
- Leave everything else at default

That's it! The old options (build forked PRs, etc.) are no longer in the UI.

---

### **Step 4: Get Vercel Credentials**

You need 3 values from Vercel:

#### **A. Get VERCEL_TOKEN:**
1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it: `CircleCI Deployment`
4. Scope: **Full Account**
5. Click **"Create"**
6. **Copy the token** (you won't see it again!)

#### **B. Get VERCEL_ORG_ID and VERCEL_PROJECT_ID:**

**Option 1: From existing .vercel folder (if you've deployed before):**
```bash
# In your project directory
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Option 2: Link the project (if you haven't deployed):**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Check the file
cat .vercel/project.json
```

---

### **Step 5: Add Environment Variables to CircleCI**

1. In CircleCI, go to **Project Settings** → **Environment Variables**
2. Click **"Add Environment Variable"**
3. Add these three variables:

```bash
Name: VERCEL_TOKEN
Value: <paste-your-vercel-token>

Name: VERCEL_ORG_ID
Value: <paste-your-org-id>

Name: VERCEL_PROJECT_ID
Value: <paste-your-project-id>
```

**IMPORTANT:** 
- Don't include quotes
- Don't include `<` or `>`
- Just paste the raw values

---

### **Step 6: Test the Pipeline**

1. Make a small change to any file (or create a test commit):
```bash
git commit --allow-empty -m "test: trigger CircleCI pipeline"
git push
```

2. Go to CircleCI → **Pipelines**
3. You should see your pipeline running!
4. Click on it to see the progress

---

## ✅ **WHAT TO EXPECT**

### **On ANY Branch Push:**

```
Pipeline: test-all-branches
├─ Install Dependencies (30-60 seconds)
├─ Generate Prisma Client (10 seconds)
├─ TypeScript Type Check (20 seconds)
├─ ESLint Check (15 seconds)
├─ Build Application (60-90 seconds)
└─ Run Tests (10 seconds)

Total Time: ~3-4 minutes
```

### **On MAIN Branch Push:**

```
Pipeline: deploy-production
├─ [All tests from above]
└─ Deploy to Vercel (60-90 seconds)

Total Time: ~5-6 minutes
```

---

## 🎨 **CIRCLECI DASHBOARD**

After setup, you'll see:

**Green ✅** = All tests passed
**Red ❌** = Tests failed (check logs)
**Yellow 🟡** = Pipeline running

Click on any pipeline to see:
- Detailed logs for each step
- Error messages (if any)
- Build artifacts
- Test results

---

## 🚨 **TROUBLESHOOTING**

### **Problem: "No config file found"**

**Solution:**
- Make sure `.circleci/config.yml` exists in your repo
- Make sure it's committed and pushed
- Try re-running the pipeline

---

### **Problem: "VERCEL_TOKEN not found"**

**Solution:**
1. Go to CircleCI → Project Settings → Environment Variables
2. Verify `VERCEL_TOKEN` is listed
3. If not, add it again
4. Re-run the pipeline

---

### **Problem: "Vercel deployment failed"**

**Solution:**
1. Check that `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
2. Check that `VERCEL_TOKEN` has correct permissions
3. Check Vercel dashboard for deployment errors
4. Check CircleCI logs for specific error message

---

### **Problem: "TypeScript errors"**

**Solution:**
1. Run `npm run typecheck` locally first
2. Fix any TypeScript errors
3. Commit and push again
4. Pipeline should pass

---

### **Problem: "Build failed"**

**Solution:**
1. Run `npm run build` locally first
2. Fix any build errors
3. Make sure all dependencies are in `package.json`
4. Commit and push again

---

## 📊 **MONITORING YOUR PIPELINE**

### **GitHub Integration:**

CircleCI will automatically:
- ✅ Show status checks on pull requests
- ✅ Show status checks on commits
- ✅ Block merging if tests fail (optional)

You'll see in GitHub:
```
✅ ci/circleci: test — Your tests passed on CircleCI!
✅ ci/circleci: deploy — Deployment successful!
```

---

## 💰 **CIRCLECI PRICING**

**Free Tier:**
- 6,000 build minutes per month
- Unlimited users
- Unlimited repositories

**Your Usage:**
- ~4 minutes per push (test only)
- ~6 minutes per main push (test + deploy)
- ~1,500 pushes per month on free tier

**Tip:** To save minutes, set "Only build on these branches" to `main`

---

## 🔧 **ADVANCED CONFIGURATION**

### **Add More Tests:**

Edit `.circleci/config.yml`:
```yaml
- run:
    name: Run Unit Tests
    command: npm run test:unit

- run:
    name: Run Integration Tests
    command: npm run test:integration
```

### **Add Database Tests:**

1. Add `DATABASE_URL` to CircleCI environment variables
2. Use a test database (not production!)
3. Run migrations in pipeline:
```yaml
- run:
    name: Run Migrations
    command: npx prisma migrate deploy
```

### **Add Notifications:**

CircleCI can notify you via:
- Email (built-in)
- Slack (add Slack orb)
- Discord (add webhook)

---

## 📚 **RELATED DOCUMENTATION**

- `.circleci/config.yml` - Pipeline configuration
- `docs/HOW_TO_UPLOAD_ENV_TO_VERCEL.md` - Vercel setup
- `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Deployment guide

---

## ✅ **CHECKLIST**

Before you start:
- [ ] GitHub account connected to CircleCI
- [ ] StreamFlow project added to CircleCI
- [ ] Triggers configured (auto-cancel ON, everything else OFF)
- [ ] VERCEL_TOKEN obtained from Vercel
- [ ] VERCEL_ORG_ID obtained from .vercel/project.json
- [ ] VERCEL_PROJECT_ID obtained from .vercel/project.json
- [ ] All 3 environment variables added to CircleCI
- [ ] Test commit pushed to trigger pipeline
- [ ] Pipeline runs successfully

---

**Ready to set up?** Follow the steps above and you'll have CI/CD in 10 minutes! 🚀

