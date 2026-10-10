<template>
  <!-- Abgedunkelter Hintergrund nur auf dem Handy; ein Tipp daneben schließt die Sidebar -->
  <div
    v-if="layout.floating"
    class="fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] md:hidden"
    aria-hidden="true"
    @click="layout.close()"
  />
  <aside
    ref="sidebar"
    :class="[
      'bg-sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r transition-transform',
      layout.floating ? 'translate-x-0 shadow-xl' : '-translate-x-full',
      layout.pinned && 'md:static md:translate-x-0 md:shadow-none',
    ]"
  >
    <div class="flex h-14 shrink-0 items-center justify-between px-4">
      <AppLogo />
      <button
        type="button"
        class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 items-center justify-center rounded-md"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        data-testid="sidebar-toggle"
        @click="layout.toggle()"
      >
        <PanelLeft class="size-4" />
      </button>
    </div>

    <nav class="flex flex-col gap-0.5 px-2 pt-1 pb-3" aria-label="Sections">
      <RouterLink
        v-for="item in NAV"
        :key="item.name"
        :to="{ name: item.name }"
        class="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition-colors"
        exact-active-class="bg-accent text-foreground! font-medium"
      >
        <component :is="item.icon" class="size-4" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="flex-1" />

    <!-- Beim Logout ist auth.user kurz null, bevor die Seite wechselt -->
    <div v-if="auth.user" class="flex items-center gap-2.5 border-t px-3 py-3 text-sm">
      <div
        class="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      >
        {{ auth.user.name.charAt(0).toUpperCase() }}
      </div>
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-medium" data-testid="user-name">{{ auth.user.name }}</span>
        <span class="text-muted-foreground truncate text-xs">
          {{ ROLE_LABELS[auth.user.role] }}
        </span>
      </div>
      <button
        type="button"
        class="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 items-center justify-center rounded-md"
        aria-label="Log out"
        title="Log out"
        data-testid="logout"
        @click="logout"
      >
        <LogOut class="size-4" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { LogOut, MessagesSquare, PanelLeft } from '@lucide/vue'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppLogo from '@/components/AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useLayoutStore } from '@/stores/layout'

const auth = useAuthStore()
const layout = useLayoutStore()
const route = useRoute()
const router = useRouter()
const sidebar = useTemplateRef('sidebar')

const NAV = [{ name: 'home', label: 'Chat', icon: MessagesSquare }]

const ROLE_LABELS = {
  employee: 'Employee',
  collection_admin: 'Collection admin',
  admin: 'Admin',
}

// Schwebende Sidebar schließen, sobald die Maus rechts daneben ist. Ein "mouseleave" reicht nicht:
// Die Sidebar gleitet unter den ruhenden Mauszeiger und bekommt dann nie ein "mouseenter".
function closeWhenMouseLeaves(event) {
  if (layout.floating && event.clientX > sidebar.value.offsetWidth) {
    layout.close()
  }
}

onMounted(() => document.addEventListener('mousemove', closeWhenMouseLeaves))
onBeforeUnmount(() => document.removeEventListener('mousemove', closeWhenMouseLeaves))

// Eine schwebende Sidebar schließt nach jeder Navigation
watch(
  () => route.fullPath,
  () => layout.close(),
)

async function logout() {
  try {
    await auth.logout()
  } finally {
    await router.replace({ name: 'login' })
  }
}
</script>
