import http from './http'

export const login = credentials =>
  http.post('/auth/login', credentials, { skipAuth: true })

export const fetchHome = params => http.get('/home', { params })

export const fetchSearchSuggestions = params =>
  http.get('/home/search-suggestions', { params })

export const searchRestaurants = params =>
  http.get('/restaurants', { params })

export const fetchRestaurant = slug => http.get(`/restaurants/${slug}`)

export const fetchSimilarRestaurants = slug =>
  http.get(`/restaurants/${slug}/similar`)

export const fetchCart = () => http.get('/cart')

export const addCartItem = payload => http.post('/cart/items', payload)

export const updateCartItem = (itemKey, payload) =>
  http.patch(`/cart/items/${encodeURIComponent(itemKey)}`, payload)

export const removeCartItem = itemKey =>
  http.delete(`/cart/items/${encodeURIComponent(itemKey)}`)

export const clearCart = () => http.delete('/cart')
