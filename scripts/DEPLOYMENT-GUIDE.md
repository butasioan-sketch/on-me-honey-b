# 🚀 Deployment Guide - ON ME HONEY B

Komplette Anleitung für sichere Production Deployments.

## ⚡ Quick Deploy (wenn alles grün ist)

```bash
# 1. Pre-Check
./scripts/deployment-checklist.sh

# 2. Deploy
npx vercel --prod

# 3. Verify
./scripts/customer-testing/full-journey-test.sh --production
./scripts/health-check.sh --production
```

---

## 📋 Complete Deployment Process

### Phase 1: Pre-Deployment ✅

**Automatisiert:**

```bash
./scripts/deployment-checklist.sh
```

**Prüft:**

- ✅ Git Status (clean, synced)
- ✅ TypeScript (0 errors)
- ✅ ESLint (0 errors)
- ✅ Tests (alle grün)
- ✅ Build artifacts
- ✅ Environment vars
- ✅ Security (CSP, keine secrets)
- ✅ Customer Journeys (lokal)

**Erwartung:** ALLE GRÜN = Ready to deploy!

---

### Phase 2: Deployment 🚀

```bash
npx vercel --prod
```

**Was passiert:**

1. Code wird zu Vercel hochgeladen
2. Dependencies werden installiert
3. Build läuft (`npm run build`)
4. 176 Seiten werden generiert
5. Deployment bekommt URL
6. Deployment wird live geschaltet

**Dauer:** ~2-3 Minuten

**Output:** Vercel gibt URL des neuen Deployments

---

### Phase 3: Post-Deployment Verification ✅

**1. Customer Journey Test:**

```bash
./scripts/customer-testing/full-journey-test.sh --production
```

**Erwartet:** 27/27 Checks PASSING ✅

**2. Health Check:**

```bash
./scripts/health-check.sh --production
```

**Erwartet:** 19/19 Checks PASSING ✅

**3. Manual Spot Check:**

- Öffne: https://on-me-honey-b.vercel.app
- Prüfe: Homepage lädt
- Prüfe: Fotos laden (keine 404)
- Prüfe: /product/1 funktioniert
- Prüfe: 3D Viewer startet

---

## 🔄 Rollback (bei Problemen)

```bash
# 1. Via Vercel Dashboard
# → Gehe zu vercel.com/dashboard
# → Finde vorheriges Deployment
# → Klicke "Promote to Production"

# 2. Via CLI
vercel rollback
```

---

## ⚠️ Häufige Probleme

### Problem: Build Failed

**Lösung:**

```bash
npm run build  # Lokal testen
# Fix errors
git commit -m "fix: Build errors"
git push
```

### Problem: Tests Failing

**Lösung:**

```bash
npm test  # Lokal laufen lassen
# Fix failing tests
git commit -m "fix: Tests"
git push
```

### Problem: Environment Variables Missing

**Lösung:**

```bash
vercel env ls  # Zeigt alle Env Vars
vercel env add VARIABLE_NAME  # Fügt neue hinzu
```

---

## 📊 Deployment Checklist (Manual)

**Vor jedem Deploy:**

- [ ] Alle Tests grün?
- [ ] TypeScript kompiliert?
- [ ] ESLint 0 errors?
- [ ] Git committed & pushed?
- [ ] Customer journey lokal getestet?

**Nach jedem Deploy:**

- [ ] Customer journey production test grün?
- [ ] Health check grün?
- [ ] Homepage manuell geprüft?
- [ ] Keine 404 errors?
- [ ] 3D Viewer funktioniert?

---

## 🎯 Best Practices

### DO ✅

- Immer Pre-Check laufen lassen
- Nach Deploy sofort verifizieren
- Customer journey tests nutzen
- Bei Problemen sofort rollback
- Deployment URLs speichern

### DON'T ❌

- Deployen mit failing tests
- Deployen ohne pre-check
- Secrets in Code committen
- Production ohne verification
- Panic bei Fehlern (rollback!)

---

## 📈 Monitoring

**Regelmäßig laufen lassen:**

```bash
# Täglich
./scripts/health-check.sh --production

# Bei Problemen
./scripts/customer-testing/full-journey-test.sh --production
```

**Alerts setzen:**

- Vercel sendet Notifications bei Build Failures
- Health check kann in Cron laufen
- Customer journey tests → CI/CD

---

## 💎 Success Criteria

**Perfekter Deploy:**

```
✅ Pre-check: ALL GREEN
✅ Build: SUCCESS
✅ Customer Journey: 27/27
✅ Health Check: 19/19
✅ Manual Spot Check: OK
```

**= ZERO ERRORS! 🎯**

---

## 🆘 Emergency Contacts

**Bei kritischen Problemen:**

1. Sofort rollback
2. Tests lokal laufen lassen
3. Issues fixen
4. Neu deployen

**Vercel Support:**

- Dashboard: vercel.com/dashboard
- Docs: vercel.com/docs
- Status: vercel-status.com

---

**Happy Deploying! 🚀**
