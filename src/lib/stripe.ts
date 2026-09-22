// ─── STRIPE SERVER CLIENT ─────────────────────────────────────────────────────
// Only import this in server files (Server Components, Server Actions, Route Handlers).
// For client-side Stripe, use loadStripe() from @stripe/stripe-js directly.

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
