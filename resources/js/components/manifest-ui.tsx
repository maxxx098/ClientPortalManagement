import React from "react"

/**
 * Small shared primitives for the field-ops instrument-panel theme.
 * Drop this at e.g. @/components/manifest/manifest-ui and import
 * { SectionLabel } where you want the indexed eyebrow treatment used
 * on the dashboard (e.g. "01  Total projects").
 */

export function SectionLabel({
  index,
  children,
}: {
  index: string
  children: React.ReactNode
}) {
  return (
    <div className="mp-section-label">
      <span className="mp-index">{index}</span>
      <span>{children}</span>
    </div>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mp-caption" style={{ color: "hsl(var(--primary))" }}>{children}</p>
}