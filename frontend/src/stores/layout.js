import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const PINNED_KEY = 'teambrain_sidebar_pinned'

// Ab 768px (Tailwinds "md") gilt der Bildschirm als groß
function isDesktop() {
  return window.matchMedia('(min-width: 768px)').matches
}

export const useLayoutStore = defineStore('layout', () => {
  // Großer Bildschirm: Sidebar steht fest neben dem Inhalt, solange sie nicht eingeklappt ist
  // Die Wahl bleibt nach einem Reload erhalten; ohne gespeicherten Wert ist die Sidebar offen
  const pinned = ref(localStorage.getItem(PINNED_KEY) !== 'false')
  // Sidebar schwebt über dem Inhalt: beim Hover über das Icon oder auf dem Handy
  const floating = ref(false)

  watch(pinned, (value) => localStorage.setItem(PINNED_KEY, String(value)))

  // Maus über dem Icon im Seitenkopf
  function peek() {
    floating.value = true
  }

  // Klick auf das Icon im Seitenkopf: Desktop dockt die Sidebar an, Handy klappt sie auf
  function open() {
    if (isDesktop()) {
      pinned.value = true
      floating.value = false
    } else {
      floating.value = true
    }
  }

  // Klick auf das Icon in der Sidebar
  function toggle() {
    if (floating.value) {
      floating.value = false
      if (isDesktop()) pinned.value = true
    } else {
      pinned.value = false
    }
  }

  function close() {
    floating.value = false
  }

  return { pinned, floating, peek, open, toggle, close }
})
