import { create } from 'zustand'

export const useGremioStore = create((set) => ({
  gremio: null,
  setGremio: (gremio) => set({ gremio }),
  updateOro: (oro) => set((state) => ({ gremio: state.gremio ? { ...state.gremio, oro } : null })),
}))
