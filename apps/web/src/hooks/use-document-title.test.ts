import { describe, expect, test } from 'bun:test'
import {
  formatDocumentTitle,
  LAUNCHER_DOCUMENT_TITLE,
} from './use-document-title'

describe('formatDocumentTitle', () => {
  test('uses the product title without a section', () => {
    expect(formatDocumentTitle()).toBe(LAUNCHER_DOCUMENT_TITLE)
    expect(formatDocumentTitle('   ')).toBe(LAUNCHER_DOCUMENT_TITLE)
  })

  test('identifies the current browser surface', () => {
    expect(formatDocumentTitle('New Task')).toBe('New Task — Launcher Web')
    expect(formatDocumentTitle('  General  ')).toBe('General — Launcher Web')
  })

  test('does not duplicate the product title', () => {
    expect(formatDocumentTitle(LAUNCHER_DOCUMENT_TITLE)).toBe(LAUNCHER_DOCUMENT_TITLE)
  })
})
