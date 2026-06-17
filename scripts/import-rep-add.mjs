// Adiciona repetidas novas (rep-add-data.json): duplicates += 1, owned=true.
// NÃO substitui o que já existe (essas são repetidas novas, em sua maioria
// diferentes das já cadastradas).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(join(__dirname, "rep-add-data.json"), "utf8"));

async function main() {
  const ids = [...data.team, ...data.specials];

  // valida
  const known = new Set();
  const { data: ex, error: ke } = await db.from("stickers").select("id").in("id", ids);
  if (ke) throw ke;
  ex.forEach((s) => known.add(s.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) console.warn("⚠ não encontrados:", missing.join(", "));

  // estado atual
  const current = new Map();
  const { data: col, error: ce } = await db.from("collection").select("sticker_id,duplicates").in("sticker_id", ids);
  if (ce) throw ce;
  col.forEach((c) => current.set(c.sticker_id, c));

  const rows = ids.filter((id) => known.has(id)).map((id) => ({
    sticker_id: id, owned: true,
    duplicates: (current.get(id)?.duplicates ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await db.from("collection").upsert(rows, { onConflict: "sticker_id" });
  if (error) throw error;

  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  const { data: d } = await db.from("collection").select("duplicates").gt("duplicates", 0);
  const totalDup = d.reduce((s, r) => s + r.duplicates, 0);
  console.log(`✅ ${rows.length} repetidas adicionadas (+1 cada). owned=${owned}, total cópias repetidas=${totalDup}.`);
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
