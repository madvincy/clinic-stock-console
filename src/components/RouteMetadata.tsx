import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

type RouteHandle = {
  title?: string
  description?: string
}

export function RouteMetadata() {
  const matches = useMatches()

  useEffect(() => {
    const currentMatch = [...matches].reverse().find((match) => {
      const handle = match.handle as RouteHandle | undefined
      return handle?.title || handle?.description
    })

    const handle = currentMatch?.handle as RouteHandle | undefined

    document.title = handle?.title ?? 'Clinic Stock Console'

    setMeta(
      'description',
      handle?.description ?? 'Clinic stock management and inventory console'
    )
  }, [matches])

  return null
}

function setMeta(name: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`
  )

  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }

  meta.content = content
}
