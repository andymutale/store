import { Body, Container, Head, Heading, Html, Preview, Tailwind, Section, Row, Column, Img, Button, Text, Hr } from "@react-email/components"
import { formatCurrency } from "@/lib/formatters"
import React from "react"

type Order = {
  id: string
  pricePaidInCents: number
  createdAt: Date
  downloadVerificationId: string
  product: { id: string; name: string; imagePath: string; description: string }
}

OrderHistoryEmail.PreviewProps = {
  orders: [
    {
      id: "order-1", pricePaidInCents: 1999, createdAt: new Date(),
      downloadVerificationId: "token-1",
      product: { id: "p1", name: "Sample Product", imagePath: "/products/sample.jpg", description: "A great product." },
    },
  ],
} satisfies { orders: Order[] }

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

export default function OrderHistoryEmail({ orders }: { orders: Order[] }) {
  return (
    <Html>
      <Preview>Your Order History</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="max-w-xl mx-auto bg-white rounded-lg my-8 overflow-hidden">

            {/* Header bar */}
            <Section className="bg-[#FF4747] px-6 py-5">
              <Text className="text-white font-extrabold text-lg tracking-widest m-0">SAINT LAURENS SPORTING GOODS</Text>
              <Text className="text-white/70 text-xs m-0">Order History</Text>
            </Section>

            <Section className="px-6 py-6">
              <Heading className="text-gray-800 text-2xl font-bold mb-1">Your Orders</Heading>
              <Text className="text-gray-500 text-sm mt-0 mb-4">
                Here are all your purchases. Download links are valid for 24 hours from the time this email was sent.
              </Text>

              {orders.map((order, index) => (
                <React.Fragment key={order.id}>
                  {/* Order meta */}
                  <Row className="mb-3">
                    <Column className="pr-4">
                      <Text className="text-gray-400 text-xs m-0">Date</Text>
                      <Text className="text-gray-700 text-sm font-medium mt-0.5">{dateFormatter.format(order.createdAt)}</Text>
                    </Column>
                    <Column>
                      <Text className="text-gray-400 text-xs m-0">Paid</Text>
                      <Text className="text-gray-700 text-sm font-bold mt-0.5">{formatCurrency(order.pricePaidInCents / 100)}</Text>
                    </Column>
                  </Row>

                  {/* Product card */}
                  <Section className="border border-gray-200 rounded-md overflow-hidden mb-4">
                    <Img
                      src={`${process.env.NEXT_PUBLIC_SERVER_URL}${order.product.imagePath}`}
                      alt={order.product.name}
                      width="100%"
                      style={{ maxHeight: 160, objectFit: "cover" }}
                    />
                    <Section className="px-4 py-3">
                      <Row>
                        <Column>
                          <Text className="text-gray-800 font-bold text-sm m-0">{order.product.name}</Text>
                          <Text className="text-gray-500 text-xs mt-1 mb-0">{order.product.description}</Text>
                        </Column>
                        <Column align="right" className="pl-4">
                          <Button
                            href={`${process.env.NEXT_PUBLIC_SERVER_URL}/products/${order.product.id}/download/${order.downloadVerificationId}`}
                            className="bg-[#FF4747] text-white font-bold px-4 py-2 rounded text-xs no-underline">
                            Download
                          </Button>
                        </Column>
                      </Row>
                    </Section>
                  </Section>

                  {index < orders.length - 1 && <Hr className="border-gray-200 my-4" />}
                </React.Fragment>
              ))}

              <Text className="text-gray-400 text-xs text-center mt-4">
                Need help? Reply to this email or call 000 000 0000
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
