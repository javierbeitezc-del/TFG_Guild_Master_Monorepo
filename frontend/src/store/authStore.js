import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('gm_token') || null,
  user: JSON.parse(localStorage.getItem('gm_user') || 'null'),

  login: (token, user) => {
    localStorage.setItem('gm_token', token)
    localStorage.setItem('gm_user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('gm_token')
    localStorage.removeItem('gm_user')
    set({ token: null, user: null })
  }
}))
