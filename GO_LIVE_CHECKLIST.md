# Soft Go-Live Checklist — LocalStock.online

This checklist prepares the site for a soft go-live (minimal risk rollout).

## 1) Env vars & Secrets (Vercel / host)
- `BESTBUY_API_KEY` (Best Buy Developer API key)
- `WALMART_PRIVATE_KEY` or `WALMART_PRIVATE_KEY_PATH` (PEM or base64 PKCS#8)
- `WALMART_CONSUMER_ID` (Walmart consumer id)
- `WALMART_KEY_VERSION` (usually `1`)
- `NEXT_PUBLIC_*` keys only if safe for client-side exposure
- `AD_SENSE_*` or analytics IDs (Google Tag Manager ID)
- Set each secret in Vercel environment variables (Production + Preview as needed)

## 2) Build & Lint
- Run `npm run lint` and fix all errors/warnings.
- Run `npm run build` and ensure TypeScript compiles successfully.
- Smoke test the app locally: `npm run dev` and browse main pages.

## 3) API Integrations
- Verify each retailer API key is valid and scoped correctly.
- Test serverless API routes (e.g., `/api/bestbuy/search?q=bose`) using the production environment variables.
- Rate-limit or debounce calls from the client to avoid rapid API usage during high traffic.

## 4) Monitoring & Observability
- Add Google Analytics or Tag Manager to `app/layout.tsx` (production only).
- Add basic server logging (Sentry, Logflare, or Vercel's logs) and a health-check endpoint.
- Configure uptime checks for the site and the key API routes.

## 5) SEO & Indexing
- Ensure `sitemap.xml` and `robots.txt` are present and correct.
- Submit `https://localstock.online/sitemap.xml` to Google Search Console.

## 6) Feature Flags & Rate Limiting
- Consider gating API-heavy features behind a flag so you can toggle them off quickly.
- Add caching (edge / ISR) for frequent searches to reduce API usage and latency.

## 7) Performance & Security
- Verify Core Web Vitals in Lighthouse and address LCP/CLS/TTI issues.
- Ensure environment variables and private keys are not exposed to the client bundle.
- Harden CORS and ensure server routes validate inputs.

## 8) Release Plan (Soft Launch)
- Deploy to a preview/QA branch and perform these checks:
  - Search pages render, API routes return expected JSON.
  - Deal pages load with map widget and search refinement.
  - Verify affiliate links are present (if enabled).
- Roll out to production during a low-traffic window (unless immediate).
- Monitor logs, traffic, and API error rates for 30–60 minutes post-deploy.

## 9) Rollback Plan
- Have the previous stable commit/tag ready to re-deploy.
- Disable API-heavy features via feature flags if rate limits spike.

## 10) Post-Go-Live Tasks
- Replace demo content and placeholders with live content where relevant.
- Start collecting KPIs (affiliate clicks, impressions, API error rate).
- Iterate on UX (loading states, skeletons, better geocoding).

---

If you want, I can also:
- Add `BESTBUY_API_KEY` placeholders to `.env.example` (without real secrets).
- Create small smoke-test scripts that call `/api/bestbuy/search` and `/api/walmart/search` using configured env vars.
