'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
    >
      Print Roster
    </button>
  )
}
