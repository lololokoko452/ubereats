import * as Sentry from '@sentry/vue'
import { BrowserTracing } from '@sentry/tracing'

let initialized = false

export function initSentry(Vue, router) {
  if (initialized) {
    return Sentry
  }

  const dsn = process.env.VUE_APP_SENTRY_DSN_FRONTEND

  if (!dsn) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[Sentry] VUE_APP_SENTRY_DSN_FRONTEND is not defined. Skipping frontend Sentry initialisation.'
      )
    }
    return Sentry
  }

  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development'

  const integrations = [
    new BrowserTracing({
      routingInstrumentation: router
        ? Sentry.vueRouterInstrumentation(router)
        : undefined,
      tracePropagationTargets: ['localhost', /^\//],
    }),
  ]

  Sentry.init({
    Vue,
    dsn,
    environment,
    release: process.env.VUE_APP_RELEASE || '1.0.0',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations,
  })

  initialized = true
  return Sentry
}

const withProfiler = (...args) =>
  typeof Sentry.withProfiler === 'function'
    ? Sentry.withProfiler(...args)
    : args[0]

export { Sentry, withProfiler }
