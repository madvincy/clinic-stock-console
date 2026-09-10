import { Button } from '@/components/ui/button'

interface QueryErrorStateProps {
  title: string
  message: string
  onRetry: () => void
}

export function QueryErrorState({
  title,
  message,
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div
      className="rounded-md border border-destructive/30 bg-destructive/5 p-6"
      role="alert"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button type="button" className="mt-4" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
