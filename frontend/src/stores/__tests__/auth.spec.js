import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import http, { TOKEN_KEY } from '@/lib/http'
import { useAuthStore } from '../auth'

vi.mock('@/lib/http', () => ({
  TOKEN_KEY: 'teambrain_token',
  default: { get: vi.fn(), post: vi.fn() },
}))

const user = { id: 1, name: 'Erika', email: 'erika@example.com', role: 'employee' }

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
    setActivePinia(createPinia())
  })

  it('stores token and user after login', async () => {
    http.post.mockResolvedValue({ data: { data: { token: 'abc', user } } })
    const auth = useAuthStore()

    await auth.login({ email: user.email, password: 'secret' })

    expect(http.post).toHaveBeenCalledWith('/auth/login', { email: user.email, password: 'secret' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user).toEqual(user)
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc')
  })

  it('stores token and user after registration', async () => {
    http.post.mockResolvedValue({ data: { data: { token: 'abc', user } } })
    const auth = useAuthStore()

    await auth.register({ name: 'Erika' })

    expect(http.post).toHaveBeenCalledWith('/auth/register', { name: 'Erika' })
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc')
  })

  it('restores the token from localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'abc')

    expect(useAuthStore().isAuthenticated).toBe(true)
  })

  it('loads the current user', async () => {
    http.get.mockResolvedValue({ data: { data: user } })
    const auth = useAuthStore()

    await auth.fetchUser()

    expect(http.get).toHaveBeenCalledWith('/user')
    expect(auth.user).toEqual(user)
  })

  it('clears the session on logout even if the request fails', async () => {
    localStorage.setItem(TOKEN_KEY, 'abc')
    http.post.mockRejectedValue(new Error('network'))
    const auth = useAuthStore()

    await expect(auth.logout()).rejects.toThrow('network')

    expect(http.post).toHaveBeenCalledWith('/auth/logout')
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})
