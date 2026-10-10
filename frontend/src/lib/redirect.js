// Nur interne Pfade als Ziel nach dem Login zulassen (kein Open Redirect über ?redirect=//…)
export function safeRedirect(target) {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : '/'
}
