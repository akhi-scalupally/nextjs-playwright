import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;
let hasLoggedConnection = false;

export function getPool() {
  // Use SQLite for testing, MySQL for development/production
  const isTestEnv = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
                   
  console.log('🌍 Environment check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   NEXT_PUBLIC_TEST_MODE:', process.env.NEXT_PUBLIC_TEST_MODE);
  console.log('   Final isTestEnv:', isTestEnv);
  
  if (isTestEnv) {
    console.log('🔄 Using SQLite for testing');
    return getSqlitePool();
  } else {
    console.log('🔄 Using MySQL for development/production');

    // MySQL logic for development/production
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      
      // Try a quick ping and log once
      (async () => {
        try {
          const connection = await pool!.getConnection();
          await connection.ping();
          connection.release();
          if (!hasLoggedConnection) {
            hasLoggedConnection = true;
            // eslint-disable-next-line no-console
            console.log(
              `MySQL connected → ${process.env.MYSQL_HOST}:${
                Number(process.env.MYSQL_PORT)
              }/${process.env.MYSQL_DATABASE}`
            );
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("MySQL connection failed:", err);
        }
      })();
    }
    return pool;
  }
  
}

// Create SQLite wrapper that behaves like MySQL pool
function getSqlitePool() {
  try {
    console.log('📦 Loading SQLite database...');
    const { getSqliteDb } = require('./db-sqlite');
    const db = getSqliteDb();
    console.log('✅ SQLite database loaded successfully');
    
    return {
      async query(sql: string, params?: any[]) {
        try {
          const stmt = db.prepare(sql);
          
          if (sql.trim().toLowerCase().startsWith('select')) {
            const rows = params ? stmt.all(params) : stmt.all();
            return [rows];
          } else {
            const result = params ? stmt.run(params) : stmt.run();
            // Convert SQLite result to MySQL format
            const mysqlResult = {
              insertId: result.lastInsertRowid,
              affectedRows: result.changes,
              ...result
            };
            return [mysqlResult];
          }
        } catch (error) {
          console.error('SQLite query error:', error);
          throw error;
        }
      },
      async getConnection() {
        return {
          async ping() {},
          release() {}
        };
      }
    };
  } catch (error) {
    console.error('Failed to load SQLite:', error);
    throw error;
  }
}

export async function ensureAddressTable() {
  // Use the same environment detection logic
  const isTestEnv = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
                   
  if (isTestEnv) {
    // SQLite is synchronous, so we don't need await
    const { ensureAddressTableSqlite } = require('./db-sqlite');
    ensureAddressTableSqlite();
  } else {
    // MySQL table creation
    const sql = `
      CREATE TABLE IF NOT EXISTS address (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255) NULL,
        line1 VARCHAR(255) NOT NULL,
        line2 VARCHAR(255) NULL,
        city VARCHAR(120) NOT NULL,
        state VARCHAR(120) NULL,
        postalCode VARCHAR(30) NOT NULL,
        country VARCHAR(120) NOT NULL,
        phone VARCHAR(60) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    const pool = getPool();
    await pool.query(sql);
  }
}

