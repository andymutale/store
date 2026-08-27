# Saint Laurens Sporting Goods

### E-commerce Storefront · Saint Laurens Sporting Goods · 2026

> **Sporting goods, without the unnecessary fuss.**

Saint Laurens Sporting Goods is a modern full-stack e-commerce application built around a clean customer storefront, secure checkout, customer accounts, order management, and an administrative back office.

The project is designed as a complete store experience rather than simply a collection of product pages.

---

## What is this?

Saint Laurens Sporting Goods is an online sporting-goods store built with Next.js.

The application brings together:

* A customer-facing storefront
* Product browsing and product details
* Shopping cart and checkout
* Stripe payment processing
* Customer accounts
* Address management
* Order history
* Transactional email
* Administrative tools
* Database-backed business logic
* Automated testing

The important part is that these experiences share the same application and data model.

---

## The customer experience

The storefront is designed to answer the questions customers actually have:

**What do you sell?**

**How much does it cost?**

**Is it available?**

**How do I buy it?**

**What happens after I place the order?**

The customer journey is intentionally straightforward:

```text
Browse products
      ↓
View product
      ↓
Add to cart
      ↓
Checkout
      ↓
Pay securely
      ↓
Order confirmation
      ↓
Order history
```

---

## Storefront

The public storefront is the front door of Saint Laurens Sporting Goods.

It provides the customer-facing experience for:

* Product discovery
* Product details
* Shopping cart
* Checkout
* Registration
* Login
* Customer account
* Order history
* Profile management
* Saved addresses
* Store information
* FAQs
* Delivery information
* Returns
* Terms and privacy information

The interface is built to make the next action obvious without overwhelming the customer.

---

## Checkout and payments

Payments are handled through **Stripe**.

The checkout flow connects the customer-facing application to the payment backend and Stripe webhook processing.

A simplified flow looks like this:

```text
Customer
   ↓
Shopping Cart
   ↓
Checkout
   ↓
Stripe
   ↓
Payment Intent
   ↓
Stripe Webhook
   ↓
Order Processing
   ↓
Confirmation Email
```

Webhook handling is kept on the server side so payment events can be processed reliably rather than trusting the browser alone.

For local development, Stripe's CLI can be used to forward webhook events to the application.

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use Stripe test credentials during development.

---

## Customer accounts

Customers can create an account and manage their relationship with the store.

Account functionality includes:

* Registration
* Login
* Profile management
* Saved addresses
* Order history
* Individual order details

The goal is to make repeat purchasing easier without turning the account area into a maze of settings.

---

## Orders and email

After checkout, order information is persisted in the application database and used for customer-facing order history.

Transactional email templates are implemented with **React Email** and delivered through **Resend**.

Email-related functionality covers customer communications such as:

* Order confirmation
* Order history information
* Transactional order messaging

The sender domain should be configured with a verified production domain before launch.

---

## Admin

The application includes an administrative area for store operations.

The admin experience provides a separate interface for managing operational information and reviewing store activity.

The admin area is intentionally separated from the customer storefront so internal workflows can evolve independently while still using the same underlying platform.

---

## Data and database

The project uses **Prisma** as the ORM and **SQLite** for development.

The Prisma schema lives at:

```text
prisma/schema.prisma
```

Development data can be initialized through the project's database setup command:

```bash
npm run db:setup
```

For a production deployment, the database configuration can be moved to a production-ready provider such as PostgreSQL.

---

## Couponing

The store includes coupon support in the application flow.

The current development coupon code is:

```text
SAINTLAURENS
```

Coupon validation and application should remain server-side so discounts cannot be trusted solely from client-side input.

---

## Brand system

Saint Laurens Sporting Goods uses a simple, high-contrast visual identity.

### Primary

```text
Cherry Red
#FF4747
```

### Primary Dark

```text
#D63333
```

### Primary Light

```text
#FFE8E8
```

### Accent

```text
Butter Yellow
#F7E998
```

The main brand tokens are centralized in the global styling so the storefront and administrative interfaces can remain visually consistent.

Semantic colours such as success and error states remain separate from the brand palette.

---

## Tech stack

```text
Next.js 15        React framework
React             User interface
TypeScript        Application development
Tailwind CSS      Styling
Prisma            Database ORM
SQLite             Development database
Stripe             Payments
Resend             Transactional email
React Email        Email templates
Vitest             Unit and integration testing
Playwright         End-to-end testing
```

The stack is intentionally conventional.

The goal is to keep the architecture understandable while still providing the pieces required for a real e-commerce application.

---

## Project structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── public/
│   └── ...
│
├── src/
│   ├── app/
│   │   ├── (customerFacing)/
│   │   ├── admin/
│   │   └── api/
│   │
│   ├── components/
│   ├── email/
│   └── lib/
│
├── tests/
├── .env.example
├── package.json
└── README.md
```

The application follows the Next.js App Router structure while keeping shared services, components, email templates, and database logic organized separately.

---

## Run it locally

### Requirements

You will need:

* Node.js
* npm
* Stripe CLI for local webhook development
* A local environment capable of running the Next.js application

### Install

```bash
npm install
```

### Configure environment variables

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Populate the required values for:

* Database
* Stripe
* Resend
* Application URL
* Authentication/session configuration

Never commit real credentials or secret keys.

### Set up the database

```bash
npm run db:setup
```

### Start development

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The admin area is available at:

```text
http://localhost:3000/admin
```

---

## Testing

### Unit and component tests

```bash
npm test
```

### Integration tests

```bash
npm run test:integration
```

### End-to-end tests

```bash
npm run test:e2e
```

Playwright browsers can be installed with:

```bash
npx playwright install chromium
```

A good development workflow is:

```text
Change
  ↓
Unit tests
  ↓
Integration tests
  ↓
E2E tests
  ↓
Production build
```

---

## Development workflow

A typical local workflow looks like this:

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

For Stripe webhook development, run the local listener separately:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then use Stripe's test environment while developing the checkout flow.

---

## Production checklist

Before deploying the store publicly, verify:

* Production database configured
* Production environment variables set
* Stripe live keys configured
* Stripe webhook endpoint registered
* Resend sending domain verified
* Production application URL configured
* Admin credentials changed from development defaults
* Customer registration and login tested
* Checkout tested end to end
* Webhook handling verified
* Transactional email delivery verified
* Return and delivery information reviewed
* Production build passes
* Automated tests pass

---

## Security

This repository should never contain production secrets.

Do not commit:

```text
.env
.env.local
Stripe secret keys
Stripe webhook signing secrets
Resend API keys
Database credentials
Authentication secrets
Private certificates
Access tokens
```

Use environment variables and your deployment platform's secret-management facilities instead.

The browser should never be treated as a trusted source for sensitive business operations such as payment confirmation, order creation, permissions, or coupon validation.

---

## Architecture principles

### Keep business logic on the server

Anything involving money, permissions, order state, or sensitive data should be validated server-side.

### Treat Stripe webhooks as authoritative events

The browser can initiate checkout, but payment state should ultimately be reconciled through verified server-side Stripe events.

### Keep the customer journey simple

The storefront should communicate:

```text
What am I looking at?
What does it cost?
Can I buy it?
What do I do next?
```

### Centralize branding

Core colour tokens and shared interface patterns should remain centralized so visual changes can propagate consistently.

### Design for operational reality

A store is not finished when the checkout page looks good.

It also needs:

* Reliable order processing
* Error handling
* Email delivery
* Authentication
* Permissions
* Database integrity
* Webhook handling
* Monitoring and testing

---

## Future improvements

Potential next steps include:

* Production PostgreSQL configuration
* Expanded product management
* More advanced inventory workflows
* Order administration improvements
* Richer product search and filtering
* Customer account enhancements
* Persistent cart support
* Automated monitoring and alerting
* Image optimization and CDN delivery
* Additional checkout and payment scenarios
* More comprehensive E2E coverage

---

## Project status

**E-commerce storefront · 2026**

Saint Laurens Sporting Goods is a functional full-stack store project intended to demonstrate a complete modern commerce experience—from browsing and checkout through authentication, orders, email, and administration.

---

## Brand

**Saint Laurens Sporting Goods**

Sporting goods, online and in one place.

