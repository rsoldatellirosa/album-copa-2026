// Importa o 2º lote de adquiridos (acquired2-data.json).
// owned=true; se já tinha (álbum/anterior), a nova cópia vira repetida (dup+1).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(join(__dirname, "acquired2-data.json"), "utf8"));

async function main() {
  const ids = data.team;

  const known = new Set();
  for (let i = 0; i < ids.length; i += 300) {
    const { data: ex, error } = await db.from("stickers").select("id").in("id", ids.slice(i, i + 300));
    if (error) throw error;
    ex.forEach((s) => known.add(s.id));
  }
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) console.warn("⚠ Ids não encontrados:", missing.join(", "));

  const current = new Map();
  const { data: col, error: ce } = await db.from("collection").select("sticker_id,owned,duplicates").in("sticker_id", ids);
  if (ce) throw ce;
  col.forEach((c) => current.set(c.sticker_id, c));

  const rows = ids.filter((id) => known.has(id)).map((id) => {
    const cur = current.get(id);
    const jaTinha = cur?.owned ?? false;
    const dup = (cur?.duplicates ?? 0) + (jaTinha ? 1 : 0);
    return { sticker_id: id, owned: true, duplicates: dup, updated_at: new Date().toISOString() };
  });

  const { error } = await db.from("collection").upsert(rows, { onConflict: "sticker_id" });
  if (error) throw error;

  const novos = rows.filter((r) => !current.get(r.sticker_id)?.owned).length;
  const viraramRepetida = rows.length - novos;
  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  console.log(`✅ ${rows.length} processados: ${novos} novos 'tenho', ${viraramRepetida} já tinha (viraram repetida). Owned total: ${owned}.`);
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
