// src/email/OrderConfirmation.tsx
// ─── ORDER CONFIRMATION EMAIL ─────────────────────────────────────────────────
// Sent via Resend from the Stripe webhook after payment_intent.succeeded.
// Preview: npx react-email dev (serves at localhost:3000 with hot-reload)

import {
  Body, Container, Head, Heading, Html, Preview, Tailwind,
  Section, Row, Column, Text, Button, Hr,
} from "@react-email/components"
import { formatCurrency } from "@/lib/formatters"

type OrderItem = {
  productName:     string
  size?:           string | null
  color?:          string | null
  quantity:        number
  totalInCents:    number
}

type ShippingAddress = {
  firstName:  string
  lastName:   string
  line1:      string
  line2?:     string | null
  city:       string
  province:   string
  postalCode: string
}

type Props = {
  orderNumber:      string
  customerName:     string
  items:            OrderItem[]
  subtotalInCents:  number
  shippingInCents:  number
  totalInCents:     number
  shippingMethod?:  string | null
  shippingAddress?: ShippingAddress | null
}

// Preview props for react-email dev server
OrderConfirmationEmail.PreviewProps = {
  orderNumber:     "BB-2026-00001",
  customerName:    "Thabo",
  items: [
    { productName: "Adidas Adizero Boston 13 – Men", size: "UK 9", color: "Cloud White", quantity: 1, totalInCents: 264000 },
    { productName: "Bafana Bafana 26/27 Home Jersey", size: "L", color: null, quantity: 2, totalInCents: 320000 },
  ],
  subtotalInCents:  584000,
  shippingInCents:  9900,
  totalInCents:     593900,
  shippingMethod:   "Gauteng — Economy (3–4 days)",
  shippingAddress:  { firstName: "Thabo", lastName: "Nkosi", line1: "12 Main Road", city: "Johannesburg", province: "GP", postalCode: "2001" },
} satisfies Props

const DATE_FMT = new Intl.DateTimeFormat("en-ZA", { dateStyle: "long" })

export default function OrderConfirmationEmail({
  orderNumber, customerName, items, subtotalInCents,
  shippingInCents, totalInCents, shippingMethod, shippingAddress,
}: Props) {
  const orderUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${orderNumber}`

  return (
    <Html>
      <Preview>Your Brian Bands order {orderNumber} is confirmed 🎉</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="max-w-xl mx-auto bg-white rounded-lg my-8 overflow-hidden shadow-sm">

            {/* Brand header */}
            <Section className="bg-[#2B7BB9] px-6 py-5">
              <Text className="text-white font-extrabold text-lg tracking-widest m-0 uppercase">
                Brian Bands Sports
              </Text>
              <Text className="text-white/70 text-xs m-0 italic">Gqeberha · est. 1958</Text>
            </Section>

            {/* Main content */}
            <Section className="px-6 py-6">
              <Heading className="text-gray-800 text-2xl font-bold mb-1 mt-0">
                Thanks, {customerName}! 🎉
              </Heading>
              <Text className="text-gray-500 text-sm mt-0 mb-4">
                Your order <strong>{orderNumber}</strong> has been confirmed and is being prepared for dispatch.
              </Text>

              {/* Order meta */}
              <Row className="mb-4">
                <Column>
                  <Text className="text-gray-400 text-xs m-0">Order number</Text>
                  <Text className="text-gray-700 text-sm font-bold mt-0.5">{orderNumber}</Text>
                </Column>
                <Column>
                  <Text className="text-gray-400 text-xs m-0">Date</Text>
                  <Text className="text-gray-700 text-sm mt-0.5">{DATE_FMT.format(new Date())}</Text>
                </Column>
                <Column>
                  <Text className="text-gray-400 text-xs m-0">Total paid</Text>
                  <Text className="text-gray-700 text-sm font-bold mt-0.5">{formatCurrency(totalInCents / 100)}</Text>
                </Column>
              </Row>

              <Hr className="border-gray-200 my-4" />

              {/* Items */}
              <Text className="text-gray-700 font-semibold text-sm mb-2">Items ordered</Text>
              {items.map((item, i) => (
                <Row key={i} className="mb-2">
                  <Column className="flex-1">
                    <Text className="text-gray-800 text-sm font-medium m-0">{item.productName}</Text>
                    <Text className="text-gray-400 text-xs mt-0.5 m-0">
                      {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="text-gray-700 text-sm font-semibold m-0">
                      {formatCurrency(item.totalInCents / 100)}
                    </Text>
                  </Column>
                </Row>
              ))}

              <Hr className="border-gray-100 my-3" />

              {/* Totals */}
              <Row className="mb-1">
                <Column><Text className="text-gray-500 text-xs m-0">Subtotal</Text></Column>
                <Column align="right"><Text className="text-gray-600 text-xs m-0">{formatCurrency(subtotalInCents / 100)}</Text></Column>
              </Row>
              <Row className="mb-1">
                <Column><Text className="text-gray-500 text-xs m-0">Shipping</Text></Column>
                <Column align="right">
                  <Text className="text-xs m-0 font-medium" style={{ color: shippingInCents === 0 ? "#22c55e" : "#6b7280" }}>
                    {shippingInCents === 0 ? "FREE" : formatCurrency(shippingInCents / 100)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column><Text className="text-gray-800 text-sm font-bold m-0">Total</Text></Column>
                <Column align="right"><Text className="text-gray-800 text-sm font-bold m-0">{formatCurrency(totalInCents / 100)}</Text></Column>
              </Row>

              <Hr className="border-gray-200 my-4" />

              {/* Shipping address + method */}
              {shippingAddress && (
                <>
                  <Text className="text-gray-700 font-semibold text-sm mb-1">Delivering to</Text>
                  <Text className="text-gray-500 text-sm m-0">
                    {shippingAddress.firstName} {shippingAddress.lastName}<br />
                    {shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br />
                    {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}
                  </Text>
                  {shippingMethod && (
                    <Text className="text-gray-400 text-xs mt-1">Via {shippingMethod}</Text>
                  )}
                  <Hr className="border-gray-200 my-4" />
                </>
              )}

              {/* CTA */}
              <Section className="text-center mt-4">
                <Button href={orderUrl}
                  className="bg-[#2B7BB9] text-white font-bold px-6 py-3 rounded text-sm no-underline">
                  View Order
                </Button>
              </Section>

              <Text className="text-gray-400 text-xs text-center mt-4">
                Questions? Reply to this email or call{" "}
                <a href="tel:+27413635499" style={{ color: "#2B7BB9" }}>041 363 5499</a>
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Text className="text-gray-400 text-xs text-center m-0">
                Brian Bands Sports · Gqeberha, South Africa<br />
                You're receiving this because you placed an order with us.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
