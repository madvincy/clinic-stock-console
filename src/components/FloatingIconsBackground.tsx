import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  Pill,
  Stethoscope,
  Package,
  ClipboardList,
  HeartPulse,
  Syringe,
  Boxes,
  Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface IconSpec {
  Icon: LucideIcon
  top: string
  left: string
  size: number
  duration: number
  delay: number
}

const ICON_SPECS: IconSpec[] = [
  { Icon: Pill, top: '10%', left: '8%', size: 32, duration: 7, delay: 0 },
  {
    Icon: Stethoscope,
    top: '18%',
    left: '82%',
    size: 40,
    duration: 9,
    delay: 1,
  },
  { Icon: Package, top: '65%', left: '10%', size: 36, duration: 8, delay: 0.5 },
  {
    Icon: ClipboardList,
    top: '78%',
    left: '72%',
    size: 34,
    duration: 10,
    delay: 2,
  },
  {
    Icon: HeartPulse,
    top: '42%',
    left: '50%',
    size: 26,
    duration: 6,
    delay: 1.5,
  },
  {
    Icon: Syringe,
    top: '12%',
    left: '45%',
    size: 28,
    duration: 8.5,
    delay: 0.8,
  },
  { Icon: Boxes, top: '55%', left: '90%', size: 38, duration: 7.5, delay: 2.5 },
  {
    Icon: Building2,
    top: '86%',
    left: '32%',
    size: 30,
    duration: 9.5,
    delay: 1.2,
  },
]

// Distance in px within which an icon is pushed away from the cursor.
const AVOID_RADIUS = 110
const PUSH_DISTANCE = 46

function FloatingIcon({ spec }: { spec: IconSpec }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 140, damping: 18 })
  const springY = useSpring(y, { stiffness: 140, damping: 18 })

  useEffect(() => {
    let frame: number | null = null

    function handleMove(event: MouseEvent) {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = cx - event.clientX
        const dy = cy - event.clientY
        const distance = Math.hypot(dx, dy)

        if (distance < AVOID_RADIUS && distance > 0) {
          const strength = (AVOID_RADIUS - distance) / AVOID_RADIUS
          x.set((dx / distance) * strength * PUSH_DISTANCE)
          y.set((dy / distance) * strength * PUSH_DISTANCE)
        } else {
          x.set(0)
          y.set(0)
        }
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [x, y])

  const { Icon, top, left, size, duration, delay } = spec

  return (
    <motion.div
      ref={ref}
      className="absolute text-primary/15"
      style={{ top, left, x: springX, y: springY }}
      animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon size={size} strokeWidth={1.5} />
    </motion.div>
  )
}

/** Decorative, animated clinic/stock icons that gently drift and part around the cursor. */
export function FloatingIconsBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {ICON_SPECS.map((spec, index) => (
        <FloatingIcon key={index} spec={spec} />
      ))}
    </div>
  )
}
