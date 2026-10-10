import { describe, expect, it } from 'vitest'

import { apiErrorMessage } from '../apiErrors'

describe('apiErrorMessage', () => {
  it('uses the first validation message from Laravel', () => {
    const error = {
      response: {
        status: 422,
        data: { message: 'Summary', errors: { email: ['Taken.'], name: ['Required.'] } },
      },
    }

    expect(apiErrorMessage(error)).toBe('Taken.')
  })

  it('explains throttling', () => {
    expect(apiErrorMessage({ response: { status: 429 } })).toContain('Too many attempts')
  })

  it('falls back to a general message', () => {
    expect(apiErrorMessage(new Error('Network Error'))).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
