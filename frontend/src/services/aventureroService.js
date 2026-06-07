import api from './api'

export const getAventureros   = ()               => api.get('/aventureros')
export const getAventurero    = (id)             => api.get(`/aventureros/${id}`)
export const equiparItem      = (id, armaId, armaduraId) =>
  api.put(`/aventureros/${id}/equipo`, null, {
    params: { ...(armaId != null && { armaId }), ...(armaduraId != null && { armaduraId }) }
  })
