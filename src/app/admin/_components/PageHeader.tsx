import { ReactNode } from "react"

// Simple left-border heading — matches the homepage section titles
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <h1
      className="font-extrabold text-text-primary mb-6"
      style={{ fontSize: "clamp(20px,4vw,28px)", borderLeft: "4px solid var(--brand-blue)", paddingLeft: 12 }}>
      {children}
    </h1>
  )
}
