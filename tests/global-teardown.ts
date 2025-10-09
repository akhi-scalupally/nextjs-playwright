import { clearAllTestData } from '../lib/db-sqlite';
import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up all test data after E2E tests complete...');
  
  // Clear database test data
  clearAllTestData();
  
  // Clean up any generated test result files and temporary directories
  const dirsToClean = [
    './test-results',
    './playwright-report', 
    './.playwright-temp',
    './playwright/.cache'
  ];
  
  dirsToClean.forEach(dir => {
    if (existsSync(dir)) {
      try {
        // Check if directory is empty or contains only temporary files
        const files = readdirSync(dir);
        if (files.length === 0) {
          rmSync(dir, { recursive: true, force: true });
          console.log(`🗑️ Cleaned up empty directory: ${dir}`);
        } else {
          // Force remove even if not empty (for temp files)
          rmSync(dir, { recursive: true, force: true });
          console.log(`🗑️ Cleaned up directory with ${files.length} files: ${dir}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not clean ${dir}: ${error}`);
      }
    }
  });
  
  // Additional cleanup for any leftover temp files
  try {
    const tempFiles = [
      './.playwright-temp',
      './test-results',
      './playwright-report'
    ];
    
    tempFiles.forEach(file => {
      if (existsSync(file)) {
        rmSync(file, { recursive: true, force: true });
        console.log(`🧹 Force cleaned: ${file}`);
      }
    });
  } catch (error) {
    console.log(`⚠️ Additional cleanup error: ${error}`);
  }
  
  console.log('✅ All test data and temporary files cleared - tests finished');
}
