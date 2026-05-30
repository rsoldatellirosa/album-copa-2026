import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Edição protegida: só passa quem mandar o header x-edit-token == EDIT_TOKEN.
// O cliente anon não consegue escrever (RLS); toda escrita vem por aqui.
function authorized(req: Request): boolean {
  const token = req.headers.get("x-edit-token");
  return !!process.env.EDIT_TOKEN && token === process.env.EDIT_TOKEN;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
  }

  let body: { sticker_id?: string; owned?: boolean; duplicates?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { sticker_id } = body;
  if (!sticker_id || typeof sticker_id !== "string") {
    return NextResponse.json({ error: "sticker_id obrigatório" }, { status: 400 });
  }

  const row: Record<string, unknown> = { sticker_id, updated_at: new Date().toISOString() };
  if (typeof body.owned === "boolean") row.owned = body.owned;
  if (typeof body.duplicates === "number") {
    row.duplicates = Math.max(0, Math.floor(body.duplicates));
  }

  const { data, error } = await supabaseAdmin
    .from("collection")
    .upsert(row, { onConflict: "sticker_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, entry: data });
}

// Verifica se um PIN é válido (usado pela tela de desbloqueio).
export async function PUT(req: Request) {
  return NextResponse.json({ ok: authorized(req) }, { status: authorized(req) ? 200 : 401 });
}
