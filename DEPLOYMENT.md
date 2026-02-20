# PropGate - Deployment Guide

**Version:** 1.0
**Letzte Aktualisierung:** 2026-02-20
**Zielumgebung:** Vercel (Production)

---

## Übersicht

PropGate ist als Monorepo mit zwei eigenständigen Apps aufgebaut:
- **Marketing-Website** (`apps/marketing`) → `propgate.de`
- **Web-App** (`apps/app`) → `app.propgate.de`

Beide Apps werden auf **Vercel** gehostet und nutzen:
- **Vercel Postgres** (PostgreSQL)
- **CloudFlare R2** (S3-kompatibel, File Storage)
- **Vercel Edge Network** (CDN)

---

## Voraussetzungen

### Accounts
- [x] Vercel Account (https://vercel.com)
- [x] CloudFlare Account mit R2 (https://dash.cloudflare.com)
- [x] GitHub Repository (für CI/CD)

### Lokale Tools
- [x] Node.js 18+ (`node -v`)
- [x] pnpm 10+ (`pnpm -v`)
- [x] Git (`git --version`)

---

## Teil 1: Vercel-Setup (Marketing-Website)

### 1.1 Marketing-Projekt erstellen

1. **Vercel Dashboard öffnen**: https://vercel.com/dashboard
2. **"New Project"** klicken
3. **GitHub-Repo verbinden**: `propgate` Repository auswählen
4. **Projekt-Einstellungen**:
   - **Framework Preset**: Other
   - **Root Directory**: `apps/marketing`
   - **Build Command**:
     ```bash
     cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=marketing
     ```
   - **Output Directory**: `dist` (oder Standard)
   - **Install Command**: (leer lassen, da im Build Command enthalten)

5. **Environment Variables**:
   - Keine erforderlich (statische Website)

6. **Deploy** klicken

### 1.2 Custom Domain konfigurieren

1. **Vercel Projekt öffnen** → **Settings** → **Domains**
2. **Domain hinzufügen**: `propgate.de`
3. **DNS-Records setzen** (bei Domain-Provider):
   ```
   A Record:    @       →  76.76.21.21 (Vercel IP)
   CNAME:       www     →  cname.vercel-dns.com
   ```
4. **SSL-Zertifikat**: Automatisch via Let's Encrypt (ca. 5 Min.)
5. **Verifizieren**: https://propgate.de

---

## Teil 2: Vercel-Setup (Web-App)

### 2.1 App-Projekt erstellen

1. **Vercel Dashboard** → **"New Project"**
2. **GitHub-Repo verbinden**: `propgate` Repository auswählen
3. **Projekt-Einstellungen**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/app`
   - **Build Command**:
     ```bash
     cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=app
     ```
   - **Output Directory**: `.next` (Standard)
   - **Install Command**: (leer lassen)

4. **Environment Variables** (siehe nächster Schritt)

5. **Deploy NOCH NICHT klicken** (erst Env Vars setzen)

### 2.2 Vercel Postgres einrichten

1. **Vercel Dashboard** → **Storage** → **Create Database**
2. **Typ auswählen**: Postgres
3. **Region**: Frankfurt (eu-central-1)
4. **Database Name**: `propgate-production`
5. **"Create"** klicken
6. **"Connect"** → **Projekt auswählen**: `propgate-app`
7. **Environment Variables automatisch hinzugefügt**:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` ← **Diesen für DATABASE_URL verwenden**
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### 2.3 Environment Variables setzen

**Vercel Projekt** → **Settings** → **Environment Variables**

#### Required Variables

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `DATABASE_URL` | `$POSTGRES_PRISMA_URL` | PostgreSQL Connection String (automatisch gesetzt) |
| `NEXTAUTH_URL` | `https://app.propgate.de` | NextAuth Base URL |
| `NEXTAUTH_SECRET` | `<generiert>` | Session Secret (siehe unten) |
| `R2_ACCOUNT_ID` | `<CloudFlare>` | CloudFlare Account ID |
| `R2_ACCESS_KEY_ID` | `<CloudFlare>` | R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | `<CloudFlare>` | R2 Secret Key |
| `R2_BUCKET_NAME` | `propgate-files` | R2 Bucket Name |

#### NEXTAUTH_SECRET generieren

```bash
openssl rand -base64 32
```

Kopiere Output und setze als `NEXTAUTH_SECRET`.

**Environment Scope**:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2.4 Prisma Migrations ausführen

**Lokal (vor erstem Deploy)**:

```bash
cd apps/app

# .env mit Production-DB-URL erstellen
echo "DATABASE_URL=\"<POSTGRES_PRISMA_URL>\"" > .env

# Migrations ausführen
pnpm prisma migrate deploy

# Seed-Daten (optional, für Demo-Tenant)
pnpm prisma db seed
```

**Hinweis**: Bei jedem Schema-Change muss `prisma migrate deploy` manuell ausgeführt werden (kein Auto-Migration bei Vercel Deploy).

### 2.5 Deploy durchführen

1. **Vercel Projekt** → **Deployments** → **"Redeploy"**
2. **Warten** (~2-3 Minuten)
3. **Logs prüfen**: Build erfolgreich?
4. **Test**: https://app-propgate.vercel.app

### 2.6 Custom Domain konfigurieren

1. **Vercel Projekt** → **Settings** → **Domains**
2. **Domain hinzufügen**: `app.propgate.de`
3. **DNS-Records setzen**:
   ```
   CNAME:  app  →  cname.vercel-dns.com
   ```
4. **SSL-Zertifikat**: Automatisch
5. **Verifizieren**: https://app.propgate.de

---

## Teil 3: CloudFlare R2 Setup

### 3.1 R2 Bucket erstellen

1. **CloudFlare Dashboard**: https://dash.cloudflare.com
2. **R2** → **"Create bucket"**
3. **Bucket Name**: `propgate-files`
4. **Location**: EU (Automatic)
5. **"Create bucket"**

### 3.2 API Token generieren

1. **R2** → **"Manage R2 API Tokens"**
2. **"Create API token"**
3. **Name**: `propgate-production`
4. **Permissions**:
   - ✅ Read
   - ✅ Write
5. **Bucket**: `propgate-files` (spezifisch)
6. **"Create API Token"**
7. **Credentials kopieren**:
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID` (aus URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`)

### 3.3 Vercel Env Vars aktualisieren

**Vercel Projekt** → **Settings** → **Environment Variables**:

- `R2_ACCOUNT_ID`: `<Account ID>`
- `R2_ACCESS_KEY_ID`: `<Access Key>`
- `R2_SECRET_ACCESS_KEY`: `<Secret Key>`
- `R2_BUCKET_NAME`: `propgate-files`

**Redeploy** nach Env-Var-Änderung!

### 3.4 CORS-Policy setzen (für Direkt-Upload, optional)

**CloudFlare R2** → **Bucket** → **Settings** → **CORS**:

```json
[
  {
    "AllowedOrigins": ["https://app.propgate.de"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Teil 4: Verifikation & Testing

### 4.1 Checkliste vor Launch

#### Marketing-Website
- [ ] https://propgate.de lädt (<3s)
- [ ] Lighthouse-Score >90 (Performance, SEO)
- [ ] Alle Links funktionieren (Features, Pricing, Security)
- [ ] CTA "Zum Login" → https://app.propgate.de/login
- [ ] Mobile-Ansicht funktioniert
- [ ] Impressum & Datenschutz vorhanden

#### Web-App
- [ ] https://app.propgate.de/login lädt
- [ ] Login funktioniert (Test-User)
- [ ] Session bleibt 7 Tage aktiv
- [ ] Dashboard zeigt KPIs
- [ ] CRUD funktioniert (Objekt/Einheit/Mieter/Vertrag)
- [ ] Sollstellungen erstellen/anzeigen
- [ ] Bankimport CSV funktioniert
- [ ] Mahnungen generieren (PDF)
- [ ] Tickets erstellen/bearbeiten
- [ ] Kosten/Zähler/Kredite erfassen
- [ ] Reporting-Seite zeigt Daten
- [ ] Export-Funktion (JSON-Download)

#### Sicherheit
- [ ] HTTPS aktiv (SSL-Zertifikat gültig)
- [ ] Security Headers gesetzt (https://securityheaders.com)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
- [ ] Rate Limiting aktiv (5 Login-Versuche/Min)
- [ ] Session Timeout nach 7 Tagen
- [ ] Tenant-Isolation funktioniert (User A sieht keine Daten von Tenant B)

#### Datenbank
- [ ] Migrations erfolgreich (`prisma migrate deploy`)
- [ ] Seed-Daten vorhanden (Demo-Tenant)
- [ ] Backups aktiviert (Vercel Postgres: automatisch täglich)

#### File Storage
- [ ] Dokument-Upload funktioniert
- [ ] Download über Signed URL funktioniert
- [ ] R2-Bucket nur über API erreichbar (nicht öffentlich)

### 4.2 Performance-Tests

```bash
# Lighthouse (Chrome DevTools)
# Ziel: Performance >90, Accessibility >95, SEO >95

# Marketing
lighthouse https://propgate.de --view

# App (nach Login)
# Manuell: DevTools → Lighthouse → "Generate Report"
```

### 4.3 Security-Tests

```bash
# Security Headers
curl -I https://app.propgate.de | grep -i "x-"

# Oder: https://securityheaders.com/?q=app.propgate.de
```

**Erwartete Headers**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-RateLimit-Limit: <limit>`

### 4.4 Load-Testing (optional)

```bash
# Artillery (npm install -g artillery)
artillery quick --count 10 --num 50 https://app.propgate.de/api/trpc/objekte.list
```

---

## Teil 5: Monitoring & Maintenance

### 5.1 Vercel Analytics

**Vercel Dashboard** → **Analytics**:
- **Web Vitals**: LCP, FID, CLS (<100ms)
- **Deployment Logs**: Build-Fehler
- **Function Logs**: Runtime-Errors

### 5.2 Error Tracking (optional: Sentry)

```bash
cd apps/app
pnpm add @sentry/nextjs

# next.config.mjs anpassen
# sentry.client.config.ts erstellen
```

**Sentry Env Vars**:
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

### 5.3 Database Backups

**Vercel Postgres**:
- **Automatische Backups**: Täglich (30 Tage Aufbewahrung)
- **Point-in-Time Recovery**: Bis zu 30 Tage zurück
- **Backup-Restore**: Vercel Support kontaktieren

**Manuelles Backup** (optional):

```bash
# Export via pg_dump (erfordert Connection String)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload zu S3/R2 (langfristige Archivierung)
```

### 5.4 Uptime Monitoring

**Tools**:
- **Vercel Integrations**: Checkly, Datadog, New Relic
- **Extern**: UptimeRobot (gratis), Pingdom

**Endpoints**:
- https://propgate.de (Marketing)
- https://app.propgate.de/login (App)
- https://app.propgate.de/api/health (Health-Check, TODO)

---

## Teil 6: Rollback & Disaster Recovery

### 6.1 Rollback auf vorherige Version

**Vercel Dashboard** → **Deployments**:
1. Vorherige funktionierende Version auswählen
2. **"Promote to Production"** klicken
3. **Dauer**: <1 Minute

**WICHTIG**: Migrations-Rollback muss manuell erfolgen!

```bash
# Lokale DB-Migration rückgängig machen
cd apps/app
pnpm prisma migrate reset

# Production-DB: Erfordert manuelles SQL-Rollback oder Backup-Restore
```

### 6.2 Database Restore

**Vercel Postgres** → **Settings** → **Backups**:
1. Backup-Zeitpunkt auswählen (letzte 30 Tage)
2. Vercel Support per E-Mail kontaktieren
3. **Downtime**: Ca. 15-30 Minuten

### 6.3 File Storage Restore

**CloudFlare R2**:
- **Versioning aktivieren**: Bucket → Settings → Object Versioning
- **Restore**: Via API oder Dashboard (alte Version wiederherstellen)

---

## Support & Kontakt

**Fragen zum Deployment?**
- Vercel Docs: https://vercel.com/docs
- CloudFlare R2 Docs: https://developers.cloudflare.com/r2/
- PropGate Issues: https://github.com/propgate/propgate/issues

**Notfall-Kontakt**:
- Vercel Support: support@vercel.com (Pro Plan: 24h Response)
- CloudFlare Support: https://dash.cloudflare.com (Enterprise: 1h Response)

---

**Ende des Deployment Guides**
**Version 1.0** | **PropGate** | **2026-02-20**
