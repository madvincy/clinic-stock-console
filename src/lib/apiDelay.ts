/**
 * Runtime toggle for simulating a slow network.
 *
 * When enabled, apiClient's getDefaultDelayMs() returns
 * SIMULATED_DELAY_MS, which gets attached as ?delay= to requests.
 *
 * This lets testers exercise loading/skeleton states and the
 * search race-condition guard without setting VITE_API_DELAY
 * and restarting the dev server.
 */

const STORAGE_KEY = 'clinic-stock-console:simulate-slow-network'

export const SIMULATED_DELAY_MS = 2000

type Listener = () => void

const listeners = new Set<Listener>()

function readStored(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(STORAGE_KEY) === '1'
}

let enabled = readStored()

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function isSlowNetworkSimulationEnabled(): boolean {
  return enabled
}

export function setSlowNetworkSimulation(next: boolean): void {
  if (next === enabled) {
    return
  }

  enabled = next

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  emit()
}

export function toggleSlowNetworkSimulation(): void {
  setSlowNetworkSimulation(!enabled)
}

export function subscribeSlowNetworkSimulation(
  listener: Listener
): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
