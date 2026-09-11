import { useState, useEffect } from 'react'

interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  rtt?: number
  downlink?: number
  saveData?: boolean
  type?:
    | 'bluetooth'
    | 'cellular'
    | 'ethernet'
    | 'none'
    | 'wifi'
    | 'wimax'
    | 'other'
    | 'unknown'
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

export interface NetworkStatus {
  isOnline: boolean
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
  type: string
}

function getNetworkDetails(): NetworkStatus {
  const nav = navigator as NavigatorWithConnection
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection

  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false,
    type: connection?.type || 'unknown',
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkDetails)

  useEffect(() => {
    const updateStatus = () => setStatus(getNetworkDetails())

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    const nav = navigator as NavigatorWithConnection
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection

    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return status
}
