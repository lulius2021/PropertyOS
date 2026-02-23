# PropGate

Modern, cloud-based property management SaaS platform for professional real estate management.

## 🏗️ Architecture

This is a **Turborepo monorepo** containing:

- **apps/marketing** - Astro-based marketing website (propgate.de)
- **apps/app** - Next.js 16.1.6 web application (app.propgate.de)
- **packages/shared** - Shared TypeScript types and utilities

## 🚀 Tech Stack

### Frontend
- **Marketing**: Astro 4.x (SSG, SEO-optimized)
- **App**: Next.js 16 (App Router) + React 19
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma (strict mode)
- **API**: tRPC v11 (type-safe, end-to-end)
- **Auth**: NextAuth.js v5
- **Multi-Tenant**: Row-level isolation with tenantId

### Infrastructure
- **Monorepo**: Turborepo + pnpm workspaces
- **Hosting**: Vercel (2 projects: Marketing + App)
- **File Storage**: CloudFlare R2 (S3-compatible)
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 🛠️ Local Development

### Initial Setup

```bash
# Install dependencies
pnpm install

# Run development servers for all apps
pnpm dev
```

### Individual Apps

```bash
# Marketing site (http://localhost:4321)
cd apps/marketing
pnpm dev

# Web app (http://localhost:3000)
cd apps/app
pnpm dev
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter marketing build
pnpm --filter app build
```

### Linting & Type Checking

```bash
# Run typecheck on all packages
pnpm typecheck

# Run linting on all packages
pnpm lint

# Format code
pnpm format
```

## 🌍 Deployment

### Vercel Configuration

This project requires **two separate Vercel projects**:

#### Project 1: Marketing Website

- **Domain**: `propgate.de`
- **Root Directory**: `apps/marketing`
- **Framework Preset**: Astro
- **Build Command**:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=marketing
  ```
- **Output Directory**: `apps/marketing/dist`
- **Install Command**:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile
  ```

#### Project 2: Web Application

- **Domain**: `app.propgate.de`
- **Root Directory**: `apps/app`
- **Framework Preset**: Next.js
- **Build Command**:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=app
  ```
- **Output Directory**: (Next.js default)
- **Install Command**:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile
  ```

### Environment Variables (Phase 3+)

Will be added when database and auth are implemented:

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# CloudFlare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

## 📁 Project Structure

```
propgate/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
│
├── apps/
│   ├── marketing/                 # Astro marketing site
│   │   ├── src/
│   │   │   ├── pages/            # Routes
│   │   │   ├── components/       # Astro components
│   │   │   ├── layouts/          # Page layouts
│   │   │   └── styles/           # Global styles
│   │   └── public/               # Static assets
│   │
│   └── app/                       # Next.js web app
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   └── components/       # React components
│       └── public/               # Static assets
│
├── packages/
│   └── shared/                   # Shared code
│       └── src/
│           ├── types/            # TypeScript types
│           └── utils/            # Utility functions
│
├── turbo.json                    # Turborepo config
├── pnpm-workspace.yaml           # pnpm workspaces
└── package.json                  # Root package
```

## 🔄 Implementation Roadmap

- [x] **Phase 1**: Repository Setup & Infrastructure (M1) ✅
- [x] **Phase 2**: Marketing MVP (M2) ✅
- [x] **Phase 3**: App Entry & Security (M3) ✅
- [x] **Phase 4**: Core Entities & Audit (M4) ✅
- [x] **Phase 5**: Financial Core (M5) ✅
- [x] **Phase 6**: Dunning System + Documents (M6) ✅
- [x] **Phase 7**: Tickets, Costs, Meters (M7) ✅
- [x] **Phase 8**: Reporting, Polish, Hardening (M8) ✅

See implementation plan document for detailed phase breakdown.

## 🤝 Contributing

This is a private project. For development guidelines, see the implementation plan.

## 📄 License

Proprietary - All Rights Reserved

---

**Current Status**: Phase 8 (Reporting, Polish, Hardening) ✅ Complete

**PropGate MVP is now feature-complete!**

**Implemented Features**:
- ✅ Multi-tenant property management
- ✅ Objekte & Einheiten management
- ✅ Mieter & Mietverträge
- ✅ Sollstellungen & Payment tracking
- ✅ Bank import with auto-matching
- ✅ Mahnwesen with late fees & interest
- ✅ PDF/DOCX document generation
- ✅ Ticket system
- ✅ Cost & time tracking
- ✅ Meter management
- ✅ Credit management
- ✅ Reporting & analytics
- ✅ Excel/CSV export
- ✅ Comprehensive seed data

**Next Steps** (Post-MVP):
1. User acceptance testing with pilot users
2. Performance optimization (pagination)
3. Integration tests (Playwright)
4. Settings backend implementation
5. User management UI
6. Production deployment
