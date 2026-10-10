import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import http, { TOKEN_KEY } from '@/lib/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(null)

  const isAuthenticated = computed(() => token.value !== null)

  function setSession({ token: newToken, user: newUser }) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(credentials) {
    const { data } = await http.post('/auth/login', credentials)
    setSession(data.data)
  }

  async function register(payload) {
    const { data } = await http.post('/auth/register', payload)
    setSession(data.data)
  }

  async function fetchUser() {
    const { data } = await http.get('/user')
    user.value = data.data
  }

  // Lokal wird immer abgemeldet, auch wenn der Server das Token schon verworfen hat
  async function logout() {
    try {
      await http.post('/auth/logout')
    } finally {
      clearSession()
    }
  }

  return { token, user, isAuthenticated, login, register, fetchUser, logout, clearSession }
})
