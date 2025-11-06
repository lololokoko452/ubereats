const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  release: '1.0.0',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 1.0,
  debug: true, // active les logs SDK dans la console
  integrations: [
    Sentry.httpIntegration({ tracing: true }),
    Sentry.expressIntegration(),
  ],
});

// petit sanity check au démarrage
const dsn = Sentry.getClient()?.getDsn();
if (!dsn) {
  console.warn('[Sentry] Aucun DSN détecté (SENTRY_DSN_BACKEND manquant ou vide).');
} else {
  console.log(`[Sentry] DSN détecté (host=${dsn.host})`);
}

module.exports = { Sentry };
