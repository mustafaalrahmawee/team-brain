import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useLayoutStore } from '../layout'

function setDesktop(matches) {
  window.matchMedia = vi.fn(() => ({ matches }))
}

describe('layout store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts with a pinned, non-floating sidebar', () => {
    const layout = useLayoutStore()

    expect(layout.pinned).toBe(true)
    expect(layout.floating).toBe(false)
  })

  it('collapses and re-pins the sidebar on desktop', () => {
    setDesktop(true)
    const layout = useLayoutStore()

    layout.toggle()
    expect(layout.pinned).toBe(false)

    layout.open()
    expect(layout.pinned).toBe(true)
    expect(layout.floating).toBe(false)
  })

  it('docks a hovered sidebar on desktop when its toggle is clicked', () => {
    setDesktop(true)
    const layout = useLayoutStore()
    layout.toggle()

    layout.peek()
    layout.toggle()

    expect(layout.pinned).toBe(true)
    expect(layout.floating).toBe(false)
  })

  it('opens the sidebar as an overlay on mobile and closes it again', () => {
    setDesktop(false)
    const layout = useLayoutStore()

    layout.open()
    expect(layout.floating).toBe(true)

    layout.toggle()
    expect(layout.floating).toBe(false)
  })

  it('hides a peeking sidebar when the mouse leaves', () => {
    const layout = useLayoutStore()

    layout.peek()
    layout.close()

    expect(layout.floating).toBe(false)
  })

  it('remembers a collapsed sidebar after a reload', async () => {
    setDesktop(true)
    useLayoutStore().toggle()
    await nextTick()

    expect(localStorage.getItem('teambrain_sidebar_pinned')).toBe('false')

    // Neuer Store wie nach einem Reload
    setActivePinia(createPinia())
    expect(useLayoutStore().pinned).toBe(false)
  })
})
