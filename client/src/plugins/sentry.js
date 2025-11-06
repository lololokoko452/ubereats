import * as Sentry from '@sentry/vue'

// ⛔️ Retirer ça : import { BrowserTracing } from '@sentry/tracing'
// ✅ v8 : utiliser l’intégration fournie par le SDK
// Sentry.browserTracingIntegration et Sentry.vueRouterInstrumentation

let initialized = false

export function initSentry(Vue, router) {
  if (initialized) return Sentry

  const dsn = process.env.VUE_APP_SENTRY_DSN_FRONTEND
  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development'

  if (!dsn) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Sentry] VUE_APP_SENTRY_DSN_FRONTEND is not defined. Skipping.')
    }
    return Sentry
  }

  console.info('[Sentry] Initialising frontend SDK', {
    environment,
    hasRouter: Boolean(router),
  })

  Sentry.init({
    // Vue 2 : fournir le constructeur Vue
    Vue,
    dsn,
    environment,
    release: process.env.VUE_APP_RELEASE || '1.0.0',

    // v8 : intégrations sous forme de fonctions
    integrations: [
      Sentry.browserTracingIntegration({
        // v8 : utiliser l’instrumentation fournie par le SDK
        routingInstrumentation: router
          ? Sentry.vueRouterInstrumentation(router)
          : undefined,
        // optionnel : cible de propagation pour fetch/xhr
        tracePropagationTargets: ['localhost', /^\//],
      }),
      // évent. Sentry.replayIntegration() si tu veux le Replay
    ],

    tracesSampleRate: 1.0,     // perf (transactions)
    // profilesSampleRate n’est pas pris en charge par tous les navigateurs ; tu peux l’omettre côté browser
    debug: true,               // affiche les logs SDK dans la console
    transportOptions: { forceFetch: true }, // utile contre XHR bloqués par CORS
  })

  initialized = true

  if (process.env.NODE_ENV !== 'production') {
    window.__SENTRY__ = Sentry
  }
  return Sentry
}

export { Sentry }
