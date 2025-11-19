Commit history of automated assistant edits

2025-11-19 02:30 UTC — Add Leaflet client map & dependency
- Added `components/ui/map.tsx` (vanilla Leaflet client component, dynamic import)
- Added `leaflet` to `package.json`

2025-11-19 02:36 UTC — UI: NearStatus & Location updates
- Added `components/ui/near-status.tsx` to show zip/coords and render map
- Updated `components/ui/location-button.tsx` to store coords, reverse-geocode postal code and update URL

2025-11-19 02:40 UTC — Logo & layout tweaks
- Added header/logo slot in `app/layout.tsx` and moved logo to `app/page.tsx` hero
 - Added header/logo slot in `app/layout.tsx` and moved logo to `app/page.tsx` hero

2025-11-19 02:45 UTC — Map SSR fix
- Modified `components/ui/map.tsx` to dynamically import `leaflet` and its CSS inside `useEffect` to avoid SSR `window` errors
- Added `types/leaflet-css.d.ts` to declare CSS module for TypeScript

2025-11-19 02:50 UTC — Best Buy/Walmart API improvements
- `lib/bestbuy-api.ts`: request `url`/`addToCartUrl` and return url in mapped results
- `app/api/bestbuy/search/route.ts`: added `zip` handling and local-stock helper usage
- `app/api/walmart/search/route.ts`: pass postalCode when `zip` present; normalize `affiliateUrl`
- Added `app/api/affiliate/redirect/route.ts` to centralize outbound redirects
- Updated `app/search/page.tsx` to show product links, store distance, and wire affiliate redirect

2025-11-19 03:05 UTC — UI/controls and design tokens
- Added `components/ui/search-controls.tsx` (sorting UI) and included in search page
- Added accent CSS tokens to `app/globals.css`

2025-11-19 03:12 UTC — Walmart stores lookup
- `app/api/walmart/search/route.ts`: when `zip` provided, also request nearby stores and attach them to the response as `stores`.

Notes:
- These edits were applied by an automated assistant; please run `npm install` then `npm run dev` locally and verify behavior.
- If you want me to create a git commit and push to `dev`, I can prepare the commit message and run it if you allow.
