// Importa cromos recém-adquiridos (pasta Drive 1TurCJQk...).
// Regra: cada cópia adquirida -> owned=true. Se já era owned, a cópia vira repetida.
//   dup_novo = dup_atual + (jaTinha ? copias : copias - 1)
// Uso: node --env-file=.env.local scripts/import-acquired.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Faltam envs Supabase no .env.local"); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const data = JSON.parse(readFileSync(join(__dirname, "acquired-data.json"), "utf8"));

// conta cópias por código
const copies = new Map();
for (const id of data.team) copies.set(id, (copies.get(id) ?? 0) + 1);

const repetidosNoLote = [...copies.entries()].filter(([, c]) => c > 1);
if (repetidosNoLote.length) {
  console.log("Códigos com +1 cópia no lote:", repetidosNoLote.map(([id, c]) => `${id} x${c}`).join(", "));
}

async function main() {
  const ids = [...copies.keys()];

  // valida ids
  const known = new Set();
  for (let i = 0; i < ids.length; i += 300) {
    const { data: ex, error } = await db.from("stickers").select("id").in("id", ids.slice(i, i + 300));
    if (error) throw error;
    ex.forEach((s) => known.add(s.id));
  }
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) console.warn("⚠ Ids não encontrados (verificar sigla):", missing.join(", "));

  // estado atual da coleção p/ esses ids
  const valid = ids.filter((id) => known.has(id));
  const current = new Map();
  for (let i = 0; i < valid.length; i += 300) {
    const { data: col, error } = await db.from("collection").select("sticker_id,owned,duplicates").in("sticker_id", valid.slice(i, i + 300));
    if (error) throw error;
    col.forEach((c) => current.set(c.sticker_id, c));
  }

  const rows = valid.map((id) => {
    const c = copies.get(id);
    const cur = current.get(id);
    const jaTinha = cur?.owned ?? false;
    const dupAtual = cur?.duplicates ?? 0;
    const dupNovo = dupAtual + (jaTinha ? c : c - 1);
    return { sticker_id: id, owned: true, duplicates: dupNovo, updated_at: new Date().toISOString() };
  });

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await db.from("collection").upsert(rows.slice(i, i + 200), { onConflict: "sticker_id" });
    if (error) throw error;
  }

  const novos = rows.filter((r) => !current.get(r.sticker_id)?.owned).length;
  const { count: ownedCount } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  console.log(`✅ ${valid.length} cromos adquiridos processados (${novos} viraram 'tenho' novos; resto já tinha -> repetida).`);
  console.log(`   Total owned=true agora: ${ownedCount}.`);
  console.log(`   FWC (especiais) não importados: ${data.specials.join(", ")} — marcar manual.`);
}

main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
