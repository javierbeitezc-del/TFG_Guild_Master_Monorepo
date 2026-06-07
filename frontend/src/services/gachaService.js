import api from './api'

export const tirarX1  = () => api.post('/gacha/tirada')
export const tirarX10 = () => api.post('/gacha/tirada-multiple')
export const getHistorial = () => api.get('/gacha/historial')
