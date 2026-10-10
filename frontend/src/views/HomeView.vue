<template>
  <PageHeader title="Chat" />

  <!-- Beim Logout ist auth.user kurz null, bevor die Seite wechselt -->
  <div v-if="auth.user" class="flex-1 overflow-y-auto">
    <div class="mx-auto flex max-w-3xl flex-col gap-2 px-4 pt-16 pb-8 sm:pt-32">
      <h2 class="text-2xl font-semibold tracking-tight">
        Hi {{ auth.user.name }}, what do you want to know?
      </h2>
      <p class="text-muted-foreground text-sm">
        Soon you can ask questions about your company's documents here, always with sources.
      </p>
    </div>
  </div>
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>
