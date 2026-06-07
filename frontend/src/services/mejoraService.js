import api from './api'

export const getMejoras = ()      => api.get('/mejoras')
export const mejorar    = (tipo)  => api.post(`/mejoras/${tipo}/mejorar`)
