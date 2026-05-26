# Brian Bands Sports — brianbands.co.za

Next.js 15 ecommerce store for Brian Bands Sports, Gqeberha.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Fill in your real keys
cp .env .env.local
# Edit .env.local — add Stripe test keys, Resend API key

# 3. Set up the database + seed products
npm run db:setup

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000

Admin panel: http://localhost:3000/admin  
Default admin password: `password` (change via `npm run hash-password`)

## Testing

```bash
# Unit + component tests
npm test

# Integration tests (spins up a separate test DB)
npm run test:integration

# E2E tests (requires dev server running)
npx playwright install chromium   # first time only
npm run test:e2e
```

## Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Prisma + SQLite (swap `provider` in schema.prisma for PostgreSQL in production)
- **Payments**: Stripe (ZAR, PaymentIntent flow)
- **Email**: Resend + React Email
- **Auth**: Custom session-based (httpOnly cookie + DB sessions)
- **Tests**: Vitest (unit/integration) + Playwright (E2E)

## Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_... secret → paste into .env.local as STRIPE_WEBHOOK_SECRET
```

## Deploy checklist

- [ ] Switch DATABASE_URL to PostgreSQL and update `schema.prisma` provider
- [ ] Set all env vars on your host (Stripe live keys, Resend, SERVER_URL)
- [ ] Register the Stripe webhook endpoint in the Stripe dashboard
- [ ] Verify your Resend sending domain (orders@brianbands.co.za)
- [ ] Change the admin password via `npm run hash-password`
