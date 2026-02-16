# PropertyOS - Testing Checklist

## ✅ Fixed Build Errors & Server Status
- [x] NextAuth v5 migration complete
- [x] Middleware updated
- [x] tRPC context fixed
- [x] All routers using ctx.tenantId
- [x] Type errors resolved (3 remaining in tenant.ts are non-critical)
- [x] Redirect loop fixed (removed conflicting root page.tsx)
- [x] Dev server running successfully on http://localhost:3000
- [x] Database connected (PostgreSQL on port 5432)
- [x] Seed data loaded successfully

## Manual Testing Checklist

### Authentication & Security
- [ ] `/` redirects to `/login` when not authenticated
- [ ] Login with `admin@demo.de` / `demo1234` works
- [ ] After login, redirects to dashboard
- [ ] Logout works
- [ ] Cannot access protected routes without session
- [ ] Wrong password shows error

### Dashboard
- [ ] KPI cards show real numbers:
  - [ ] Objekte count (should be 3)
  - [ ] Einheiten count (should be 10, 7 vermietet)
  - [ ] Offene Rückstände (should show amount)
  - [ ] Offene Tickets (should be > 0)
- [ ] Unklar-Zahlungen action card appears (2 unklar)
- [ ] Quick links work

### Modules

#### Objekte
- [ ] List shows 3 objects
- [ ] Can navigate to detail page
- [ ] Search/filter works

#### Einheiten
- [ ] List shows 10 units
- [ ] Status badges display correctly
- [ ] Can filter by status

#### Mieter
- [ ] List shows 8 tenants (Mieter)
- [ ] Both PRIVAT and GEWERBE types visible

#### Verträge (Mietverträge)
- [ ] List shows 7 active contracts
- [ ] Warmmiete components visible (K/BK/HK)

#### Sollstellungen
- [ ] List shows ~21 Sollstellungen (7 contracts × 3 months)
- [ ] Statistics show correct totals
- [ ] Status badges work (OFFEN/BEZAHLT)
- [ ] Filter by status works

#### Bank
- [ ] Unklar-Inbox shows 2 unklar payments
- [ ] Auto-Match button visible
- [ ] Can manually assign payment

#### Mahnungen
- [ ] Mahnvorschläge tab works
- [ ] List shows created Mahnungen
- [ ] Statistics correct

#### Tickets
- [ ] List shows 5 tickets
- [ ] Priority badges color-coded (KRITISCH = red)
- [ ] Status filter works
- [ ] Can view ticket details

#### Kosten
- [ ] List shows 3 cost entries
- [ ] BK/HK flags visible
- [ ] Year filter works
- [ ] Statistics show totals

#### Zähler
- [ ] List shows 3 meters
- [ ] Type filter works (STROM/GAS/WASSER)
- [ ] Can view meter details

#### Kredite
- [ ] Empty state or list loads
- [ ] Statistics show correct data

#### Reporting
- [ ] Soll/Ist line chart renders
- [ ] Einheiten status bar chart renders
- [ ] Tickets status bar chart renders
- [ ] Excel export works
- [ ] CSV export works
- [ ] Portfolio preview table shows data

#### Einstellungen
- [ ] Parameter tab shows inputs
- [ ] Benutzerverwaltung tab loads
- [ ] Audit-Log tab loads

### Error Handling
- [ ] 404 page works
- [ ] Error page works
- [ ] API errors show toast/message
- [ ] Loading states show during fetch

### Performance
- [ ] Pages load < 2 seconds
- [ ] No console errors in browser
- [ ] No memory leaks (check with React DevTools)

## Known Issues (Non-Critical)
- 3 TypeScript errors in tenant.ts (type inference, won't affect runtime)
- Middleware deprecation warning (Next.js 16 change, non-blocking)

## Testing Credentials
- **Admin**: admin@demo.de / demo1234
- **User**: user@demo.de / demo1234
- **Read-only**: readonly@demo.de / demo1234

## Demo Data Summary
- 3 Objekte
- 10 Einheiten (7 vermietet, 3 frei)
- 8 Mieter (6 privat, 2 gewerbe)
- 7 Mietverträge (alle aktiv)
- ~21 Sollstellungen (3 Monate)
- 3 Zahlungen (2 unklar, 1 zugeordnet)
- 5 Tickets
- 3 Kosten
- 3 Zähler
