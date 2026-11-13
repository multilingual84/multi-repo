# Deploy on Netlify — no Lovable

1. Unzip the public zip **or** connect this repo to Netlify.
2. Build: `npm run build` · Publish: `.output/public`
3. Domain: add `multi-lingual.tech` in Netlify and point DNS.
4. Env vars: `OPENAI_API_KEY`, Supabase, Stripe publishable (pk_live only in VITE_), secrets server-only.

Lovable is not used for hosting, AI, email, or build.
