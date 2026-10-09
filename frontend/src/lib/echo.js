import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { TOKEN_KEY } from './http'

window.Pusher = Pusher

// Live-Events von Reverb (Upload-Status, Eval-Fortschritt); private Channels mit Bearer-Auth
export function createEcho() {
  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        Accept: 'application/json',
      },
    },
  })
}
