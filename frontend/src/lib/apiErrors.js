// Macht aus einem Axios-Fehler eine Meldung für den Nutzer
export function apiErrorMessage(error) {
  const status = error.response?.status
  const data = error.response?.data ?? {}

  // Laravel-Validierungsfehler: { errors: { feld: [meldungen] } }; die erste Meldung reicht
  if (status === 422) {
    const firstField = Object.values(data.errors ?? {})[0]
    return firstField?.[0] ?? data.message ?? 'Please check your input.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a minute and try again.'
  }

  return 'Something went wrong. Please try again.'
}
