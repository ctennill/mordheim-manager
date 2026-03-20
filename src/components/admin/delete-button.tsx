'use client'

import { useTransition } from 'react'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({ action, label = 'Delete', confirmMessage = 'Are you sure? This cannot be undone.' }: DeleteButtonProps) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => { action() })
        }
      }}
      className="px-3 py-1.5 text-xs border border-red-800/50 text-red-400 hover:bg-red-950/30 rounded transition-colors disabled:opacity-40"
    >
      {pending ? 'Deleting…' : label}
    </button>
  )
}
