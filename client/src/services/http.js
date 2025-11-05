const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:4000/api'

const baseUrl = (() => {
  const value = API_BASE_URL

  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin.replace(/\/$/, '')
    const suffix = value.startsWith('/') ? value : `/${value}`
    return `${origin}${suffix}`.replace(/\/$/, '')
  }

  const suffix = value.startsWith('/') ? value : `/${value}`
  return `http://localhost:4000${suffix}`.replace(/\/$/, '')
})()

function buildUrl(path, params) {
  if (path && /^https?:\/\//i.test(path)) {
    return path
  }

  const sanitizedPath = (path || '').replace(/^\/+/, '').replace(/\/+$/, '')
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const target = sanitizedPath ? `${normalizedBase}/${sanitizedPath}` : normalizedBase

  if (params && typeof params === 'object') {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      query.append(key, value)
    })
    const queryString = query.toString()
    if (queryString) {
      return `${target}${target.includes('?') ? '&' : '?'}${queryString}`
    }
  }

  return target
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers: customHeaders = {},
    skipAuth = false,
  } = options

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  const token = localStorage.getItem('token')
  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error = new Error(payload?.message || 'Erreur inattendue')
    error.status = response.status
    error.details = payload?.details
    throw error
  }

  return payload
}

const http = {
  get(path, options) {
    return request(path, { ...options, method: 'GET' })
  },
  post(path, body, options) {
    return request(path, { ...options, method: 'POST', body })
  },
  put(path, body, options) {
    return request(path, { ...options, method: 'PUT', body })
  },
  patch(path, body, options) {
    return request(path, { ...options, method: 'PATCH', body })
  },
  delete(path, options) {
    return request(path, { ...options, method: 'DELETE' })
  },
}

export default http
