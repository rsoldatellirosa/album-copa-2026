// Importa keep2-data.json: novas -> owned=true; repetidas -> owned=true + dup += ocorrências.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(join(__dirname, "keep2-data.json"), "utf8"));

// conta cópias por código na lista de repetidas
const repCount = new Map();
for (const id of data.repetidas) repCount.set(id, (repCount.get(id) ?? 0) + 1);

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

  const rows = allIds.filter((id) => known.has(id)).map((id) => {
    const cur = current.get(id);
    const dup = (cur?.duplicates ?? 0) + (repCount.get(id) ?? 0);
    return { sticker_id: id, owned: true, duplicates: dup, updated_at: new Date().toISOString() };
  });

  const novosOwned = rows.filter((r) => !current.get(r.sticker_id)?.owned).length;
  const repCopias = [...repCount.values()].reduce((a, b) => a + b, 0);

  const { error } = await db.from("collection").upsert(rows, { onConflict: "sticker_id" });
  if (error) throw error;

  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  const { data: d } = await db.from("collection").select("duplicates").gt("duplicates", 0);
  const totalDup = d.reduce((s, r) => s + r.duplicates, 0);
  console.log(`✅ processados ${rows.length}. Novos 'tenho': ${novosOwned}. +${repCopias} cópias repetidas.`);
  console.log(`   owned=${owned}, total cópias repetidas=${totalDup}.`);
  console.log("   NÃO importado: 'Raúl Jiménez (México) - Coca-Cola' (promocional, fora do álbum).");
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
