import { initializeDatabase, seedDatabase } from '../src/lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

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