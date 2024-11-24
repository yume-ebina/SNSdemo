import { initializeDatabase } from '../src/services/db.js';

async function migrate() {
  try {
    await initializeDatabase();
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();