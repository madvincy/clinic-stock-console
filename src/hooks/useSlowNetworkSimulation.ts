import { useSyncExternalStore } from 'react'
import {
  isSlowNetworkSimulationEnabled,
  subscribeSlowNetworkSimulation,
  toggleSlowNetworkSimulation,
} from '@/lib/apiDelay'

export function useSlowNetworkSimulation() {
  const enabled = useSyncExternalStore(
    subscribeSlowNetworkSimulation,
    isSlowNetworkSimulationEnabled,
    isSlowNetworkSimulationEnabled
  )

  return { enabled, toggle: toggleSlowNetworkSimulation }
}
