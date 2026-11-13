# Multi-Lingual™

Internet-only multi-lingual communication for `https://multi-lingual.tech`.

**Hosting:** Netlify (not Lovable).

## Deploy

See `DEPLOY-NETLIFY.md`.

```bash
npm install
npm run build
# publish .output/public on Netlify
```

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Speech + text translation |
| `VITE_SUPABASE_*` / `SUPABASE_*` | Auth & data |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Live publishable key only |
| `STRIPE_SECRET_KEY` | Server only |
| `RESEND_API_KEY` | Optional email |
| `OWNER_EMAIL` | Department / complaint inbox |
| `EMAIL_FROM` | Optional From address |

Never put secret keys in `VITE_*` or the public folder.
