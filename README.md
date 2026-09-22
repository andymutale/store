# STORE

### Saint Laurens Sporting Goods

**An ecommerce store built as though somebody actually has to run it.**

There are products.

There are variants.

There is inventory.

There are customers.

Eventually, somebody has to pay for all of it.

So this isn't a landing page with three product cards and a checkout button that smiles politely before doing absolutely nothing.

Store is a full ecommerce application covering the bits that become interesting once you're dealing with an actual shop:

**catalogue → cart → checkout → payment → orders → fulfilment**

And, because somebody has to deal with everything the customer doesn't see:

**administration, inventory, shipping, authentication, email, testing, and all the small decisions that turn “a website” into a system.**

---

## 01 / WHAT IS STORE?

Store is a full-stack ecommerce application for a fictional sporting-goods retailer, **Saint Laurens Sporting Goods**.

The project is deliberately built around the entire commerce journey rather than treating the storefront as the product and everything else as an afterthought.

A customer should be able to discover a product, choose the exact variant they want, add it to a persistent cart, enter delivery details, select shipping, pay through Stripe, and receive an order confirmation.

The business should then be able to see what happened on the other side of that transaction.

That means products, variants, stock, customers, carts, addresses, orders, shipping, payments, reviews, wishlists, and administration all need to agree about what is happening.

That's the interesting part.

The shop is the UI.

The rest is the machine underneath it.

---

## 02 / THE CUSTOMER

The customer's job is fairly simple.

Find something they want.

Decide they can afford it.

Put it in a cart.

Give us money.

Wait for the thing to arrive.

The software has decided this requires rather more machinery.

```text
Browse
  ↓
Product
  ↓
Choose variant
  ↓
Add to cart
  ↓
Review cart
  ↓
Delivery details
  ↓
Shipping method
  ↓
Payment
  ↓
Order created
  ↓
Payment confirmed
  ↓
Confirmation email
  ↓
Fulfilment
```

The customer doesn't need to understand that flow in technical terms.

They just need the next step to be obvious.

---

## 03 / THE STOREFRONT

The storefront is the public face of the application.

It is responsible for helping somebody answer a few questions quickly:

**What is this?**

**Can I buy it?**

**Which one do I want?**

**How much is it?**

**How do I get it?**

The catalogue is built around products and their variants rather than treating every size or colour as a completely separate product.

Products carry the information the customer needs to make a decision, while variants represent the thing that can actually be purchased.

That distinction becomes important very quickly once inventory enters the picture.

---

## 04 / PRODUCTS

A product is the parent record.

It contains things such as:

* Name and slug
* Description and short description
* Base price
* Optional comparison price
* Gender
* Sport
* Size system
* Category
* Brand
* Product specifications
* SEO metadata
* Merchandising flags
* Product images

Products can be marked as available for purchase, featured, or new.

The database also supports categories as a hierarchy, so the catalogue can represent something more useful than a flat list of names.

For example:

```text
Running
├── Men's Running Shoes
└── Women's Running Shoes

Tennis
├── Men's Tennis Shoes
├── Women's Tennis Shoes
└── Tennis Rackets
```

---

## 05 / VARIANTS & INVENTORY

This is where the product becomes something somebody can actually buy.

A variant represents a specific purchasable combination such as:

```text
Adizero Boston 13
UK 9
Cloud White
SKU: ABC-001
Stock: 4
```

Or:

```text
Bafana Home Jersey
L
No colour choice
SKU: JERSEY-L
Stock: 12
```

Or a product that doesn't need size or colour at all.

Each variant has its own SKU and stock quantity, and a variant can optionally override the parent product's price.

This matters because “we have six shoes” is not the same thing as “we have six pairs of size 9 in black.”

Inventory lives where the customer decision lives.

---

## 06 / PRODUCT IMAGES

Products support multiple images.

Each image can carry:

* URL
* Alt text
* Sort order
* Primary-image state

The primary image is intended to be used for the main product presentation, while the full set can be displayed in the product gallery.

This sounds like a tiny detail until you've tried to make a product page work with one image and discovered that everything suddenly looks like a government procurement portal.

---

## 07 / THE CART

The cart persists.

That is important.

A customer shouldn't lose their shopping because they refreshed the browser or closed a tab.

The data model supports both authenticated and guest carts:

```text
Authenticated customer
    userId = customer
    sessionId = null

Guest customer
    userId = null
    sessionId = browser session
```

Cart rows point to the product and the exact variant being purchased, with quantity stored on the cart item.

Adding the same variant again increases the quantity rather than creating another row for the same item.

The intended login flow can also merge a guest cart into the customer's account, because apparently even shopping carts need relationship counselling.

---

## 08 / ACCOUNTS

Customers can have accounts with:

* Email
* Password credentials
* Name
* Phone number
* Saved addresses
* Orders
* Cart items
* Wishlists
* Reviews

The current session model is database-backed. Session tokens are stored server-side and exposed to the browser through an `httpOnly` cookie.

The data model keeps authentication and customer commerce data connected without forcing every feature to invent its own user representation.

There are also two illustrative roles:

| Role       | Purpose                             |
| ---------- | ----------------------------------- |
| `customer` | Normal storefront access            |
| `admin`    | Administration and store operations |

The model leaves room for passwordless or social authentication later by making `passwordHash` nullable.

---

## 09 / ADDRESSES

Customers can save delivery addresses against their account.

The address model includes:

* First and last name
* Company
* Address lines
* City
* Province
* Postal code
* Country
* Phone
* Default-address state

The current store is modelled around South African delivery data, with provinces represented explicitly rather than treating shipping as a single global price.

Orders retain a reference to the address used for shipping so the fulfilment side of the system has an actual delivery destination to work with.

---

## 10 / CHECKOUT

This is where the nice shopping experience meets accounting.

The checkout flow is deliberately server-driven.

At a high level:

```text
Checkout form
     ↓
Validate customer details
     ↓
Load cart
     ↓
Check inventory
     ↓
Resolve shipping rate
     ↓
Calculate totals
     ↓
Create customer/order records
     ↓
Create Stripe PaymentIntent
     ↓
Return client secret
     ↓
Stripe payment UI
```

The server validates the submitted delivery information, loads the current cart, checks stock, resolves the selected shipping rate, calculates the total in Rand cents, creates the order, and creates the Stripe PaymentIntent.

The important bit is that the final order total is not simply whatever number the browser felt like sending.

The application calculates it.

---

## 11 / SOUTH AFRICAN CURRENCY

Prices are stored as **integer cents** rather than floating-point currency values.

```text
R1.00 = 100
R249.99 = 24999
```

The order model keeps subtotal, shipping, discount, and total values in Rand cents.

This avoids making money a floating-point maths experiment.

---

## 12 / SHIPPING

Shipping is represented using zones and rates.

A rate can define its own price and an optional free-shipping threshold.

At checkout, the selected shipping rate contributes to the final order calculation.

```text
Cart subtotal
     ↓
Free-shipping threshold?
     ├── Yes → R0 shipping
     └── No  → Rate price
              ↓
        Order total
```

The order also stores the resolved shipping method so the order history remains readable without having to reconstruct the original checkout decision later.

---

## 13 / PAYMENT

Stripe handles the part where money becomes somebody else's problem.

Store uses **Stripe PaymentIntents** in **ZAR**.

The checkout server creates a PaymentIntent using the calculated order total and attaches useful order metadata to it:

```text
orderId
orderNumber
sessionId
customerEmail
```

That metadata gives the webhook enough context to identify the order that a Stripe event belongs to.

The order itself stores the Stripe PaymentIntent ID, along with separate order and payment states.

Those are two different concepts.

An order can be:

```text
pending
confirmed
processing
shipped
delivered
cancelled
refunded
```

while payment can independently move through:

```text
unpaid
paid
refunded
```

That distinction becomes increasingly useful once refunds, fulfilment, and customer support enter the picture.

---

## 14 / STRIPE WEBHOOKS

The browser saying “payment successful” is nice.

It is not the system of record.

Stripe sends the application webhook events, and the webhook verifies the Stripe signature before handling them. The current integration responds to successful and failed PaymentIntent events.

A successful payment currently drives the following sequence:

```text
Stripe
  ↓
payment_intent.succeeded
  ↓
Find order
  ↓
Confirm payment
  ↓
Confirm order
  ↓
Decrement variant stock
  ↓
Clear guest cart
  ↓
Send confirmation email
```

There is also an idempotency guard at the order level so an already-paid order is not processed a second time.

A failed payment moves the order into a cancelled/unpaid state and records the payment failure in the admin note.

---

## 15 / ORDERS

Orders are the historical record of what actually happened.

An order contains:

* Unique order number
* Customer
* Subtotal
* Shipping
* Discount
* Total
* Order status
* Payment status
* Payment method
* Stripe PaymentIntent ID
* Shipping address
* Shipping method
* Tracking number
* Tracking URL
* Coupon information
* Customer note
* Admin note
* Fulfilment timestamps

Order items deliberately snapshot the purchased product information:

```text
Product name
SKU
Size
Colour
Quantity
Unit price
Line total
```

Those snapshots are important.

If somebody renames a product six months later, the order from six months ago should still say what the customer actually bought.

The schema explicitly models these fields as purchase-time snapshots and protects the historical order relationship from casual product or variant deletion.

---

## 16 / WISHLISTS

Wishlists operate at the product level rather than the variant level.

In other words, the customer saves:

> “I like this shoe.”

rather than:

> “I would like this exact database row forever.”

The size or other variant choice can be made later when the customer moves the product toward the cart.

The database enforces one wishlist entry per customer/product pair.

---

## 17 / REVIEWS

Reviews belong to both a customer and a product.

Each review includes:

* Rating from 1–5
* Optional title
* Optional body
* Approval state
* Timestamps

The model allows one review per customer per product and holds reviews for administrative approval before they appear on the storefront.

Because apparently letting the internet publish whatever it wants directly into your product pages was considered a bad idea.

---

## 18 / ADMINISTRATION

Somebody has to operate the store.

The admin area exists for the unglamorous but necessary work:

```text
Products
├── Create
├── Edit
├── Availability
├── Variants
├── Inventory
└── Images

Catalogue
├── Categories
└── Brands

Customers
└── Customer records

Orders
├── Status
├── Fulfilment
├── Tracking
└── Notes
```

The purpose of the admin interface is not to recreate the storefront with smaller buttons.

It is an operational surface.

The customer is trying to buy something.

The admin is trying to make sure the thing exists, gets paid for, gets shipped, and doesn't mysteriously disappear into a database somewhere.

---

## 19 / THE DATA MODEL

The Prisma schema is structured around the actual commerce domain rather than treating the application as a collection of unrelated CRUD screens.

At the centre are:

```text
                         STORE
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
      PRODUCTS          CUSTOMERS          ORDERS
         │                 │                 │
    ┌────┼────┐       ┌────┼────┐       ┌────┼────┐
    │    │    │       │    │    │       │    │    │
Variants Images Reviews Cart Addresses  Items Payment
    │                 │
    │                 └── Wishlist
    │
Category / Brand
```

The schema currently includes models for categories, brands, products, images, variants, users, sessions, addresses, carts, orders, order items, wishlists, reviews, shipping, and coupons.

The goal is to keep business rules close to the data they describe while still leaving the application layer responsible for validation and orchestration.

---

## 20 / ARCHITECTURE

At the application level, the main pieces fit together like this:

```text
                         ┌──────────────────┐
                         │     CUSTOMER     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   NEXT.JS APP    │
                         │    APP ROUTER    │
                         └────────┬─────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
          Storefront           Server           API Routes
               │             Actions/Libs            │
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  │
                     ┌────────────┼────────────┐
                     │            │            │
                     ▼            ▼            ▼
                 PostgreSQL     Stripe       Resend
                     │
                     ▼
                   Prisma
```

The application uses the Next.js App Router, Prisma for database access, Stripe for payments, and Resend for transactional email.

The project also has dedicated Vitest and Playwright configurations for automated testing.

---

## 21 / TECH STACK

### Application

* **Next.js 15.5.18** — application framework
* **React 19.1.0** — UI
* **TypeScript 5.8.3** — types and application code
* **Tailwind CSS 4** — styling
* **Radix UI** — accessible primitives
* **Lucide React** — icons
* **Zod** — validation

### Commerce & infrastructure

* **Prisma 6.8.2** — ORM and schema management
* **PostgreSQL** — application database
* **Stripe 17.7.0** — payment processing
* **Resend 4.5.1** — transactional email
* **React Email** — email templates

### Testing

* **Vitest** — unit, component, and integration testing
* **Testing Library** — component interaction tests
* **Playwright** — browser-level end-to-end testing

The versions above are taken from the repository package manifest rather than an aspirational stack list.

---

## 22 / PROJECT STRUCTURE

The repository is currently organised around the application, database, scripts, and test suites:

```text
store/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── public/
│   └── ...
│
├── scripts/
│   ├── hashPassword.ts
│   └── setup-test-db.js
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── account/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── ...
│   │
│   ├── components/
│   ├── email/
│   └── lib/
│
├── test-utils/
├── tests/
│   ├── unit/
│   ├── components/
│   ├── integration/
│   └── e2e/
│
├── next.config.ts
├── package.json
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

It's a fairly sensible structure.

Please don't be the person who puts the entire application inside `components/ui/`.

We can all do better.

---

## 23 / RUN IT LOCALLY

### Requirements

You'll need:

* Node.js
* npm
* PostgreSQL
* Stripe test credentials
* A Resend API key for email testing

### Clone the repository

```bash
git clone https://github.com/andymutale/store.git
cd store
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create your local environment file from the example:

```bash
cp .env.example .env.local
```

Then provide your own values.

A typical local configuration looks like:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

ADMIN_USERNAME="admin"
HASHED_ADMIN_PASSWORD="..."

STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

RESEND_API_KEY="re_..."

NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

Do not commit real credentials.

### Set up the database

```bash
npm run db:setup
```

This runs the initial Prisma migration and seeds the database.

### Start development

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Administration is available at:

```text
http://localhost:3000/admin
```

Congratulations.

You are now looking at the website on your own computer.

---

## 24 / DATABASE COMMANDS

Push the current Prisma schema:

```bash
npm run db:push
```

Run Prisma migrations during development:

```bash
npx prisma migrate dev --name <what-changed>
```

Seed the database:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

Generate a new password hash:

```bash
npm run hash-password
```

---

## 25 / STRIPE LOCAL DEVELOPMENT

Install the Stripe CLI, then forward webhook events to the local app:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe will provide a webhook signing secret beginning with `whsec_`.

Put that value in:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

The webhook endpoint is:

```text
POST /api/webhooks/stripe
```

The route verifies the Stripe signature before handling payment events.

Use Stripe test-mode credentials during development.

---

## 26 / EMAIL

Transactional email is handled by **Resend** and **React Email**.

The payment webhook sends an order-confirmation email after a successful payment event.

The confirmation contains the key order information a customer actually cares about:

* Order number
* Purchased items
* Quantities
* Prices
* Shipping
* Total
* Shipping address
* Shipping method

The current development sender is configured as an example sender and should be replaced with a verified sending domain before a real deployment.

---

## 27 / TESTING

The project has three useful layers of automated testing.

### Unit tests

Small pieces of business logic can be exercised in isolation.

```bash
npm run test:unit
```

### Component tests

UI components and interactions can be tested without spinning up the entire application.

```bash
npm run test:components
```

### Integration tests

Integration tests use a separate test database setup script and exercise larger pieces of the application together.

```bash
npm run test:integration
```

### End-to-end tests

Playwright exercises the application from the browser.

```bash
npx playwright install chromium
npm run test:e2e
```

For the interactive Playwright UI:

```bash
npm run test:e2e:ui
```

### Coverage

```bash
npm run test:coverage
```

### Everything

```bash
npm run test:all
```

The repository exposes these commands directly through `package.json`.

---

## 28 / PRODUCTION BUILD

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Before deploying, configure the production database, Stripe keys and webhook, Resend sender domain, and application URL.

Do not take development credentials, local webhook secrets, or example environment values with you into production.

---

## 29 / DESIGN PRINCIPLES

### Build around the customer's job

Customers are not trying to “interact with a ProductVariant entity.”

They are trying to buy a pair of shoes.

The implementation can be complicated.

The interface shouldn't make the customer carry that complexity around in their head.

### Keep commerce state explicit

An order is not just a number and a total.

Payment state, fulfilment state, shipping, tracking, and historical line-item data all matter.

### Don't confuse the storefront with the system

The homepage is the visible part.

Products, inventory, accounts, payments, orders, email, and administration are what make the visible part useful.

### Make historical data survive change

Products get renamed.

Prices change.

Variants disappear.

An old order should still describe what somebody actually bought.

That's why order items contain purchase-time snapshots.

### Let the database describe the business

If a relationship matters to the business, it should probably exist as a relationship in the data model rather than being hidden in some mysterious object called `stuff`.

---

## 30 / WHY IT IS BUILT THIS WAY

A simpler project would have been easy.

One page.

A few products.

A fake cart.

A button called “Checkout.”

Done.

That would also demonstrate very little.

The point of Store is to explore what happens when an ecommerce application has to account for the boring parts as well:

```text
Product data
    ↓
Variants
    ↓
Inventory
    ↓
Customer identity
    ↓
Persistent cart
    ↓
Shipping
    ↓
Order creation
    ↓
Payment provider
    ↓
Webhook confirmation
    ↓
Stock update
    ↓
Email
    ↓
Operations
```

None of those pieces is particularly exotic.

The interesting bit is getting them to agree.

---

## 31 / THINGS THAT COULD GO WRONG

This is an ecommerce application, so there are plenty of opportunities.

A cart can outlive the stock it was based on.

Two people can want the last pair of the same shoes.

A payment can succeed while some other part of the application is having a bad afternoon.

An order can be created and then somebody can immediately discover that the delivery information is wrong.

A customer can close the browser at exactly the moment you'd rather they didn't.

The system therefore treats payment confirmation, inventory, order state, and customer communication as separate concerns rather than assuming one successful button click means the universe is now perfectly aligned.

The current implementation is a working project and case study, not a claim that commerce has somehow been solved forever.

---

## 32 / ROADMAP

The next layer of work naturally falls into a few areas.

### Commerce

* More complete discount and coupon application
* Richer fulfilment workflows
* Better stock reservation and concurrency handling
* Expanded shipping rules
* Additional payment methods

### Customer experience

* More account functionality
* Richer order history
* Improved wishlist-to-cart flows
* Better review management

### Operations

* More detailed admin reporting
* Improved customer support tooling
* Better inventory controls
* More operational events and audit information

### Platform

* Stronger deployment automation
* Better production observability
* More integration coverage
* More resilient background processing

The point is not to collect features for the sake of having a longer roadmap.

The point is to keep following the real lifecycle of a retail business.

---

## 33 / PROJECT STATUS

**Active engineering project · Ecommerce case study · 2026**

Store is an evolving project used to explore the implementation of a realistic ecommerce platform from storefront through payment and administration.

Some pieces are intentionally illustrative.

Some are fully wired together.

The distinction matters.

This repository is meant to show how the parts fit together, not pretend that one GitHub repository has somehow defeated every problem ever encountered by online retail.

---

## 34 / DISCLAIMER

**Saint Laurens Sporting Goods is fictional.**

The retailer, catalogue, products, customer records, orders, pricing, brands, and associated business information are illustrative.

This repository is a project and engineering case study.

It is not a production system for a real sporting-goods retailer.

---

## 35 / ABOUT THE PROJECT

Store was built as an exploration of full-stack ecommerce engineering across:

**product design → frontend engineering → backend logic → database modelling → payments → email → testing**

The interesting part isn't any single technology.

It is the relationship between them.

A good storefront can get somebody interested.

A good system has to deal with what happens next.

---

## 36 / ADARETH LABS

**Digital product design · Engineering · Systems architecture**

> **Build the system, not just the screen.**

Store is part of that idea.

The UI matters.

So does the machinery underneath it.

---

<div align="center">

### STORE

**Saint Laurens Sporting Goods**

Built with Next.js · React · TypeScript · Prisma · PostgreSQL · Stripe

**ADARETH LABS**

</div>

