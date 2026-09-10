import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dismissToast, subscribeToasts, type AppToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

export function AppToaster() {
  const [toasts, setToasts] = useState<AppToast[]>([])

  useEffect(() => subscribeToasts(setToasts), [])

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(100%-2rem,24rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto rounded-md border px-4 py-3 shadow-lg',
              toast.variant === 'error'
                ? 'border-destructive/40 bg-destructive text-destructive-foreground'
                : 'border-border bg-card text-card-foreground'
            )}
            role={toast.variant === 'error' ? 'alert' : 'status'}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded-sm text-sm underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
