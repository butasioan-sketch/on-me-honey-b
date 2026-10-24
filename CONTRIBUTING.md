# Contributing to ON ME HONEY B

Thank you for your interest in contributing! This document provides guidelines and setup instructions.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Git
- PostgreSQL client (for migrations)

### Initial Setup

```bash
# 1. Fork & Clone
git clone https://github.com/YOUR_USERNAME/on-me-honey-b.git
cd on-me-honey-b

# 2. Install Dependencies
npm install

# 3. Setup Environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Verify Setup
./scripts/verify-env.sh --local

# 5. Run Development Server
npm run dev
```

---

## 🏗️ Development Workflow

### Branch Strategy

- `main` - Production branch (auto-deploys to Vercel)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Making Changes

```bash
# 1. Create Feature Branch
git checkout -b feature/your-feature-name

# 2. Make Changes
# ... edit files ...

# 3. Test Locally
npm run build        # TypeScript compilation
npm run lint         # ESLint check
npm test             # Smoke tests

# 4. Pre-Commit Check
./scripts/pre-deploy-check.sh

# 5. Commit
git add .
git commit -m "feat: Add your feature"
# Husky will run lint-staged automatically

# 6. Push & PR
git push origin feature/your-feature-name
# Open PR on GitHub
```

---

## 📋 Code Standards

### TypeScript

- **Strict mode** enabled
- No `any` types (use `unknown` if needed)
- Prefer interfaces over types for objects
- Document complex types

### React

- **Functional components** only
- Hooks at top level (before conditionals)
- Use `'use client'` directive for client components
- Prop types via TypeScript interfaces

### Naming Conventions

```typescript
// Files
ProductCard.tsx; // React components (PascalCase)
use - cart.ts; // Hooks (kebab-case with 'use-')
db.ts; // Utilities (kebab-case)

// Variables
const userId = "123"; // camelCase
const MAX_ITEMS = 10; // UPPER_SNAKE_CASE for constants
```

### ESLint

- **0 errors** required before commit
- Warnings are acceptable (will be addressed)
- Use `// eslint-disable-next-line` sparingly

---

## 🗄️ Database Changes

### Adding Migrations

```bash
# 1. Create Migration File
cat > scripts/migrations/002-your-change.sql << 'SQL'
-- Description of change
CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
SQL

# 2. Test Locally
psql $DATABASE_URL < scripts/migrations/002-your-change.sql

# 3. Verify
psql $DATABASE_URL -c "\d new_table"

# 4. Document in README
# Add to scripts/migrations/README.md
```

### Database Guidelines

- Use `IF NOT EXISTS` / `IF EXISTS` (idempotent)
- Add indexes for foreign keys and WHERE clauses
- Use `TIMESTAMPTZ` for timestamps
- Never drop tables in migrations (comment instead)

---

## 🧪 Testing

### Running Tests

```bash
# Smoke tests (fast)
npm test

# Full E2E suite
npm run test:all

# With UI (debug mode)
npx playwright test --ui

# Single test
npx playwright test tests/e2e/smoke.spec.ts
```

### Writing Tests

```typescript
// tests/e2e/your-feature.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Your Feature @smoke", () => {
  test("does something", async ({ page }) => {
    await page.goto("/your-page");
    await expect(page.locator("h1")).toBeVisible();
  });
});
```

### Test Guidelines

- Tag smoke tests with `@smoke`
- Test user flows, not implementation
- Use data-testid for reliable selectors
- Keep tests independent (no shared state)

---

## 🎨 Styling

### Tailwind CSS

```tsx
// Prefer Tailwind utilities
<div className="flex items-center gap-4 p-6 bg-white rounded-lg">

// For complex/repeated styles, extract to component
const Card = ({ children }) => (
  <div className="rounded-lg border bg-card p-6 shadow-sm">
    {children}
  </div>
);
```

### Design Tokens

- Colors: Use CSS variables (defined in app/globals.css)
- Spacing: Use Tailwind scale (4, 6, 8, 12, 16, 24)
- Typography: Use defined text-\* classes

---

## 🔒 Security Guidelines

### Secrets

- **Never** commit secrets to git
- Use environment variables (`.env.local`)
- Verify with: `./scripts/verify-env.sh --local`

### API Routes

```typescript
// Always validate in API routes
if (!process.env.ADMIN_PASSWORD) {
  return new NextResponse("Unauthorized", { status: 401 });
}

// Fail-closed in production
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !validCredentials) {
  throw new Error("Auth required");
}
```

### User Input

- Validate all user input server-side
- Use TypeScript types for validation
- Sanitize before database insertion

---

## 📦 Adding Dependencies

### Before Adding

1. Check if functionality exists in existing deps
2. Verify package is actively maintained
3. Check bundle size impact

### Process

```bash
# 1. Add dependency
npm install package-name

# 2. Update package.json
# (npm install does this automatically)

# 3. Document usage
# Add to relevant section in README.md

# 4. Commit
git add package.json package-lock.json
git commit -m "feat: Add package-name for X functionality"
```

---

## 🚢 Deployment

### Pre-Deployment Checklist

```bash
# Run comprehensive check
./scripts/pre-deploy-check.sh

# Must pass:
✅ Git status (clean, synced)
✅ TypeScript compilation
✅ ESLint (0 errors)
✅ Tests passing
✅ Security headers configured
✅ Database migrations exist
✅ Build successful
✅ Environment vars documented
```

### Deployment Process

```bash
# 1. Merge to main
git checkout main
git merge feature/your-feature
git push origin main

# 2. Vercel auto-deploys
# → Check https://vercel.com/dashboard

# 3. Verify deployment
./scripts/health-check.sh --production

# 4. Monitor
# → Check logs in Vercel dashboard
```

---

## 🐛 Bug Reports

### Creating an Issue

**Title:** Short, descriptive (e.g., "Product page 404 for SKU 051")

**Body:**

```markdown
## Description

What's wrong? (clear, specific)

## Steps to Reproduce

1. Go to ...
2. Click on ...
3. See error

## Expected Behavior

What should happen?

## Actual Behavior

What actually happens?

## Environment

- Browser: Chrome 120
- Device: Desktop
- URL: https://on-me-honey-b.vercel.app/product/051

## Screenshots

(if applicable)
```

---

## 💡 Feature Requests

### Proposing Features

1. **Check existing issues** first
2. **Describe the problem** you're solving
3. **Propose solution** (optional)
4. **Explain impact** (who benefits?)

**Example:**

```markdown
## Problem

Customers can't preview designs before checkout.

## Proposed Solution

Add "Preview" button that opens modal with final print layout.

## Impact

- Reduces returns (wrong placement)
- Increases customer confidence
- Improves UX
```

---

## 📚 Documentation

### Updating Docs

- **README.md** - User-facing features, setup
- **CONTRIBUTING.md** - Developer guidelines (this file)
- **Code comments** - Complex logic, non-obvious decisions
- **Migration READMEs** - Database changes

### Comment Guidelines

```typescript
// ❌ Don't state the obvious
const total = a + b; // Add a and b

// ✅ Do explain WHY
const total = a + b; // Bundle pricing: combine tee + shorts discount
```

---

## 🤝 Code Review

### As Author

- Keep PRs focused (one feature/fix)
- Write clear PR description
- Add screenshots for UI changes
- Respond to feedback promptly

### As Reviewer

- Be constructive and kind
- Focus on code quality, not style
- Approve when ready (don't block on nits)
- Use GitHub suggestions for fixes

---

## ⚡ Performance

### Optimization Checklist

- [ ] Use server components by default
- [ ] Add `'use client'` only when needed
- [ ] Optimize images (next/image)
- [ ] Lazy load heavy components
- [ ] Use React.memo() sparingly
- [ ] Profile before optimizing

### Measuring Performance

```bash
# Build analysis
npm run build

# Check bundle size in .next/static
ls -lh .next/static/chunks/

# Lighthouse (in browser DevTools)
# Target: 90+ on all metrics
```

---

## 🎯 Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `perf` - Performance improvement
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Tests
- `chore` - Build/tooling

### Examples

```
feat(checkout): Add bundle pricing for tee + shorts

Implements Essential Set bundle: 74.99€ for matching set.
Uses existing pricing.ts logic with isBundleEligible check.

Closes #123

---

fix(3d-viewer): Prevent texture memory leak on unmount

Dispose texture and geometry in useEffect cleanup.
Fixes browser crash after 10+ product views.

Closes #456
```

---

## 🆘 Getting Help

- **Question?** Open a GitHub Discussion
- **Bug?** Create an Issue
- **Urgent?** Contact maintainers directly

---

## ✅ Pull Request Checklist

Before submitting your PR:

- [ ] Code follows project style
- [ ] Tests pass (`npm test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Pre-deploy check passes (`./scripts/pre-deploy-check.sh`)
- [ ] Commits follow convention
- [ ] PR description is clear
- [ ] Screenshots added (if UI change)
- [ ] Docs updated (if needed)

---

**Thank you for contributing! 🎉**
