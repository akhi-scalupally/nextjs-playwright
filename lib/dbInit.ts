import { ensureAddressTable, getPool } from "./db";

let didInit = false;

export async function initDb(): Promise<void> {
  if (didInit) return;
  try {
    // getPool will also attempt a ping and log once
    const pool = getPool();
    await pool.query("SELECT 1");
    await ensureAddressTable();
    didInit = true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DB init failed:", err);
  }
}


