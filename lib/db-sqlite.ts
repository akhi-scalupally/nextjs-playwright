const path = require('path');

let db: any = undefined;

export function getSqliteDb() {
  if (!db) {
    try {
      // Dynamic import to avoid issues with Next.js bundling
      const Database = require('better-sqlite3');
      const fs = require('fs');
      
      // Create the test database in a more reliable location
      const dbDir = path.join(process.cwd(), 'lib');
      const dbPath = path.join(dbDir, 'test-db.sqlite');
      
      // Ensure the directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      console.log('🔧 Creating SQLite database at:', dbPath);
      db = new Database(dbPath);
      
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
      
      console.log('✅ SQLite test database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite database:', error);
      throw error;
    }
  }
  return db;
}

// Make this function synchronous since better-sqlite3 is synchronous
export function ensureAddressTableSqlite() {
  const db = getSqliteDb();
  
  const sql = `
    CREATE TABLE IF NOT EXISTS address (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      state TEXT,
      postalCode TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    db.exec(sql);
    console.log('✅ Address table created/verified in SQLite');
  } catch (error) {
    console.error('❌ Error creating address table:', error);
    throw error;
  }
}

export function clearTestData() {
  try {
    const db = getSqliteDb();
    db.exec('DELETE FROM address');
    console.log('✅ Test data cleared');
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    // Don't throw error in test cleanup
  }
}

// More selective clearing - only clear specific test data
export function clearAddressTestData() {
  try {
    const db = getSqliteDb();
    
    // Clear all addresses from the table
    db.exec('DELETE FROM address');
    
    console.log('✅ Address test data cleared');
    console.log(`🗑️ Deleted all addresses`);
  } catch (error) {
    console.error('❌ Error clearing address test data:', error);
  }
}

// Clear all data (use with caution)
export function clearAllTestData() {
  try {
    const db = getSqliteDb();
    db.exec('DELETE FROM address');
    // Add other tables here if needed
    console.log('✅ All test data cleared');
  } catch (error) {
    console.error('❌ Error clearing all test data:', error);
  }
}

// Force clear all addresses (for debugging)
export function forceClearAllAddresses() {
  try {
    const db = getSqliteDb();
    const result = db.exec('DELETE FROM address');
    console.log('🧹 Force cleared all addresses');
  } catch (error) {
    console.error('❌ Error force clearing addresses:', error);
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
    console.log('✅ SQLite database closed');
  }
}
