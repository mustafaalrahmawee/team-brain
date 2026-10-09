import axios from 'axios'

export const TOKEN_KEY = 'teambrain_token'

// Normale API-Aufrufe; der Chat-Stream nutzt fetch + ReadableStream
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default http
