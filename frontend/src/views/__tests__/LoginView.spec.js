import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import http from '@/lib/http'
import LoginView from '../LoginView.vue'

vi.mock('@/lib/http', () => ({
  TOKEN_KEY: 'teambrain_token',
  default: { get: vi.fn(), post: vi.fn() },
}))

async function mountLogin(path = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/documents', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: { template: '<div />' } },
    ],
  })
  await router.push(path)

  const wrapper = mount(LoginView, {
    global: { plugins: [router, createPinia()] },
  })

  return { wrapper, router }
}

async function fillAndSubmit(
  wrapper,
  { email = 'erika@example.com', password = 'secret-password' } = {},
) {
  await wrapper.find('input[type="email"]').setValue(email)
  await wrapper.find('input[type="password"]').setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('logs in and follows the redirect target', async () => {
    http.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1 } } } })
    const { wrapper, router } = await mountLogin('/login?redirect=/documents')

    await fillAndSubmit(wrapper)

    expect(http.post).toHaveBeenCalledWith('/auth/login', {
      email: 'erika@example.com',
      password: 'secret-password',
    })
    expect(router.currentRoute.value.path).toBe('/documents')
  })

  it('validates the form before sending it', async () => {
    const { wrapper } = await mountLogin()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('rejects an invalid email address', async () => {
    const { wrapper } = await mountLogin()

    await fillAndSubmit(wrapper, { email: 'not-an-email' })

    expect(wrapper.text()).toContain('Email must be valid')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('rejects a password that is too short', async () => {
    const { wrapper } = await mountLogin()

    await fillAndSubmit(wrapper, { password: 'x' })

    expect(wrapper.text()).toContain('Password must be at least 8 characters')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('shows the server error for wrong credentials above the form', async () => {
    const { wrapper, router } = await mountLogin()
    http.post.mockRejectedValue({
      response: {
        status: 422,
        data: { errors: { email: ['These credentials do not match our records.'] } },
      },
    })

    await fillAndSubmit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toBe('These credentials do not match our records.')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('shows a general message when throttled', async () => {
    const { wrapper } = await mountLogin()
    http.post.mockRejectedValue({ response: { status: 429, data: {} } })

    await fillAndSubmit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toContain('Too many attempts')
  })
})
