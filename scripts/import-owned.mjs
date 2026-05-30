// Importa as figurinhas que o usuário JÁ TEM (coladas no álbum), lidas das fotos.
// Lê scripts/owned-data.json e marca owned=true (preservando duplicates já importados).
// Também remove os 6 placeholders de repescagem (já substituídos por times reais no seed).
// Uso: node --env-file=.env.local scripts/import-owned.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const data = JSON.parse(readFileSync(join(__dirname, "owned-data.json"), "utf8"));
const OLD_PLACEHOLDERS = ["PEA", "PEB", "PEC", "PED", "PI1", "PI2"];

async function main() {
  // 1) Remove placeholders antigos (cascade apaga stickers/collection vazios deles)
  const { error: de } = await db.from("teams").delete().in("code", OLD_PLACEHOLDERS);
  if (de) throw de;
  console.log(`Placeholders removidos: ${OLD_PLACEHOLDERS.join(", ")}`);

  // 2) Monta as linhas owned a partir do JSON
  const rows = [];
  for (const [code, info] of Object.entries(data.teams)) {
    for (const n of info.owned) {
      rows.push({ sticker_id: `${code}-${n}`, owned: true, updated_at: new Date().toISOString() });
    }
  }

  // 3) Valida que os ids existem na lista mestre
  const ids = rows.map((r) => r.sticker_id);
  const known = new Set();
  for (let i = 0; i < ids.length; i += 300) {
    const { data: ex, error } = await db.from("stickers").select("id").in("id", ids.slice(i, i + 300));
    if (error) throw error;
    ex.forEach((s) => known.add(s.id));
  }
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) console.warn("⚠ Ids não encontrados (verificar):", missing.join(", "));

  // 4) Upsert owned=true (NÃO mexe em duplicates já existentes)
  const valid = rows.filter((r) => known.has(r.sticker_id));
  for (let i = 0; i < valid.length; i += 200) {
    const { error } = await db.from("collection").upsert(valid.slice(i, i + 200), { onConflict: "sticker_id" });
    if (error) throw error;
  }

  // 5) Resumo
  const { count: ownedCount } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  const { count: teamCount } = await db.from("teams").select("*", { count: "exact", head: true });
  console.log(`✅ Importadas ${valid.length} figurinhas 'tenho' (de ${Object.keys(data.teams).length} seleções).`);
  console.log(`   Seleções no banco: ${teamCount} (esperado 48). Total owned=true: ${ownedCount}.`);
}

main().catch((e) => {
  console.error("Erro:", e.message ?? e);
  process.exit(1);
});
