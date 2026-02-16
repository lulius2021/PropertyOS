# Vercel Deployment Guide - PropertyOS App

**Quick Reference für Vercel Deployment der Next.js App**

---

## 🚀 Quick Start (für Eilige)

```bash
# 1. Push Code zu GitHub
git add .
git commit -m "fix: vercel deployment setup"
git push origin main

# 2. Vercel Dashboard öffnen
# → https://vercel.com/dashboard

# 3. Storage hinzufügen
# → Storage Tab → Postgres → Create → Frankfurt → Connect to Project

# 4. Build Command setzen (Vercel Settings)
# → Settings → General → Build & Development Settings
# → Build Command: prisma generate && prisma migrate deploy && pnpm build

# 5. Redeploy
# → Deployments → Latest → Redeploy
```

**Das war's!** ✅

---

## 📋 Detaillierte Anleitung

### Teil 1: Vercel Projekt Setup

#### 1.1 Neues Projekt erstellen

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **"Add New..." → "Project"**
3. **GitHub Repo importieren**: `propertyos` oder `DomOs.de`
4. **Framework Preset**: Next.js (automatisch erkannt)
5. **Root Directory**: `apps/app`

#### 1.2 Build & Development Settings

**WICHTIG**: Diese Settings sind kritisch für erfolgreichen Build!

```
Framework Preset: Next.js
Root Directory: apps/app

Build Command:
prisma generate && prisma migrate deploy && pnpm build

Output Directory: .next

Install Command:
pnpm install --frozen-lockfile

Development Command:
pnpm dev
```

**Warum `prisma generate` im Build?**
- Vercel führt `pnpm install` aus → `postinstall` generiert Prisma Client
- Falls `postinstall` fehlschlägt (Permission Issues), generiert Build Command erneut
- `prisma migrate deploy` führt Production Migrations aus

---

### Teil 2: Vercel Postgres einrichten

#### 2.1 Database erstellen

1. **Vercel Dashboard** → **Storage** Tab
2. **"Create Database"** → **Postgres**
3. **Region**: `Frankfurt (eu-central-1)` (DSGVO!)
4. **Name**: `propertyos-production`
5. **"Create"**

#### 2.2 Mit Projekt verbinden

1. **"Connect to Project"**
2. **Projekt auswählen**: `propertyos-app`
3. **Environment**: `Production`, `Preview`, `Development` (alle auswählen)
4. **"Connect"**

**Automatisch hinzugefügte Env Vars:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← **Wichtig! Wird als DATABASE_URL verwendet**
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### 2.3 DATABASE_URL setzen

**Vercel fügt automatisch hinzu:**
```
DATABASE_URL = $POSTGRES_PRISMA_URL
```

Falls nicht, manuell hinzufügen:
1. **Settings** → **Environment Variables**
2. **Add New**:
   - Key: `DATABASE_URL`
   - Value: `$POSTGRES_PRISMA_URL` (Reference)
   - Environment: Production, Preview, Development

---

### Teil 3: Weitere Environment Variables

**Required Variables** (Settings → Environment Variables):

| Variable | Value | Beschreibung |
|----------|-------|--------------|
| `NEXTAUTH_URL` | `https://app-propertyos.vercel.app` | NextAuth Base URL (später Custom Domain) |
| `NEXTAUTH_SECRET` | `<generiert>` | Session Secret (siehe unten) |
| `R2_ACCOUNT_ID` | `<CloudFlare>` | CloudFlare Account ID |
| `R2_ACCESS_KEY_ID` | `<CloudFlare>` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | `<CloudFlare>` | R2 Secret Key |
| `R2_BUCKET_NAME` | `propertyos-files` | R2 Bucket Name |

#### NEXTAUTH_SECRET generieren:

```bash
openssl rand -base64 32
```

Kopiere Output und füge als Env Var hinzu.

**Environment Scope** für ALLE Vars:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### Teil 4: Deployment durchführen

#### 4.1 Initial Deployment

1. **Vercel Dashboard** → **Deployments**
2. **"Deploy"** (wird automatisch getriggert nach GitHub Push)
3. **Build Logs beobachten**:
   - `pnpm install` → ✅
   - `postinstall: prisma generate` → ✅
   - `prisma migrate deploy` → ✅
   - `next build` → ✅

**Erwartete Dauer**: 2-4 Minuten

#### 4.2 Build Logs prüfen

**Erfolgreiche Build-Logs:**

```
Running "prisma generate"
✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client

Running "prisma migrate deploy"
2 migrations found in prisma/migrations
✔ Applied migrations: 20240101_init, 20240102_add_fields

Running "next build"
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

**Fehler? → Siehe "Troubleshooting" weiter unten**

---

### Teil 5: Custom Domain konfigurieren

#### 5.1 Domain hinzufügen

1. **Settings** → **Domains**
2. **"Add"** → `app.propertyos.de`
3. **DNS Records setzen** (bei Domain-Provider):

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

4. **SSL-Zertifikat**: Automatisch via Let's Encrypt (~5 Min)
5. **Verifizieren**: https://app.propertyos.de

#### 5.2 NEXTAUTH_URL aktualisieren

Nach Custom Domain:

1. **Settings** → **Environment Variables**
2. **NEXTAUTH_URL** editieren:
   - Old: `https://app-propertyos.vercel.app`
   - New: `https://app.propertyos.de`
3. **"Save"**
4. **Redeploy** (erforderlich nach Env-Var-Änderung!)

---

## 🛠️ Troubleshooting

### Error 1: "PrismaClient is unable to run in this browser environment"

**Symptom:**
```
PrismaClientInitializationError: PrismaClient is unable to run in this browser environment
```

**Ursache**: Prisma Client wurde nicht generiert vor Build

**Fix:**
```bash
# Lokal testen
cd apps/app
pnpm build

# Falls Fehler: package.json prüfen
# "postinstall": "prisma generate" ← muss vorhanden sein
# "build": "prisma generate && next build" ← muss vorhanden sein
```

**Vercel Settings prüfen:**
- Build Command: `prisma generate && prisma migrate deploy && pnpm build`

---

### Error 2: "Can't reach database server"

**Symptom:**
```
PrismaClientInitializationError: Can't reach database server at ...
```

**Ursache**: DATABASE_URL fehlt oder falsch

**Fix:**
1. **Vercel Dashboard** → **Storage** → **Postgres** Status prüfen
2. **Settings** → **Environment Variables** → `DATABASE_URL` prüfen
3. **Wert muss sein**: `$POSTGRES_PRISMA_URL` (Reference, nicht direkter String)
4. **Environment**: Production, Preview, Development (alle)
5. **Redeploy**

---

### Error 3: "Migration ... does not exist"

**Symptom:**
```
Error: Migration 20240101_init does not exist
```

**Ursache**: Migrations wurden noch nie auf Production DB ausgeführt

**Fix (Initial Migration):**

**Option A: Via Lokal (Empfohlen für erstes Mal)**
```bash
cd apps/app

# .env mit Production-DB-URL erstellen (temporär)
echo 'DATABASE_URL="<POSTGRES_PRISMA_URL>"' > .env

# Migrations ausführen
pnpm prisma migrate deploy

# Seed-Daten (optional)
pnpm db:seed

# .env löschen (Sicherheit!)
rm .env
```

**Option B: Via Vercel Build Command**
- Build Command bereits enthält `prisma migrate deploy`
- Wird automatisch bei jedem Deploy ausgeführt

---

### Error 4: "Module not found: @prisma/client"

**Symptom:**
```
Error: Cannot find module '@prisma/client'
```

**Ursache**: `postinstall` wurde nicht ausgeführt

**Fix:**
```bash
# Lokal prüfen
cd apps/app
pnpm install
ls node_modules/.prisma/client  # Muss existieren

# Falls nicht: manuell generieren
pnpm prisma generate
```

**Vercel Settings:**
- Install Command: `pnpm install --frozen-lockfile` (Standard)
- `postinstall` in package.json muss vorhanden sein

---

### Error 5: "R2 Credentials Error"

**Symptom:**
```
Error: R2_ACCOUNT_ID is not set
```

**Ursache**: CloudFlare R2 Env Vars fehlen

**Fix:**
1. **CloudFlare Dashboard** → **R2** → **Create Bucket** → `propertyos-files`
2. **Manage R2 API Tokens** → **Create API Token**
3. **Vercel Settings** → **Environment Variables** → Hinzufügen:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
4. **Redeploy**

**Wichtig**: R2 ist optional für MVP. Falls nicht benötigt, Env Vars mit Dummy-Werten setzen:
```
R2_ACCOUNT_ID=not-set
R2_ACCESS_KEY_ID=not-set
R2_SECRET_ACCESS_KEY=not-set
R2_BUCKET_NAME=not-set
```

Dann in `src/lib/r2.ts` Env-Check entfernen (temporär).

---

### Error 6: Build succeeds, but App shows "Application Error"

**Symptom**: Build ✅, aber Runtime Error

**Ursache**: Runtime-Fehler (meist NextAuth oder DB)

**Fix:**
1. **Vercel Dashboard** → **Functions** → **Logs**
2. **Fehler identifizieren** (meist Stack Trace)
3. **Häufige Ursachen**:
   - NEXTAUTH_SECRET fehlt
   - DATABASE_URL falsch
   - Session-Cookie-Domain falsch

**NEXTAUTH_SECRET prüfen:**
```bash
# Muss gesetzt sein
# Generieren mit:
openssl rand -base64 32
```

---

## 🧪 Testing nach Deployment

### 1. Build Verification

**Vercel Dashboard → Deployments → Latest:**
- Status: **Ready** ✅
- Build Time: ~2-4 Min
- Build Logs: Keine Errors

### 2. App Verification

**Checklist:**
- [ ] https://app-propertyos.vercel.app lädt
- [ ] Login-Page wird angezeigt
- [ ] Login funktioniert (Test-User)
- [ ] Dashboard lädt (nach Login)
- [ ] API-Calls funktionieren (Network Tab)
- [ ] Keine Console-Errors (DevTools)

### 3. Database Verification

**Lokal checken:**
```bash
# Mit Production DB verbinden (temporär)
cd apps/app
echo 'DATABASE_URL="<POSTGRES_PRISMA_URL>"' > .env

# Prisma Studio öffnen
pnpm db:studio

# Prüfen:
# - Tenant vorhanden?
# - User vorhanden?
# - Seed-Daten vorhanden?

# .env löschen!
rm .env
```

---

## 📊 Performance Optimization

### Build Caching

Vercel cached automatisch:
- ✅ `node_modules/` (bei gleicher package-lock)
- ✅ `.next/cache/` (Next.js Build Cache)
- ✅ Prisma Client (bei gleichem Schema)

**Erwartete Build-Zeiten:**
- Cold Build (erste Mal): ~4-5 Min
- Warm Build (kein Schema-Change): ~2-3 Min
- Warm Build (kein Code-Change): ~1-2 Min

### Function Size

**Vercel Function Limits:**
- Free: 1 MB (komprimiert)
- Pro: 4.5 MB (komprimiert)
- Enterprise: 50 MB

**PropertyOS App:**
- Durchschnitt: ~2-3 MB (Pro-Plan erforderlich)
- Mit Puppeteer: ~10-15 MB (Enterprise erforderlich für PDF-Generation)

**Optimierung (falls zu groß):**
```javascript
// next.config.ts
export default {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/esbuild-linux-64',
      ],
    },
  },
};
```

---

## 🔄 Continuous Deployment

### Automatisches Deployment

**Bei jedem Git Push zu `main`:**
1. Vercel erkennt Push (GitHub Integration)
2. Startet neuen Build
3. Führt Migrations aus (`prisma migrate deploy`)
4. Deployt bei Erfolg
5. Rollback bei Fehler (alte Version bleibt live)

### Preview Deployments

**Bei jedem Pull Request:**
- Eigene Preview-URL (z.B. `app-propertyos-git-feature-user.vercel.app`)
- Gleiche Env Vars wie Production (oder spezifische Preview-Vars)
- Perfekt für Testing vor Merge

### Branch Deployments

**Spezifische Branches deployen:**
1. **Settings** → **Git** → **Production Branch**: `main`
2. **Preview Branches**: `All branches` oder `Selected branches only`

**Empfehlung:**
- `main` → Production
- `develop` → Preview
- `feature/*` → Preview

---

## 🛡️ Security Checklist

Nach erfolgreichem Deployment:

- [ ] HTTPS aktiv (SSL-Zertifikat gültig)
- [ ] Security Headers gesetzt (Middleware)
- [ ] Rate Limiting aktiv (Login: 5/Min)
- [ ] Session Timeout: 7 Tage
- [ ] DATABASE_URL nicht in Logs sichtbar
- [ ] Prisma Studio NICHT öffentlich erreichbar
- [ ] Admin-User existiert
- [ ] Default-Passwörter geändert

**Security Headers prüfen:**
```bash
curl -I https://app.propertyos.de | grep -i "x-"

# Erwartete Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# X-RateLimit-Limit: 60
```

---

## 📞 Support & Resources

### Vercel Docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Environment Variables: https://vercel.com/docs/projects/environment-variables

### Prisma Docs
- Deploy: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate

### PropertyOS
- Main Deployment Guide: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)
- GitHub Issues: (Link zu Repo)

---

## 🎯 Post-Deployment Checklist

- [ ] App deployed & live
- [ ] Custom Domain konfiguriert
- [ ] Vercel Postgres verbunden
- [ ] Migrations ausgeführt
- [ ] Seed-Daten vorhanden (Test-User)
- [ ] Login funktioniert
- [ ] Dashboard lädt
- [ ] Security Headers gesetzt
- [ ] Performance akzeptabel (Lighthouse >70)
- [ ] Monitoring aktiviert (Vercel Analytics)
- [ ] Error Tracking aktiviert (optional: Sentry)
- [ ] Backup-Strategy dokumentiert

---

**Ende des Vercel Deployment Guide**
**Version 1.0** | **PropertyOS App** | **2026-02-16**
