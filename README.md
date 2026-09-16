# SATMAT Website (marketing landing)

Read-only marketing site for SATMAT. Live public data (markets, results,
charts, game rates, notices, stats) is read straight from the shared backend —
no mocks, no stored snapshots. There is **no login, wallet, or bidding** here;
every "Play Now / Sign In / Create Account" CTA links out to the webapp.

## Run locally

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL defaults to localhost:8080
npm run dev            # http://localhost:5173
```

## Deploy (second Vercel project)

1. New Vercel project from the same repo, **Root Directory = `Website`**
   (the `web/` project is untouched).
2. Environment Variables (all environments):
   - `VITE_API_BASE_URL` = `https://satmat-backendfinal.onrender.com`
   - `VITE_WEBAPP_URL` = deployed webapp URL (the `web/` project)
   - `VITE_WHATSAPP_NUMBER`, `VITE_SUPPORT_EMAIL` = real business values
3. Deploy. `*.vercel.app` origins are already in the backend CORS allowlist.

Custom domain later: add it to backend `CORS_ORIGINS` (Render dashboard) **and**
to `index.html` CSP `connect-src`, then redeploy both.

## Checks

```bash
npm run typecheck
npm run build
```
