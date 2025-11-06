const Sentry = require('@sentry/node');

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment,
  release: '1.0.0',
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    Sentry.httpIntegration({ tracing: true }),
    Sentry.expressIntegration(),
  ],
});

module.exports = { Sentry };