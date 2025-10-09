import { NextResponse } from "next/server";
import { ensureAddressTable, getPool } from "../../../../lib/db";

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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await ensureAddressTable();
  const pool = getPool();
  const [rows]: any = await pool.query("SELECT * FROM address WHERE id = ?", [params.id]);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: rows[0] });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await ensureAddressTable();
  const pool = getPool();
  const [exists]: any = await pool.query("SELECT id FROM address WHERE id = ?", [params.id]);
  if (!exists[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as Partial<Address>;
  const v = validate(body);
  if (!v.ok) {
    return NextResponse.json(
      { error: "Missing required fields", missing: v.missing },
      { status: 400 }
    );
  }

  await pool.query(
    `UPDATE address SET name=?, line1=?, line2=?, city=?, state=?, postalCode=?, country=?, phone=? WHERE id=?`,
    [
      String(body.name),
      String(body.line1),
      body.line2 ? String(body.line2) : null,
      String(body.city),
      body.state ? String(body.state) : null,
      String(body.postalCode),
      String(body.country),
      body.phone ? String(body.phone) : null,
      params.id,
    ]
  );
  const [rows]: any = await pool.query("SELECT * FROM address WHERE id = ?", [params.id]);
  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await ensureAddressTable();
  const pool = getPool();
  const [rows]: any = await pool.query("SELECT * FROM address WHERE id = ?", [params.id]);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const toDelete = rows[0];
  await pool.query("DELETE FROM address WHERE id = ?", [params.id]);
  return NextResponse.json({ data: toDelete });
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


