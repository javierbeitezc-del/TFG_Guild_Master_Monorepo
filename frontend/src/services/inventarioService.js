import api from './api'

export const getInventario = ()   => api.get('/inventario')
export const venderItem    = (id) => api.delete(`/inventario/${id}`)
