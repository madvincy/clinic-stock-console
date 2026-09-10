type ToastVariant = 'success' | 'error'

export interface AppToast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type Listener = (toasts: AppToast[]) => void

let toasts: AppToast[] = []
const listeners = new Set<Listener>()

function emit(): void {
  listeners.forEach((listener) => listener(toasts))
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function showToast(
  toast: Omit<AppToast, 'id'> & { id?: string }
): string {
  const id = toast.id ?? nextId()
  toasts = [...toasts, { ...toast, id }]
  emit()
  window.setTimeout(() => dismissToast(id), 3200)
  return id
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

export function clearToasts(): void {
  toasts = []
  emit()
}

export function getToasts(): AppToast[] {
  return toasts
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener(toasts)
  return () => {
    listeners.delete(listener)
  }
}
