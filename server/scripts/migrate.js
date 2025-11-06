const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const migrationsDir = path.join(__dirname, '..', 'migrations');

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const dryRun = String(process.env.MIGRATION_DRY_RUN || '').toLowerCase() === 'true';

  if (!uri) {
    console.error('Missing MONGO_URI/MONGODB_URI environment variable.');
    process.exit(1);
  }

  if (!fs.existsSync(migrationsDir)) {
    console.warn(`No migrations directory found at ${migrationsDir}. Nothing to run.`);
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.js'))
    .sort();

  console.log(`Found ${files.length} migration(s). Dry-run mode: ${dryRun}`);

  if (!dryRun) {
    await mongoose.connect(uri);
  }

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const migration = require(migrationPath);

    if (typeof migration.up !== 'function') {
      console.warn(`Skipping ${file}: missing exported "up" function.`);
      continue;
    }

    console.log(`Running migration ${file}...`);
    if (dryRun) {
      console.log(`[dry-run] ${file} executed.`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await migration.up(mongoose);
    console.log(`Completed migration ${file}.`);
  }

  if (!dryRun) {
    await mongoose.disconnect();
  }

  console.log('Migration process finished.');
}

run().catch((error) => {
  console.error('Migration process failed:', error);
  process.exit(1);
});
