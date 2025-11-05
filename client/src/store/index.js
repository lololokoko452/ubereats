import Vue from 'vue'
import Vuex from 'vuex'

import {
  fetchHome,
  fetchSearchSuggestions,
  fetchRestaurant,
  login as apiLogin,
  searchRestaurants,
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@/services/api'

Vue.use(Vuex)

const tokenFromStorage = localStorage.getItem('token')
const userFromStorage = (() => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch (error) {
    console.warn('Unable to parse user payload from storage', error)
    return null
  }
})()

const auth = {
  namespaced: true,
  state: () => ({
    token: tokenFromStorage,
    user: userFromStorage,
    status: tokenFromStorage ? 'authenticated' : 'idle',
    error: '',
  }),
  getters: {
    isAuthenticated: state => Boolean(state.token),
    currentUser: state => state.user,
  },
  mutations: {
    SET_PENDING(state) {
      state.status = 'loading'
      state.error = ''
    },
    SET_SUCCESS(state, { token, user }) {
      state.status = 'authenticated'
      state.token = token
      state.user = user
    },
    SET_ERROR(state, message) {
      state.status = 'error'
      state.error = message
    },
    SET_LOGOUT(state) {
      state.status = 'idle'
      state.token = null
      state.user = null
      state.error = ''
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      commit('SET_PENDING')
      try {
        const payload = await apiLogin(credentials)
        localStorage.setItem('token', payload.token)
        localStorage.setItem('user', JSON.stringify(payload.user))
        commit('SET_SUCCESS', payload)
        dispatch('cart/fetch', null, { root: true })
        return payload
      } catch (error) {
        const message = error.message || 'Impossible de se connecter.'
        commit('SET_ERROR', message)
        throw error
      }
    },
    logout({ commit, dispatch }) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      commit('SET_LOGOUT')
      dispatch('cart/reset', null, { root: true })
    },
  },
}

const home = {
  namespaced: true,
  state: () => ({
    loading: false,
    error: '',
    data: null,
    suggestions: {
      query: '',
      items: [],
    },
  }),
  getters: {
    sections: state => state.data?.sections || [],
    categories: state => state.data?.categories || [],
    promoBanners: state => state.data?.promoBanners || [],
    hero: state => state.data?.hero || null,
    searchDataset: state => state.data?.search || { trendingSearches: [] },
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, message) {
      state.error = message
    },
    SET_DATA(state, data) {
      state.data = data
    },
    SET_SUGGESTIONS(state, payload) {
      state.suggestions = payload
    },
  },
  actions: {
    async fetch({ commit }, params) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      try {
        const data = await fetchHome(params)
        commit('SET_DATA', data)
      } catch (error) {
        commit(
          'SET_ERROR',
          error.message || 'Impossible de charger les données.'
        )
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchSuggestions({ commit }, query) {
      if (!query) {
        commit('SET_SUGGESTIONS', { query: '', items: [] })
        return
      }
      try {
        const data = await fetchSearchSuggestions({ query })
        commit('SET_SUGGESTIONS', {
          query: data.query,
          items: data.suggestions,
        })
      } catch (error) {
        console.warn('Unable to fetch suggestions', error)
      }
    },
  },
}

const restaurants = {
  namespaced: true,
  state: () => ({
    loading: false,
    error: '',
    query: {
      search: '',
      category: '',
      city: '',
    },
    items: [],
    detail: null,
    similar: [],
    detailLoading: false,
    detailError: '',
  }),
  getters: {
    hasResults: state => state.items.length > 0,
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, message) {
      state.error = message
    },
    SET_RESULTS(state, { items, query }) {
      state.items = items
      state.query = { ...state.query, ...query }
    },
    RESET_RESULTS(state) {
      state.items = []
      state.error = ''
      state.query = {
        search: '',
        category: '',
        city: '',
      }
    },
    SET_DETAIL_LOADING(state, loading) {
      state.detailLoading = loading
      if (loading) {
        state.detailError = ''
      }
    },
    SET_DETAIL(state, payload) {
      if (!payload) {
        state.detail = null
        state.similar = []
        return
      }
      state.detail = payload.restaurant
      state.similar = payload.similar || []
    },
    SET_DETAIL_ERROR(state, message) {
      state.detailError = message
      state.detail = null
      state.similar = []
    },
  },
  actions: {
    async search({ commit }, params) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      try {
        const data = await searchRestaurants(params)
        commit('SET_RESULTS', { items: data.items, query: params })
      } catch (error) {
        commit('SET_ERROR', error.message || 'Recherche impossible.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    clearResults({ commit }) {
      commit('RESET_RESULTS')
    },
    async fetchDetail({ commit }, slug) {
      commit('SET_DETAIL_LOADING', true)
      try {
        const data = await fetchRestaurant(slug)
        commit('SET_DETAIL', data)
      } catch (error) {
        commit(
          'SET_DETAIL_ERROR',
          error.message || 'Restaurant introuvable pour le moment.'
        )
        throw error
      } finally {
        commit('SET_DETAIL_LOADING', false)
      }
    },
  },
}

const defaultCartState = () => ({
  loading: false,
  error: '',
  items: [],
  subtotal: 0,
  totalItems: 0,
  currency: 'EUR',
  visible: false,
  updating: false,
})

const cart = {
  namespaced: true,
  state: defaultCartState,
  getters: {
    itemCount: state => state.totalItems,
    subtotal: state => state.subtotal,
    isOpen: state => state.visible,
    isEmpty: state => state.items.length === 0,
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_UPDATING(state, updating) {
      state.updating = updating
    },
    SET_ERROR(state, message) {
      state.error = message
    },
    SET_CART(state, payload) {
      state.items = payload.items || []
      state.subtotal = payload.subtotal || 0
      state.totalItems = payload.totalItems || 0
      state.currency = payload.currency || 'EUR'
      state.error = ''
    },
    OPEN(state) {
      state.visible = true
    },
    CLOSE(state) {
      state.visible = false
    },
    RESET_STATE(state) {
      Object.assign(state, defaultCartState())
    },
  },
  actions: {
    async fetch({ commit, rootGetters }) {
      if (!rootGetters['auth/isAuthenticated']) {
        commit('RESET_STATE')
        return
      }
      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      try {
        const data = await fetchCart()
        commit('SET_CART', data)
      } catch (error) {
        if (error.status === 401) {
          commit('RESET_STATE')
        } else {
          commit('SET_ERROR', error.message || 'Impossible de charger le panier.')
        }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addItem({ commit }, payload) {
      commit('SET_UPDATING', true)
      commit('SET_ERROR', '')
      try {
        const data = await addCartItem(payload)
        commit('SET_CART', data)
        commit('OPEN')
      } catch (error) {
        if (error.status === 401) {
          commit('RESET_STATE')
        } else {
          commit('SET_ERROR', error.message || 'Impossible d’ajouter cet article.')
        }
        throw error
      } finally {
        commit('SET_UPDATING', false)
      }
    },
    async updateItemQuantity({ commit }, { itemKey, quantity }) {
      commit('SET_UPDATING', true)
      commit('SET_ERROR', '')
      try {
        const data = await updateCartItem(itemKey, { quantity })
        commit('SET_CART', data)
      } catch (error) {
        if (error.status === 401) {
          commit('RESET_STATE')
        } else {
          commit('SET_ERROR', error.message || 'Impossible de mettre à jour la quantité.')
        }
        throw error
      } finally {
        commit('SET_UPDATING', false)
      }
    },
    async removeItem({ commit }, itemKey) {
      commit('SET_UPDATING', true)
      commit('SET_ERROR', '')
      try {
        const data = await removeCartItem(itemKey)
        commit('SET_CART', data)
      } catch (error) {
        if (error.status === 401) {
          commit('RESET_STATE')
        } else {
          commit('SET_ERROR', error.message || 'Impossible de retirer cet article.')
        }
        throw error
      } finally {
        commit('SET_UPDATING', false)
      }
    },
    async clear({ commit }) {
      commit('SET_UPDATING', true)
      commit('SET_ERROR', '')
      try {
        const data = await clearCart()
        commit('SET_CART', data)
      } catch (error) {
        if (error.status === 401) {
          commit('RESET_STATE')
        } else {
          commit('SET_ERROR', error.message || 'Impossible de vider le panier.')
        }
        throw error
      } finally {
        commit('SET_UPDATING', false)
      }
    },
    open({ commit }) {
      commit('OPEN')
    },
    close({ commit }) {
      commit('CLOSE')
    },
    reset({ commit }) {
      commit('RESET_STATE')
    },
  },
}

export default new Vuex.Store({
  modules: {
    auth,
    home,
    restaurants,
    cart,
  },
})
