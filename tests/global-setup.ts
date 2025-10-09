import { clearAllTestData } from '../lib/db-sqlite';

export default async function globalSetup() {
  console.log('🧹 Cleaning up all test data before starting E2E tests...');
  clearAllTestData();
  console.log('✅ All test data cleared - starting fresh');
}
