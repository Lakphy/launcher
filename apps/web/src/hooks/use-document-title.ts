import { useEffect } from 'react'

export const LAUNCHER_DOCUMENT_TITLE = 'Launcher Web'

export function formatDocumentTitle(section?: string | null): string {
  const normalized = section?.trim()
  if (!normalized || normalized === LAUNCHER_DOCUMENT_TITLE) return LAUNCHER_DOCUMENT_TITLE
  return `${normalized} — ${LAUNCHER_DOCUMENT_TITLE}`
}

export function useDocumentTitle(section?: string | null) {
  const title = formatDocumentTitle(section)
  useEffect(() => {
    document.title = title
  }, [title])
}
