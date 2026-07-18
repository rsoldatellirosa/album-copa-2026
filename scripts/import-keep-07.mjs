// Importa keep-2026-07-data.json:
//   novas    -> owned=true (preserva duplicates)
//   repetidas-> owned=true, duplicates += 1
// Modo ADD.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(join(__dirname, "keep-2026-07-data.json"), "utf8"));

async function main() {
  const allIds = [...new Set([...data.novas, ...data.repetidas])];

  const known = new Set();
  const { data: ex, error: ke } = await db.from("stickers").select("id").in("id", allIds);
  if (ke) throw ke;
  ex.forEach((s) => known.add(s.id));
  const missing = allIds.filter((id) => !known.has(id));
  if (missing.length) console.warn("⚠ não encontrados:", missing.join(", "));

  const current = new Map();
  const { data: col, error: ce } = await db.from("collection").select("sticker_id,owned,duplicates").in("sticker_id", allIds);
  if (ce) throw ce;
  col.forEach((c) => current.set(c.sticker_id, c));

  const repSet = new Set(data.repetidas);
  const rows = allIds.filter((id) => known.has(id)).map((id) => {
    const cur = current.get(id);
    const dup = (cur?.duplicates ?? 0) + (repSet.has(id) ? 1 : 0); // só repetidas somam
    return { sticker_id: id, owned: true, duplicates: dup, updated_at: new Date().toISOString() };
  });

  const novosOwned = rows.filter((r) => !current.get(r.sticker_id)?.owned).length;

  const { error } = await db.from("collection").upsert(rows, { onConflict: "sticker_id" });
  if (error) throw error;

  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  const { data: d } = await db.from("collection").select("duplicates").gt("duplicates", 0);
  const totalDup = d.reduce((s, r) => s + r.duplicates, 0);
  console.log(`✅ ${rows.length} cromos processados. Novos 'tenho': ${novosOwned}. +${data.repetidas.length} repetidas.`);
  console.log(`   owned=${owned}, total cópias repetidas=${totalDup}.`);
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
