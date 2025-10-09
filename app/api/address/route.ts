import { NextResponse } from "next/server";
import { ensureAddressTable, getPool } from "../../../lib/db";

type Address = {
  id?: number;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
};

const required = ["name", "line1", "city", "postalCode", "country"] as const;
function validate(body: Partial<Address>) {
  const missing = required.filter((k) => !String((body as any)[k] ?? "").trim());
  return { ok: missing.length === 0, missing };
}

export async function GET() {
  await ensureAddressTable();
  const pool = getPool();
  const [rows] = await pool.query("SELECT * FROM address ORDER BY id DESC");
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Address>;
    const v = validate(body);
    if (!v.ok) {
      return NextResponse.json(
        { error: "Missing required fields", missing: v.missing },
        { status: 400 }
      );
    }
    await ensureAddressTable();
    const pool = getPool();
    const [result]: any = await pool.query(
      `INSERT INTO address (name, line1, line2, city, state, postalCode, country, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(body.name),
        String(body.line1),
        body.line2 ? String(body.line2) : null,
        String(body.city),
        body.state ? String(body.state) : null,
        String(body.postalCode),
        String(body.country),
        body.phone ? String(body.phone) : null,
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM address WHERE id = ?", [result.insertId]);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid JSON" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}


