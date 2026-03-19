'use client'

export function PrintButton({ warbandId }: { warbandId?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
      >
        Print
      </button>
      {warbandId && (
        <a
          href={`/api/warbands/${warbandId}/pdf`}
          className="px-4 py-2 text-sm rounded border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
        >
          Download PDF
        </a>
      )}
    </div>
  )
}
