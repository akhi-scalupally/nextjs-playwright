#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up Playwright temporary files...');

const dirsToClean = [
  '.playwright-temp',
  'test-results',
  'playwright-report',
  'playwright/.cache'
];

dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cleaned up: ${dir}`);
    } catch (error) {
      console.log(`⚠️ Could not clean ${dir}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️ Directory not found: ${dir}`);
  }
});

console.log('🎉 Cleanup completed!');
