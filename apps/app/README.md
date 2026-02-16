# PropertyOS - Web App

**Modern Property Management SaaS Platform**

Next.js 15 + tRPC + Prisma + PostgreSQL + NextAuth.js

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL Database (Vercel Postgres or local)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:push

# (Optional) Seed demo data
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Login (after seed)

```
Email: admin@demo.de
Password: admin123
```

---

## 📦 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production (includes prisma generate)
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript type checking
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema to database (dev)
pnpm db:seed      # Seed demo data
pnpm db:studio    # Open Prisma Studio (DB GUI)
```

---

## 🗂️ Project Structure

```
apps/app/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Seed script
│   └── migrations/        # Migration files
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (authenticated)/  # Protected routes
│   │   ├── api/           # API routes
│   │   ├── login/         # Public login page
│   │   └── sicherheit/    # Public security page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Layout components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   ├── r2.ts          # CloudFlare R2 client
│   │   └── trpc/          # tRPC client/server
│   ├── server/
│   │   ├── routers/       # tRPC routers (API)
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Tenant isolation, Audit
│   ├── templates/         # Handlebars templates (PDF)
│   └── middleware.ts      # Next.js middleware (Rate limiting, Security)
└── package.json
```

---

## 🔐 Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/propertyos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# CloudFlare R2 (optional for local dev)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="propertyos-files"
```

See `.env.example` for full reference.

---

## 🗄️ Database Setup

### Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb propertyos

# Update .env
DATABASE_URL="postgresql://localhost:5432/propertyos"

# Run migrations
pnpm db:push

# Seed data
pnpm db:seed
```

### Vercel Postgres (Production)

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

## 🚢 Deployment

### Vercel (Recommended)

**Complete deployment guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**Quick Deploy:**

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project in Vercel Dashboard
# → Root Directory: apps/app
# → Build Command: prisma generate && prisma migrate deploy && pnpm build

# 3. Add Vercel Postgres
# → Storage → Create Database → Postgres → Connect

# 4. Set Environment Variables
# → NEXTAUTH_URL, NEXTAUTH_SECRET, R2_*

# 5. Deploy
```

**Build Command (Vercel Settings):**
```bash
prisma generate && prisma migrate deploy && pnpm build
```

### Other Platforms

See main [DEPLOYMENT.md](../../DEPLOYMENT.md) for alternative hosting options.

---

## 🧪 Testing

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Database check
pnpm db:studio
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **API**: tRPC v11 (type-safe)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **File Storage**: CloudFlare R2 (S3-compatible)
- **Document Generation**: Handlebars + Puppeteer

---

## 📚 Key Features

- ✅ **Multi-Tenant Architecture** (Row-Level Security)
- ✅ **Objekt- & Einheitenverwaltung** (Property Management)
- ✅ **Mieterverwaltung & Mietverträge** (Tenant Management)
- ✅ **Sollstellungen & Warmmiete** (Rent & Billing)
- ✅ **Bankimport & Auto-Matching** (CSV Import)
- ✅ **Mahnwesen mit Verzugszinsen** (Dunning System)
- ✅ **Ticketsystem** (Support Tickets)
- ✅ **Kosten- & Zeiterfassung** (Expense Tracking)
- ✅ **Zählerverwaltung** (Utility Meters)
- ✅ **Kreditverwaltung** (Loan Management)
- ✅ **Reporting & Export** (DSGVO-compliant)
- ✅ **Audit-Logs** (Change Tracking)

---

## 🔒 Security

- ✅ NextAuth.js Session (7-day expiry)
- ✅ Rate Limiting (5 login attempts/min)
- ✅ Security Headers (HSTS, CSP, etc.)
- ✅ Tenant Isolation (Prisma Middleware)
- ✅ DSGVO-compliant Data Export
- ✅ EU Data Residency (Frankfurt)

See [/sicherheit](http://localhost:3000/sicherheit) page for details.

---

## 📖 Documentation

- **Main Docs**: [../../README.md](../../README.md)
- **Deployment**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Full Deployment Guide**: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### "PrismaClient is unable to run"

```bash
pnpm db:generate
```

### "Can't reach database server"

Check `DATABASE_URL` in `.env`

### Build fails on Vercel

See [VERCEL_DEPLOYMENT.md → Troubleshooting](./VERCEL_DEPLOYMENT.md#-troubleshooting)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/propertyos/propertyos/issues)
- **Docs**: [Main Documentation](../../README.md)
- **Deployment**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

**PropertyOS** | **Version 1.0** | **2026-02-16**
