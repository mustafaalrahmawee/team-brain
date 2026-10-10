import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

import http from '@/lib/http'
import RegisterView from '../RegisterView.vue'

vi.mock('@/lib/http', () => ({
  TOKEN_KEY: 'teambrain_token',
  default: { get: vi.fn(), post: vi.fn() },
}))

async function mountRegister() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
      { path: '/register', name: 'register', component: RegisterView },
    ],
  })
  await router.push('/register')

  const wrapper = mount(RegisterView, {
    global: { plugins: [router, createPinia()] },
  })

  return { wrapper, router }
}

async function fillAndSubmit(wrapper, { confirmation = 'secret-password' } = {}) {
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('Erika')
  await inputs[1].setValue('erika@example.com')
  await inputs[2].setValue('secret-password')
  await inputs[3].setValue(confirmation)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('RegisterView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('registers and opens the home page', async () => {
    http.post.mockResolvedValue({ data: { data: { token: 'abc', user: { id: 1 } } } })
    const { wrapper, router } = await mountRegister()

    await fillAndSubmit(wrapper)

    expect(http.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Erika',
      email: 'erika@example.com',
      password: 'secret-password',
      password_confirmation: 'secret-password',
    })
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('checks that both passwords match', async () => {
    const { wrapper } = await mountRegister()

    await fillAndSubmit(wrapper, { confirmation: 'something-else' })

    expect(wrapper.text()).toContain('Passwords do not match')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('shows the server error above the form when the email is taken', async () => {
    http.post.mockRejectedValue({
      response: {
        status: 422,
        data: { errors: { email: ['The email has already been taken.'] } },
      },
    })
    const { wrapper, router } = await mountRegister()

    await fillAndSubmit(wrapper)

    expect(wrapper.get('[role="alert"]').text()).toBe('The email has already been taken.')
    expect(router.currentRoute.value.name).toBe('register')
  })
})
