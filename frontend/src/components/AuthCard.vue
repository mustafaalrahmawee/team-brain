<template>
  <main class="bg-sidebar flex min-h-svh items-center justify-center p-4">
    <div class="flex w-full max-w-sm flex-col items-center gap-8">
      <AppLogo />
      <div class="bg-card w-full rounded-xl border p-6 shadow-sm">
        <h1 class="text-xl font-semibold">{{ title }}</h1>
        <p class="text-muted-foreground mt-1.5 mb-6 text-sm">{{ description }}</p>
        <!-- Fehler vom Server stehen über dem Formular, Eingabefehler direkt am Feld -->
        <div
          v-if="error"
          role="alert"
          class="border-destructive/30 bg-destructive/5 text-destructive mb-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm"
        >
          <CircleAlert class="mt-0.5 size-4 shrink-0" />
          <span>{{ error }}</span>
        </div>
        <slot />
      </div>
      <p class="text-muted-foreground text-sm">
        <slot name="footer" />
      </p>
    </div>
  </main>
</template>

<script setup>
import { CircleAlert } from '@lucide/vue'

import AppLogo from '@/components/AppLogo.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  error: { type: String, default: undefined },
})
</script>
