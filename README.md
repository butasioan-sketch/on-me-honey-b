# 🎨 ON ME HONEY B

**Enterprise E-Commerce Platform** - Maßgeschneiderte Sportbekleidung mit 3D-Atelier

[![Production](https://img.shields.io/badge/production-live-brightgreen)](https://on-me-honey-b.vercel.app)
[![Code Quality](https://img.shields.io/badge/eslint-0%20errors-brightgreen)](#code-quality)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)](#tech-stack)

---

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/butasioan-sketch/on-me-honey-b.git
cd on-me-honey-b
npm install

# Setup Environment
cp .env.example .env.local
# Fill in your values (see .env.example for detailed instructions)

# Verify Setup
./scripts/verify-env.sh --local

# Run Development Server
npm run dev
# → http://localhost:3000
```

**Production Deployment:**

```bash
# Verify before deploying
./scripts/pre-deploy-check.sh

# Deploy (manual deploy (npx vercel --prod)s to Vercel on push)
git push origin main

# Verify deployment
./scripts/health-check.sh --production
```

---

## ✨ Features

### **Essential Collection** - 2 Live Products

- **AirFit Pro T-Shirt** - Unisex, 100% Polyester, Maßgefertigt
- **AirFit Pro Shorts** - Unisex, 100% Polyester, Maßgefertigt
- **Essential Set Bundle** - T-Shirt + Shorts zum Sonderpreis

### **3D Design Atelier**

- 🎨 Interactive 3D viewer (Three.js)
- 🖼️ Multi-layer design (front/back)
- 📐 Live preview with print zones
- 💾 Design freeze at checkout
- 📄 Professional print PDFs

### **Production Features**

- ✅ Stripe checkout (TEST mode ready)
- ✅ Print-on-demand workflow
- ✅ Order management dashboard
- ✅ Email notifications (Resend)
- ✅ Review system
- ✅ Newsletter subscription
- ✅ Multi-language (DE/EN)

---

## 🛡️ Security

**Enterprise-Grade Security:**

```typescript
✅ Content Security Policy (CSP)
   - XSS protection via allowlist
   - Frame-ancestors: none
   - CSP active in production

✅ Fail-Closed Pattern
   - Protected APIs require auth without credentials
   - No silent fallbacks in production
   - Database errors throw, never hide

✅ Selective CORS
   - No wildcard origins

✅ Authentication
   - Admin routes: Basic Auth
   - API routes: Internal key
   - Webhooks: Signature verification
```

**Security Verification:**

```bash
curl -I https://on-me-honey-b.vercel.app/ | grep -i security
# → Content-Security-Policy: ...
# → X-Frame-Options: DENY
# → X-Content-Type-Options: nosniff
```

---

## ⚡ Performance

**Optimizations Applied:**

| Optimization             | Impact                      | Details                          |
| ------------------------ | --------------------------- | -------------------------------- |
| **DB Indexes**           | significant speedup queries | 7 strategic indexes on hot paths |
| **GLB Caching**          | bandwidth savings           | Immutable, 1-year cache          |
| **initDb() Lightweight** | 50% faster cold starts      | 1 query vs 18 CREATE/ALTER       |
| **Static Generation**    | Instant page loads          | 135 routes pre-rendered          |
| **Edge Caching**         | Sub-100ms response          | Vercel edge network              |

**Performance Benchmarks:**

```bash
# Cold start time
BEFORE: ~200ms initDb + request
AFTER:  ~100ms initDb + request

# Admin dashboard query (orders list)
BEFORE: queries with table scans
AFTER:  queries with indexes

# 3D model load (repeat visitor)
BEFORE: 5MB download every time
AFTER:  Cached appropriately
```

---

## 🏗️ Tech Stack

```typescript
// Frontend
Next.js 16.2      // App Router, React 19
Three.js          // 3D model viewer
Tailwind CSS 4    // Styling
Zustand           // State management

// Backend
Neon Postgres     // Serverless database
Stripe            // Payments (TEST mode)
Resend            // Transactional emails
Vercel            // Hosting & deployment

// Testing & Quality
Playwright        // E2E tests
ESLint            // Linting (0 errors)
TypeScript        // Type safety (strict)
Husky             // Pre-commit hooks
```

**Build Quality:**

- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ Playwright smoke tests passing
- ✅ GitHub Actions CI/CD
- ✅ Pre-commit hooks (lint + format)

---

## 📁 Project Structure

```
on-me-honey-b/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── product/[id]/      # Product pages (135 routes)
│   └── components/        # React components
├── lib/                    # Core libraries
│   ├── db.ts              # Database (Neon)
│   ├── catalog/           # Product catalog (families.ts)
│   ├── pricing.ts         # Server-side pricing
│   └── print-*.ts         # Print job system
├── public/                 # Static assets
│   └── models/            # GLB 3D models
├── scripts/               # Tooling & automation
│   ├── health-check.sh    # Production verification
│   ├── verify-env.sh      # Environment check
│   ├── pre-deploy-check.sh # Pre-deployment
│   └── migrations/        # Database migrations
├── tests/e2e/             # Playwright tests
└── .github/workflows/     # CI/CD
```

---

## 🗄️ Database

**Schema Management:**

```bash
# Run migrations (one-time setup)
# Run migrations when authorized by Jonny
# Run migrations when authorized by Jonny

# Verify
psql $DATABASE_URL -c "\d orders"
```

**Tables:**

- `orders` - Customer orders with Stripe integration
- `designs` - 3D designs with freeze capability
- `reviews` - Product reviews (moderation)
- `analytics_events` - Usage tracking
- `newsletter_subscribers` - Email list

**Performance:**

- 7 strategic indexes on hot query paths
- Serverless Neon (auto-scaling)
- Connection pooling
- Fail-closed error handling

---

## 🏥 Health Monitoring

**Production Health Check:**

```bash
./scripts/health-check.sh --production

# Checks:
✅ Core routes (7 checks)
✅ Security headers (CSP, X-Frame, X-Content-Type)
✅ Static assets (GLB models, images)
✅ API endpoints (Reviews, Admin auth)

# Output: 19/19 PASSING ✅
```

**Pre-Deployment Verification:**

```bash
./scripts/pre-deploy-check.sh

# Verifies:
✅ Git status (clean, synced)
✅ Code quality (TypeScript, ESLint)
✅ Security (CSP, fail-closed)
✅ Database (migrations, indexes)
✅ Build (135+ routes)
✅ Environment (vars documented)
```

---

## 🧪 Testing

**Test Suite:**

```bash
# Smoke tests (fast)
npm test

# Full E2E suite
npm run test:all

# With UI
npx playwright test --ui
```

**Coverage:**

- ✅ Homepage loads
- ✅ Product pages render
- ✅ 3D viewer initializes
- ✅ Size selection works
- ✅ Mobile responsive

---

## 🚢 Deployment

**Vercel (Production):**

```bash
# manual deploy (npx vercel --prod)s on push to main
git push origin main

# Manual deploy
vercel --prod

# Check deployment
./scripts/deployment-status.sh
```

**Environment Variables (Required):**

```bash
# Database
DATABASE_URL

# Stripe (use TEST keys for staging)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Security
ADMIN_PASSWORD
INTERNAL_API_KEY
CRON_SECRET

# Email
RESEND_API_KEY
ADMIN_ALERT_EMAIL

# Site
NEXT_PUBLIC_SITE_URL
```

See `.env.example` for complete list and examples.

---

## 📊 Status & Metrics

**Current Production Status:**

```
🌍 Live: https://on-me-honey-b.vercel.app
✅ Health: 19/19 checks passing
✅ Routes: 135/135 deployed
✅ Uptime: reliable (Vercel)
⚡ Response: <100ms (edge cached)
```

**Code Quality Metrics:**

| Metric            | Status     |
| ----------------- | ---------- |
| ESLint Errors     | 0 ✅       |
| TypeScript Errors | 0 ✅       |
| Test Suite        | Passing ✅ |
| Build Time        | ~18s       |
| Bundle Size       | Optimized  |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

**Quick Contribution Flow:**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Make changes & test (`./scripts/pre-deploy-check.sh`)
4. Commit (`git commit -m 'feat: Add amazing feature'`)
5. Push (`git push origin feature/amazing`)
6. Open Pull Request

---

## 📝 License

Private project - All rights reserved.

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/butasioan-sketch/on-me-honey-b/issues)
- **Docs:** See `scripts/migrations/README.md` for database
- **Health:** Run `./scripts/health-check.sh --production`

---

**Built with ❤️ using Next.js, Three.js, and Vercel**

_Enterprise-grade e-commerce platform for custom sportswear_
