interface NetworkStatusBannerProps {
  isOnline: boolean
}

export function NetworkStatusBanner({ isOnline }: NetworkStatusBannerProps) {
  if (isOnline) return null

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
      You are currently offline. Check your network connection.
    </div>
  )
}