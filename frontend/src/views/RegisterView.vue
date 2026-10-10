<template>
  <AuthCard
    title="Create an account"
    description="Get answers from your team's knowledge base."
    :error="serverError"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <FormField v-model="form.name" label="Name" autocomplete="name" :error="r$.name.$errors[0]" />
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
        autocomplete="new-password"
        :error="r$.password.$errors[0]"
      />
      <FormField
        v-model="form.password_confirmation"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        :error="r$.password_confirmation.$errors[0]"
      />
      <button
        type="submit"
        :disabled="submitting"
        class="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-9 rounded-md px-4 text-sm font-medium disabled:opacity-50"
      >
        {{ submitting ? 'Creating account…' : 'Register' }}
      </button>
    </form>

    <template #footer>
      Already registered?
      <RouterLink :to="{ name: 'login' }" class="text-foreground font-medium hover:underline">
        Log in
      </RouterLink>
    </template>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegle } from '@regle/core'
import { email, minLength, required, sameAs, withMessage } from '@regle/rules'

import AuthCard from '@/components/AuthCard.vue'
import FormField from '@/components/FormField.vue'
import { apiErrorMessage } from '@/lib/apiErrors'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const serverError = ref()
const submitting = ref(false)

// Gleiche Regeln wie RegisterRequest im Backend; "E-Mail schon vergeben" kann nur der Server prüfen und steht oben in der Karte
const { r$ } = useRegle(
  form,
  {
    name: {
      required: withMessage(required, 'Name is required'),
    },
    email: {
      required: withMessage(required, 'Email is required'),
      email: withMessage(email, 'Email must be valid'),
    },
    password: {
      required: withMessage(required, 'Password is required'),
      minLength: withMessage(minLength(8), 'Password must be at least 8 characters'),
    },
    password_confirmation: {
      required: withMessage(required, 'Please confirm your password'),
      sameAs: withMessage(
        sameAs(() => form.password),
        'Passwords do not match',
      ),
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
    await auth.register(form)
    await router.push({ name: 'home' })
  } catch (error) {
    serverError.value = apiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>
