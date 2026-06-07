import api from './api'

export const getAventuras      = ()          => api.get('/aventuras')
export const iniciarAventura   = (data)      => api.post('/aventuras', data)
export const reclamarRecompensa= (id)        => api.post(`/aventuras/${id}/reclamar`)
