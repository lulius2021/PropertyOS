# PropGate - Deployment Checklist

Use this checklist to verify successful deployment of PropGate to Vercel.

## Pre-Deployment

- [ ] All code committed to Git
- [ ] Build successful locally (`pnpm build`)
- [ ] TypeCheck passing (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Repository pushed to GitHub

## Vercel Setup

### Marketing Project (propgate.de)

- [ ] Project created in Vercel
- [ ] GitHub repository connected
- [ ] Root directory set to: `apps/marketing`
- [ ] Framework preset: Astro
- [ ] Build command configured:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=marketing
  ```
- [ ] Install command configured:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile
  ```
- [ ] Domain `propgate.de` added
- [ ] DNS configured (CNAME to Vercel)
- [ ] SSL certificate active (automatic via Vercel)

### Web App Project (app.propgate.de)

- [ ] Project created in Vercel
- [ ] GitHub repository connected
- [ ] Root directory set to: `apps/app`
- [ ] Framework preset: Next.js
- [ ] Build command configured:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=app
  ```
- [ ] Install command configured:
  ```bash
  cd ../.. && pnpm install --frozen-lockfile
  ```
- [ ] Domain `app.propgate.de` added
- [ ] DNS configured (CNAME to Vercel)
- [ ] SSL certificate active (automatic via Vercel)

## Post-Deployment Verification

### Marketing Site (propgate.de)

**All Pages Load**:
- [ ] https://propgate.de (Homepage with Hero, Features, Trust)
- [ ] https://propgate.de/features (8 feature sections)
- [ ] https://propgate.de/pricing (Professional package)
- [ ] https://propgate.de/security (6 security sections)
- [ ] https://propgate.de/impressum (Legal placeholder)
- [ ] https://propgate.de/datenschutz (Privacy placeholder)

**Navigation & CTAs**:
- [ ] Header navigation works (Features, Pricing, Security)
- [ ] Footer navigation works (all links)
- [ ] "Login" button → redirects to `https://app.propgate.de/login`
- [ ] Hero "Zum Dashboard" → redirects to `https://app.propgate.de/login`
- [ ] Hero "Mehr erfahren" → redirects to `/features`
- [ ] Pricing "Jetzt starten" → redirects to `https://app.propgate.de/login`

**SEO & Assets**:
- [ ] https://propgate.de/robots.txt accessible
- [ ] https://propgate.de/sitemap-index.xml accessible
- [ ] https://propgate.de/sitemap-0.xml accessible (lists all 6 pages)
- [ ] https://propgate.de/og-image.png accessible
- [ ] https://propgate.de/favicon.svg accessible
- [ ] Meta tags present (View Page Source → check `<head>`)
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Structured data present (JSON-LD scripts)

**Mobile Responsiveness**:
- [ ] Test on mobile device or DevTools
- [ ] Navigation works on mobile
- [ ] Hero mockup displays correctly
- [ ] All text is readable
- [ ] Buttons are tappable

### Web App (app.propgate.de)

- [ ] https://app.propgate.de loads
- [ ] Shows "PropGate Dashboard - Coming Soon" placeholder
- [ ] Gradient background displays correctly
- [ ] No console errors (open DevTools)

### SEO Validation Tools

**Google Search Console** (After indexing):
- [ ] Site submitted to Google Search Console
- [ ] Sitemap submitted: `https://propgate.de/sitemap-index.xml`
- [ ] No crawl errors

**Rich Results Test**:
- [ ] Visit: https://search.google.com/test/rich-results
- [ ] Test URL: `https://propgate.de`
- [ ] Verify SoftwareApplication schema detected
- [ ] Verify Organization schema detected

**Facebook Sharing Debugger**:
- [ ] Visit: https://developers.facebook.com/tools/debug/
- [ ] Test URL: `https://propgate.de`
- [ ] OG image displays correctly
- [ ] Title and description correct

**Twitter Card Validator**:
- [ ] Visit: https://cards-dev.twitter.com/validator
- [ ] Test URL: `https://propgate.de`
- [ ] Card preview displays correctly

### Performance Audit

**Lighthouse (Chrome DevTools)**:
- [ ] Open `https://propgate.de` in Chrome
- [ ] Open DevTools (F12) → Lighthouse tab
- [ ] Run audit for "Desktop" mode
- [ ] Performance Score: ____ (Target: >90)
- [ ] Accessibility Score: ____ (Target: >90)
- [ ] Best Practices Score: ____ (Target: >90)
- [ ] SEO Score: ____ (Target: >90)

**PageSpeed Insights**:
- [ ] Visit: https://pagespeed.web.dev/
- [ ] Test URL: `https://propgate.de`
- [ ] Mobile Performance: ____ (Target: >80)
- [ ] Desktop Performance: ____ (Target: >90)
- [ ] Core Web Vitals: All Green

### Security Headers (Phase 3+)

_Note: Full security headers will be implemented in Phase 3_

Current Vercel defaults provide:
- [ ] HTTPS enforced (automatic)
- [ ] X-Content-Type-Options present
- [ ] X-Frame-Options present

## Troubleshooting

### Build Fails

**Error**: "Module not found" or dependency errors
- **Solution**: Check build command includes `--frozen-lockfile` and runs from root
- **Verify**: Build command starts with `cd ../..`

**Error**: "Permission denied" or "EACCES"
- **Solution**: Check install command runs before build
- **Verify**: Install command is set to `cd ../.. && pnpm install --frozen-lockfile`

### Pages Not Loading

**404 Error on sub-pages**:
- **Solution**: Verify root directory is correct in Vercel settings
- **Marketing**: Should be `apps/marketing` (not `/apps/marketing`)
- **App**: Should be `apps/app` (not `/apps/app`)

**Blank page or CSS not loading**:
- **Solution**: Check build output in Vercel deployment logs
- **Verify**: Static assets were copied to dist folder

### Domain Not Working

**DNS propagation**:
- **Wait**: Up to 48 hours for full propagation
- **Check**: Use `nslookup propgate.de` to verify DNS
- **Verify**: CNAME record points to `cname.vercel-dns.com`

**SSL Certificate Issues**:
- **Wait**: Vercel auto-generates certificates (usually <1 minute)
- **Check**: Domain status in Vercel project settings
- **Refresh**: Remove and re-add domain if needed

## Success Criteria

All checkboxes above should be checked before considering deployment successful.

**Minimum Requirements**:
- ✅ All 6 marketing pages load without errors
- ✅ All CTAs redirect to correct URLs
- ✅ Sitemap and robots.txt accessible
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Lighthouse scores >80

**Optimal**:
- ✅ Lighthouse scores >90
- ✅ Rich results validation passing
- ✅ Social sharing previews working
- ✅ Core Web Vitals all green

---

**Last Updated**: 2026-02-16

**Current Phase**: Phase 2 Complete - Ready for Deployment
