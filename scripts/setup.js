import { initializeDatabase, seedDatabase } from '../src/lib/db.js';

async function setup() {
  try {
    console.log('Setting up database...');
    await initializeDatabase();
    await seedDatabase();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();