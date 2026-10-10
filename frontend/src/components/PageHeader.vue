<template>
  <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
    <!-- Nur sichtbar, wenn die Sidebar versteckt ist: Hover zeigt sie kurz, Klick öffnet sie -->
    <button
      type="button"
      :class="[
        'text-muted-foreground hover:bg-accent hover:text-foreground -ml-2 flex size-9 items-center justify-center rounded-md',
        layout.pinned && 'md:hidden',
      ]"
      aria-label="Open sidebar"
      title="Open sidebar"
      data-testid="sidebar-open"
      @pointerenter="peekWithMouse"
      @click="layout.open()"
    >
      <PanelLeft class="size-4" />
    </button>
    <h1 class="min-w-0 flex-1 truncate text-sm font-medium">{{ title }}</h1>
  </header>
</template>

<script setup>
import { PanelLeft } from '@lucide/vue'

import { useLayoutStore } from '@/stores/layout'

defineProps({
  title: { type: String, required: true },
})

const layout = useLayoutStore()

// Hover nur mit echter Maus; auf dem Handy öffnet erst der Tipp die Sidebar
function peekWithMouse(event) {
  if (event.pointerType === 'mouse') {
    layout.peek()
  }
}
</script>
