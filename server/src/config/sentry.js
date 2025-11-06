const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,   // NE RIEN METTRE D’AUTRE ICI
  debug: true,                           // log SDK
  sampleRate: 1.0,                       // erreurs: 100%
  // pas d'intégrations, pas de traces, rien d'autre
});

// Log de vérité sur le DSN et client
const client = Sentry.getClient();
const dsn = client?.getDsn?.();
console.log('[Sentry] client:', !!client, 'dsn host:', dsn?.host, 'projectId:', dsn?.projectId);

async function bootProbe() {
  const id = Sentry.captureException(new Error('BOOT_PROBE_ERROR'));
  console.log('[Sentry] captureException id:', id);
  await Sentry.flush(5000); // attendre l’envoi
  console.log('[Sentry] flush done');
}
bootProbe();

module.exports = { Sentry };
