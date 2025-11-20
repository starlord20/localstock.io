# 🚀 Execution Roadmap: Q4 2025 - Black Friday Launch

**Goal:** Achieve full API integration and high-volume indexing before Black Friday sales begin (Nov 20).
**Blocker:** API Key Approval Timelines.

---

## 1. Current Status (Nov 18, 2:10 AM EST)

* **Domain:** localstock.online is secured and points to Vercel.
* **Code:** Base UI and Hybrid Deal Pages (e.g., Bose) are deployed.
* **Functionality:** Search/Location is currently mock logic (awaiting API integration).
* **Monetization:** AdSense code placed (awaiting AdSense account approval).
* **Critical Dependencies:** Best Buy, Walmart API/Affiliate approved and active. Target API/Affiliate applications submitted (TBD approval). Need more Affiliate integrations with other major retailers across the US (TBD).

---

## 2. Phase Breakdown and Tasks

### Phase 1: Go-Live & Hybrid Indexing (Target: Nov 18 AM)

| Task | Status | Priority | Notes |
| :--- | :--- | :--- | :--- |
| **1.1** Commit / Deploy Code Fixes | ✅ Done | High | `Input` component bug fixed; Search/Location logic added. |
| **1.2** Commit / Deploy SEO Assets | ✅ Done | High | `robots.ts` and `sitemap.ts` added to the project. |
| **1.3** Implement Dynamic Metadata | ✅ Done | High | Add `generateMetadata` function for better Google results. |
| **1.4** Submit Domain to GSC | 🟧 Pending | High | Submit `localstock.online` to Google Search Console to force indexing of `sitemap.xml`. |
| **1.5** Add Google Analytics/Tag Manager | 🟨 TBD | Medium | Add tracking code to `layout.tsx` for performance monitoring. |
| **1.6** Add Impact Affiliate Header | ✅ Done | Medium | Add header code to `layout.tsx` for verification. |
| **1.7** Integrate Figma Design Elements | 🟧 Pending | Medium | Replace UI code with code obtained from Figma (`/figma-design-elements/`) to `components/ui` for homepage revamp. |
| **1.8** Fix Walmart Retail Location Info | 🟧 Pending | High | Fix item availability & retail store link for Walmart. |
| **1.9** Fix Best Buy Product Lookup | 🟧 Pending | High | Fix Best Buy search to display items in salePrice desc order. |

### Phase 2: Core Functionality (Target: ASAP - Blocked by API Key)

| Task | Status | Priority | Dependency |
| :--- | :--- | :--- | :--- |
| **2.1** Best Buy Key Arrival | ✅ Done | CRITICAL | **Best Buy API Application** |
| **2.2** API Key Secrecy Setup | ✅ Done | High | Add Best Buy Key to Vercel Environment Variables. |
| **2.3** Integrate Best Buy API Handler | ✅ Done | High | Replace mock data with live API calls for product search and store lookup (e.g., `api/bestbuy/search`). |
| **2.4** Implement Loading/Error UI | ✅ Done | Medium | Add skeleton loading states and robust error handling for API failures. |

### Phase 3: Monetization & Expansion (Target: Rolling)

| Task | Status | Priority | Dependency |
| :--- | :--- | :--- | :--- |
| **3.1** Walmart/Target Key Arrival | ✅ Done | High | **Affiliate Program Approval** |
| **3.2** Integrate Affiliate Links | ✅ Done | High | Swap hardcoded retailer URLs for commissionable tracking links. |
| **3.3** AdSense Account Approval | 🟨 Pending | High | Google AdSense Review. |
| **3.4** Place AdSense Units | 🟨 TBD | High | Deploy finalized AdSense code units to search and deal pages. |
| **3.5** Build Deal Page #6-10 | 🟧 Next Action | Medium | Create pages for **Sony WH-1000XM5** and **Apple AirTags 4-pack** (based on latest market intel). |
| **3.6** Add BuyMeACoffee Button | 🟨 Pending | Medium | Add the provided script (scripts/buymeacoffee.js) code into the home page & to the left-side search page. |

---

## 3. Key Dependencies & Risks

| Dependency | Risk/Blocker | Mitigation Plan |
| :--- | :--- | :--- |
| **API Keys** | Slow approval process (especially for Affiliate programs). | Launched Hybrid SEO early (Phase 1) to gain traffic while keys are pending. |
| **Scalability** | High Black Friday traffic volume causes API throttling or Vercel billing spike. | Vercel auto-scales; focus API calls on most popular queries only. |
| **Inventory Accuracy** | Retailer APIs provide stale data. | Add a timestamp to stock results (e.g., "Stock checked 5 minutes ago"). |

---

## Recent Changes (assistant)

- Added a draft `Privacy Policy` at `public/privacy.md` and a simple viewer at `/privacy`.
- Inserted Impact verification meta tag and linked a favicon (`/favicon.svg`) in `app/layout.tsx`.
- Converted the home logo to use Next.js `Image` for automatic optimization and ensured `alt` text is present.
- Ensured outbound links to the Privacy page and affiliate redirects open in a new tab with `rel="noopener noreferrer"`.

These changes address privacy disclosure, affiliate verification, basic image optimization, and link security. Next steps: audit other images for Next.js `Image` usage and add optimized asset variants (webp/avif) to `public/`.