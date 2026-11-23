import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

export interface LatestRelease {
  version: string
  url: string
  pubDate: string | null
}

const RELEASES_PAGE = 'https://github.com/Lakphy/launcher/releases'

export const FALLBACK_DOWNLOAD_URL = RELEASES_PAGE

export const WINDOWS_ARCHITECTURES = [
  { arch: 'x86_64', label: 'Windows (x86_64)' },
  { arch: 'aarch64', label: 'Windows (arm64)' },
] as const

// Every release publishes both installers under versioned names — see
// docs/windows.md. There is no unversioned "latest" object to link at, so a
// direct link needs the resolved version; without one the menu falls back to
// the docs page rather than guessing a URL that would 404.
export function windowsInstallerUrl(_version: string, _arch: string) {
  return RELEASES_PAGE
}

// The Sparkle appcast has no CORS headers, so resolve it on the server.
const fetchLatestRelease = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LatestRelease | null> => {
    try {
      const res = await fetch(
        'https://api.github.com/repos/Lakphy/launcher/releases/latest',
        {
          headers: { Accept: 'application/vnd.github+json' },
          signal: AbortSignal.timeout(2500),
        },
      )
      if (!res.ok) return null
      const body = (await res.json()) as {
        tag_name?: string
        published_at?: string
      }
      const version = body.tag_name?.replace(/^v/, '')
      if (!version) return null
      return {
        version,
        url: RELEASES_PAGE,
        pubDate: body.published_at ?? null,
      }
    } catch {
      return null
    }
  },
)

export const releaseQuery = queryOptions({
  queryKey: ['latest-release'],
  queryFn: () => fetchLatestRelease(),
  staleTime: 5 * 60_000,
})
