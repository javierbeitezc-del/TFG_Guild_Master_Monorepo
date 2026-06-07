import api from './api'

export const getGremio   = ()             => api.get('/gremio')
export const renombrar   = (nombre)       => api.put(`/gremio/nombre?nombre=${encodeURIComponent(nombre)}`)
