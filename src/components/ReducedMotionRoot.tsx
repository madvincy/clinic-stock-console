import { MotionConfig, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Respects `prefers-reduced-motion: reduce` via Framer Motion's
 * MotionConfig. When the OS/browser requests reduced motion, all
 * descendant motion components skip transforms and use instant transitions.
 */
export function ReducedMotionRoot({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  )
}
