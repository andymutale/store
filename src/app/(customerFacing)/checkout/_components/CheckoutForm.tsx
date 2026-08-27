"use client"
// src/app/(customerFacing)/checkout/_components/CheckoutForm.tsx
// ─── TWO-STEP CHECKOUT ────────────────────────────────────────────────────────
// Step 1 "details":  Address form + shipping selector + order summary
// Step 2 "payment":  Stripe PaymentElement replaces the form + same summary
//
// Transitions happen client-side; no full page reload needed.

import { useState, useMemo } from "react"
import Image from "next/image"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { formatCurrency } from "@/lib/formatters"
import { createOrder } from "@/app/_actions/checkout"
import { Lock, ChevronRight, Truck, RotateCcw } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

// ─── TYPES ────────────────────────────────────────────────────────────────────

type CartLine = {
  id:               string
  quantity:         number
  productName:      string
  brandName:        string | null
  size:             string | null
  color:            string | null
  imageUrl:         string | null
  imageAlt:         string
  unitPriceInCents: number
  lineTotalInCents: number
}

type ShippingRate = {
  id:            string
  name:          string
  priceInCents:  number
  freeThreshold: number | null
  estimatedDays: string | null
}

type ShippingZone = {
  id:        string
  name:      string
  provinces: string[] // e.g. ["GP"] or ["WC","NC"]
  rates:     ShippingRate[]
}

type Props = {
  cartLines:        CartLine[]
  subtotalInCents:  number
  shippingZones:    ShippingZone[]
}

// SA provinces for the dropdown
const SA_PROVINCES = [
  { code: "EC", name: "Eastern Cape" },
  { code: "FS", name: "Free State" },
  { code: "GP", name: "Gauteng" },
  { code: "KZN", name: "KwaZulu-Natal" },
  { code: "LP", name: "Limpopo" },
  { code: "MP", name: "Mpumalanga" },
  { code: "NC", name: "Northern Cape" },
  { code: "NW", name: "North West" },
  { code: "WC", name: "Western Cape" },
]

// ─── OUTER WRAPPER ────────────────────────────────────────────────────────────

export function CheckoutForm({ cartLines, subtotalInCents, shippingZones }: Props) {
  const [step,          setStep]          = useState<"details" | "payment">("details")
  const [clientSecret,  setClientSecret]  = useState<string | null>(null)
  const [orderNumber,   setOrderNumber]   = useState<string | null>(null)
  const [selectedRate,  setSelectedRate]  = useState<ShippingRate | null>(null)
  const [province,      setProvince]      = useState("")
  const [formData,      setFormData]      = useState<FormData | null>(null)

  // Derive available rates from selected province
  const availableRates = useMemo<ShippingRate[]>(() => {
    if (!province) return []
    const zone = shippingZones.find(z => z.provinces.includes(province))
    return zone?.rates ?? []
  }, [province, shippingZones])

  // Effective shipping price (free if above threshold)
  const shippingInCents = useMemo(() => {
    if (!selectedRate) return null
    if (selectedRate.freeThreshold && subtotalInCents >= selectedRate.freeThreshold) return 0
    return selectedRate.priceInCents
  }, [selectedRate, subtotalInCents])

  const totalInCents = subtotalInCents + (shippingInCents ?? 0)

  // Errors
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    setIsSubmitting(true)

    const fd = new FormData(e.currentTarget)
    setFormData(fd)

    const result = await createOrder(fd)

    if (!result.ok) {
      if (result.fieldErrors) setErrors(result.fieldErrors)
      else setGlobalError(result.error)
      setIsSubmitting(false)
      return
    }

    setClientSecret(result.clientSecret)
    setOrderNumber(result.orderNumber)
    setStep("payment")
    setIsSubmitting(false)
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* ── Left: form / payment ────────────────────────────────── */}
      <div className="lg:col-span-3">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <StepBadge n={1} active={step === "details"} done={step === "payment"} label="Details & Shipping" />
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <StepBadge n={2} active={step === "payment"} done={false} label="Payment" />
        </div>

        {/* ── STEP 1: Address + Shipping ─────────────────────────── */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-6">

            {globalError && (
              <div className="bg-red-50 border border-brand-red text-brand-red rounded-sm px-4 py-3 text-sm">
                {globalError}
              </div>
            )}

            {/* Contact */}
            <FormSection title="Contact information">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" error={errors.firstName}>
                  <input name="firstName" required className="input-base" placeholder="Thabo" />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <input name="lastName" required className="input-base" placeholder="Nkosi" />
                </Field>
              </div>
              <Field label="Email address" error={errors.email}>
                <input name="email" type="email" required className="input-base" placeholder="you@example.com" />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <input name="phone" type="tel" required className="input-base" placeholder="0XX XXX XXXX" />
              </Field>
            </FormSection>

            {/* Delivery address */}
            <FormSection title="Delivery address">
              <Field label="Street address" error={errors.line1}>
                <input name="line1" required className="input-base" placeholder="12 Main Road" />
              </Field>
              <Field label="Apartment, unit, complex (optional)">
                <input name="line2" className="input-base" placeholder="Apt 3B" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" error={errors.city}>
                  <input name="city" required className="input-base" placeholder="Cape Town" />
                </Field>
                <Field label="Province" error={errors.province}>
                  <select name="province" required className="input-base"
                    value={province}
                    onChange={e => { setProvince(e.target.value); setSelectedRate(null) }}>
                    <option value="">— Select province —</option>
                    {SA_PROVINCES.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Postal code" error={errors.postalCode}>
                <input name="postalCode" required className="input-base w-32" placeholder="6001" />
              </Field>
            </FormSection>

            {/* Shipping rates — shown once province is selected */}
            <FormSection title="Shipping method">
              {!province ? (
                <p className="text-text-muted text-sm py-2">Select a province above to see shipping options.</p>
              ) : availableRates.length === 0 ? (
                <p className="text-brand-red text-sm py-2">No shipping options available for this province. Please contact us.</p>
              ) : (
                <div className="space-y-2">
                  {availableRates.map(rate => {
                    const effectivePrice = rate.freeThreshold && subtotalInCents >= rate.freeThreshold ? 0 : rate.priceInCents
                    const isFree = effectivePrice === 0
                    const isSelected = selectedRate?.id === rate.id

                    return (
                      <label key={rate.id}
                        className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors
                          ${isSelected ? "border-brand-blue bg-brand-blue-light" : "border-border-color bg-white hover:bg-off-white"}`}>
                        <input type="radio" name="shippingRateId" value={rate.id} required
                          checked={isSelected}
                          onChange={() => setSelectedRate(rate)}
                          className="mt-0.5 accent-brand-blue" />
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-semibold text-sm text-text-primary">{rate.name}</span>
                            <span className={`font-bold text-sm ${isFree ? "text-brand-green" : "text-text-primary"}`}>
                              {isFree ? "FREE" : formatCurrency(effectivePrice / 100)}
                            </span>
                          </div>
                          {rate.estimatedDays && (
                            <p className="text-xs text-text-muted mt-0.5">Estimated {rate.estimatedDays}</p>
                          )}
                          {rate.freeThreshold && !isFree && (
                            <p className="text-xs text-brand-green mt-0.5">
                              Free over {formatCurrency(rate.freeThreshold / 100)}
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {errors.shippingRateId && (
                <p className="text-brand-red text-xs">{errors.shippingRateId[0]}</p>
              )}
            </FormSection>

            {/* Order note */}
            <FormSection title="Order note (optional)">
              <textarea name="customerNote" rows={2} className="input-base resize-none"
                placeholder="Special delivery instructions, gate codes, etc." />
            </FormSection>

            {/* Trust strip */}
            <div className="flex gap-4 text-xs text-text-muted flex-wrap">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure payment</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Nationwide delivery</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> 30-day returns</span>
            </div>

            <button type="submit"
              disabled={isSubmitting || !selectedRate}
              className="w-full bg-brand-blue text-white font-bold py-4 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? "Preparing your order…" : <><Lock className="w-4 h-4" /> Continue to Payment</>}
            </button>
          </form>
        )}

        {/* ── STEP 2: Stripe Payment ──────────────────────────────── */}
        {step === "payment" && clientSecret && (
          <div>
            <div className="bg-brand-blue-light border border-brand-blue rounded-sm px-4 py-3 mb-6 text-sm text-brand-blue-dark">
              <strong>Order {orderNumber}</strong> · Complete your payment below to confirm.
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary:     "#FF4747",
                    colorBackground:  "#ffffff",
                    colorText:        "#1A2332",
                    colorDanger:      "#E4572E",
                    borderRadius:     "2px",
                    fontFamily:       "Inter, system-ui, sans-serif",
                  },
                },
              }}>
              <PaymentStep
                orderNumber={orderNumber!}
                totalInCents={totalInCents}
              />
            </Elements>
          </div>
        )}
      </div>

      {/* ── Right: Order summary ────────────────────────────────── */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-border-color rounded-md p-5 sticky top-4">
          <h2 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wide">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {cartLines.map(line => (
              <div key={line.id} className="flex gap-3">
                <div className="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-light-grey">
                  {line.imageUrl && (
                    <Image src={line.imageUrl} alt={line.imageAlt} fill className="object-cover" />
                  )}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-text-secondary text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {line.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">{line.productName}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    {line.size  && <span className="text-xs text-text-muted">{line.size}</span>}
                    {line.color && <span className="text-xs text-text-muted">· {line.color}</span>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-text-primary flex-shrink-0">
                  {formatCurrency(line.lineTotalInCents / 100)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border-color pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotalInCents / 100)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span>
                {shippingInCents === null
                  ? <span className="text-text-muted">Select shipping</span>
                  : shippingInCents === 0
                    ? <span className="text-brand-green font-semibold">FREE</span>
                    : formatCurrency(shippingInCents / 100)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-text-primary text-base border-t border-border-color pt-2">
              <span>Total</span>
              <span>{formatCurrency(totalInCents / 100)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── PAYMENT STEP ─────────────────────────────────────────────────────────────
// Rendered inside <Elements> so it can use useStripe / useElements.

function PaymentStep({ orderNumber, totalInCents }: { orderNumber: string; totalInCents: number }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setIsLoading(true)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_number=${orderNumber}`,
      },
    })

    // We only reach here if Stripe didn't redirect (i.e. there was an error)
    if (stripeError?.type === "card_error" || stripeError?.type === "validation_error") {
      setError(stripeError.message ?? "Payment failed.")
    } else if (stripeError) {
      setError("An unexpected error occurred. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-brand-red text-brand-red rounded-sm px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <PaymentElement />

      <button type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-brand-blue text-white font-bold py-4 rounded-sm text-sm hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading
          ? "Processing…"
          : <><Lock className="w-4 h-4" /> Pay {formatCurrency(totalInCents / 100)}</>}
      </button>

      <p className="text-xs text-text-muted text-center flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> Secured by Stripe. Your card details are never stored by Saint Laurens Sporting Goods.
      </p>
    </form>
  )
}

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────

function StepBadge({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 font-medium text-xs ${active ? "text-brand-blue" : done ? "text-brand-green" : "text-text-muted"}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
        ${active ? "bg-brand-blue text-white" : done ? "bg-brand-green text-white" : "bg-light-grey text-text-muted"}`}>
        {n}
      </span>
      {label}
    </span>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3 bg-white border border-border-color rounded-md p-4">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      {children}
      {error && <p className="text-brand-red text-xs">{error[0]}</p>}
    </div>
  )
}
