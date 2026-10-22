# 🔍 SENTRY ERROR MONITORING - SETUP INSTRUCTIONS

**Status:** Infrastructure prepared, awaiting DSN  
**Effort:** 5 minutes to activate

---

## ✅ WHAT'S ALREADY DONE:

### 1. Configuration Files Created:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Next.js integration
- `.env.sentry-example` - Environment variable template

### 2. Features Configured:
- ✅ Performance monitoring (tracesSampleRate: 1.0)
- ✅ Session replay (10% sample, 100% on errors)
- ✅ Error filtering (dev errors logged, not sent)
- ✅ Request context capture
- ✅ Privacy settings (mask text, block media)

---

## 📋 TO ACTIVATE (5 minutes):

### STEP 1: Create Sentry Account
1. Go to https://sentry.io
2. Sign up (free tier available)
3. Create a new "Next.js" project
4. Copy your DSN (looks like: `https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]`)

### STEP 2: Add Environment Variable

**Local (.env.local):**
```bash
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
```

**Vercel (Production):**
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN
# Paste your DSN when prompted
# Select: Production
```

### STEP 3: Install Package

```bash
npm install @sentry/nextjs
```

**Note:** Package installation currently failing due to npm cache issue.  
Retry after npm cache clear:
```bash
npm cache clean --force
npm install @sentry/nextjs
```

### STEP 4: Test

```bash
npm run build
npm run dev
# Trigger a test error
# Check Sentry dashboard
```

---

## 🎯 WHAT YOU'LL GET:

### Error Tracking:
- ✅ Real-time error notifications
- ✅ Stack traces with source maps
- ✅ User context (browser, OS, etc.)
- ✅ Breadcrumbs (user actions before error)
- ✅ Performance monitoring

### Session Replay:
- ✅ Video-like replay of user sessions
- ✅ See exactly what happened before error
- ✅ Privacy-safe (text masked)

### Alerts:
- ✅ Email/Slack notifications
- ✅ Error frequency tracking
- ✅ Release tracking
- ✅ User impact metrics

---

## 📊 CONFIGURATION DETAILS:

### Client Config (`sentry.client.config.ts`):
```typescript
- tracesSampleRate: 1.0 (100% of transactions)
- replaysSessionSampleRate: 0.1 (10% of sessions)
- replaysOnErrorSampleRate: 1.0 (100% when error occurs)
- Privacy: Text masked, media blocked
```

### Server Config (`sentry.server.config.ts`):
```typescript
- tracesSampleRate: 1.0
- beforeSend: Filters dev errors (logs only, not sent)
```

### Instrumentation:
```typescript
- Automatic Next.js integration
- onRequestError: Captures all server errors
- Context: Route, path, render type, etc.
```

---

## ⚠️ CURRENT STATUS:

**Package Installation:** ⏸ BLOCKED (npm cache issue)  
**Config Files:** ✅ COMPLETE  
**Ready to Activate:** YES (after package install)  

**To Complete:**
1. Fix npm cache issue (or retry later)
2. Install @sentry/nextjs
3. Add DSN to environment
4. Deploy

---

## 🔄 ALTERNATIVE ACTIVATION:

If npm install continues to fail:

1. Try yarn:
```bash
yarn add @sentry/nextjs
```

2. Or pnpm:
```bash
pnpm add @sentry/nextjs
```

3. Or wait for npm fix and retry later

---

**All infrastructure is ready! Just needs DSN + package install.**

