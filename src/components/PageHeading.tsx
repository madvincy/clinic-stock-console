import { useEffect, useRef, type ReactNode } from 'react'

export function PageHeading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <h1
      ref={ref}
      tabIndex={-1}
      className="text-2xl font-semibold tracking-tight outline-none"
    >
      {children}
    </h1>
  )
}
