import { describe, expect, it } from 'vitest'

import { safeRedirect } from '../redirect'

describe('safeRedirect', () => {
  it('keeps internal paths', () => {
    expect(safeRedirect('/documents?page=2')).toBe('/documents?page=2')
  })

  it.each([undefined, '', 'https://evil.test', '//evil.test', ['/']])(
    'falls back to / for %s',
    (target) => {
      expect(safeRedirect(target)).toBe('/')
    },
  )
})
