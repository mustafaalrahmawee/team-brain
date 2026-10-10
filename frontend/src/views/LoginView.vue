<template>
  <AuthCard
    title="Welcome back"
    description="Log in to ask questions about your company's documents."
    :error="serverError"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <FormField
        v-model="form.email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="r$.email.$errors[0]"
      />
      <FormField
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :error="r$.password.$errors[0]"
      />
      <button
        type="submit"
        :disabled="submitting"
        class="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-9 rounded-md px-4 text-sm font-medium disabled:opacity-50"
      >
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <template #footer>
      No account yet?
      <RouterLink :to="{ name: 'register' }" class="text-foreground font-medium hover:underline">
        Register
      </RouterLink>
    </template>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegle } from '@regle/core'
import { email, minLength, required, withMessage } from '@regle/rules'

import AuthCard from '@/components/AuthCard.vue'
import FormField from '@/components/FormField.vue'
import { apiErrorMessage } from '@/lib/apiErrors'
import { safeRedirect } from '@/lib/redirect'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const serverError = ref()
const submitting = ref(false)

// Eingabefehler zeigt Regle am Feld; Fehler vom Server (z. B. falsches Passwort) stehen oben in der Karte
const { r$ } = useRegle(
  form,
  {
    email: {
      required: withMessage(required, 'Email is required'),
      email: withMessage(email, 'Email must be valid'),
    },
    password: {
      required: withMessage(required, 'Password is required'),
      // Bei der Registrierung gilt mindestens 8 Zeichen, kürzere Passwörter können nicht stimmen
      minLength: withMessage(minLength(8), 'Password must be at least 8 characters'),
    },
  },
  { rewardEarly: true },
)

async function submit() {
  serverError.value = undefined

  const { valid } = await r$.$validate()
  if (!valid) return

  submitting.value = true
  try {
    await auth.login(form)
    await router.push(safeRedirect(route.query.redirect))
  } catch (error) {
    serverError.value = apiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>
