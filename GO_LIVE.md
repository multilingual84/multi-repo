# Multi-Lingual™ — market go-live

Production domain: **https://multi-lingual.tech**

## 1. Deploy (Netlify)

**Option A — Git build (recommended)**  
- Connect this repo → Build: `npm run build` → Publish: `.output/public`  
- Node 22

**Option B — Manual**  
- Upload contents of the `multi-lingual-netlify-public.zip` `public/` folder

## 2. Domain

- Netlify → Domain management → `multi-lingual.tech` (+ www if needed)  
- Point DNS at Netlify records

## 3. Environment variables (Site settings)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=sk_live_...
OWNER_EMAIL=
RESEND_API_KEY=
```

Never put `sk_live_` in any `VITE_*` variable.

## 4. Supabase

- Run migrations under `drizzle/migrations` if not already applied  
- Enable **Realtime** for call signaling channels  

## 5. Stripe

- Success: `https://multi-lingual.tech/?checkout=success&session_id={CHECKOUT_SESSION_ID}`  
- Cancel: `https://multi-lingual.tech/?checkout=cancelled`  
- Webhook: point live endpoint at your site’s Stripe webhook route (server function path after full build)  
- Use live mode keys only for production sales  

## 6. Smoke test before selling

1. https://multi-lingual.tech loads  
2. Tap here to talk → mic permission → speak → translation heard  
3. Share QR / open `#talk-…` on second phone → both connect  
4. One real $0.99 (or test) checkout → return to success URL  
5. No secret keys visible in browser Network → JS bundles  

## Working product links (after DNS)

| Link | Purpose |
|------|---------|
| https://multi-lingual.tech/ | Home / dashboard |
| https://multi-lingual.tech/#talk-CODE | Two-phone auto-join room |
| https://multi-lingual.tech/?checkout=success… | Stripe return |
| https://multi-lingual.tech/?ref=CODE | Partner referral |
