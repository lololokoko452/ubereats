import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

let initialized = false

export function initSentry(Vue, router) {
  if (initialized) return Sentry

  const dsn = process.env.VUE_APP_SENTRY_DSN_FRONTEND
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  if (!dsn) return Sentry

  Sentry.init({
    Vue,
    dsn,
    environment,
    release: process.env.VUE_APP_RELEASE || '1.0.0',
    debug: true,

    integrations: [
      new BrowserTracing({
        routingInstrumentation: router ? Sentry.vueRouterInstrumentation(router) : undefined,
        tracePropagationTargets: [location.origin, /^\//],
      }),
    ],

    tracesSampleRate: 1.0,
  })

  initialized = true
  if (process.env.NODE_ENV !== 'production') window.__SENTRY__ = Sentry
  return Sentry
}

export { Sentry }
