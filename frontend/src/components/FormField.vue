<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-sm font-medium">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :autocomplete="autocomplete"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-error` : undefined"
      required
      class="border-input focus:border-ring focus:ring-ring/50 aria-invalid:border-destructive h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus:ring-3"
    />
    <p v-if="error" :id="`${id}-error`" class="text-destructive text-sm">{{ error }}</p>
  </div>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  error: { type: String, default: undefined },
})

const model = defineModel({ type: String, default: '' })
const id = useId()
</script>
