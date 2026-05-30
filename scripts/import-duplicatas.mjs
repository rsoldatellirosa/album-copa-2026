// Importa as 45 fotos de figurinhas REPETIDAS do Drive para a coleção.
// Cada foto = 1 cópia extra. Marca owned=true e duplicates = nº de fotos daquela figurinha.
// Uso: npm run import-duplicatas
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// Códigos lidos do OCR do Drive (44 confirmadas). Uma foto por item;
// RSA 12 aparece em 3 fotos (#28,#29,#30) → 3 repetidas.
const fotos = [
  "GHA 14", "GHA 9", "ECU 6", "AUT 5", "COL 14", "UZB 16",
  "CIV 2", "CIV 7", "CIV 20", "CUW 17", "POR 4", "POR 16",
  "FRA 12", "FRA 4", "JPN 20", "SEN 8", "SEN 6", "SEN 19", "SEN 10",
  "CIV 9", "PAN 13", "RSA 3", "RSA 2", "RSA 13", "RSA 20", "RSA 8",
  "RSA 12", "RSA 12", "RSA 12", "BRA 10", "BRA 14",
  "ALG 10", "ALG 15", "ALG 20", "CAN 18", "CAN 3", "CAN 16",
  "KOR 5", "CRO 10", "GER 12", "EGY 19", "SCO 1", "SCO 2", "SCO 8",
];
// PENDENTE: foto #5 (20260530_111613.jpg) é o verso de um cromo ESPECIAL
// (emblema/troféu da Copa) — código de seleção ilegível. Confirme no app.

// Conta quantas fotos por figurinha → duplicates
const counts = new Map();
for (const code of fotos) {
  const id = code.replace(/\s+/g, "-"); // "GHA 14" -> "GHA-14"
  counts.set(id, (counts.get(id) ?? 0) + 1);
}

async function main() {
  const rows = [...counts.entries()].map(([sticker_id, duplicates]) => ({
    sticker_id,
    owned: true,
    duplicates,
    updated_at: new Date().toISOString(),
  }));

  // Valida que todos os ids existem na lista mestre antes de gravar.
  const ids = rows.map((r) => r.sticker_id);
  const { data: existing, error: ce } = await db.from("stickers").select("id").in("id", ids);
  if (ce) throw ce;
  const known = new Set((existing ?? []).map((s) => s.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) {
    console.warn("⚠ Códigos não encontrados na lista mestre (verifique a sigla):", missing.join(", "));
  }

  const valid = rows.filter((r) => known.has(r.sticker_id));
  const { error } = await db.from("collection").upsert(valid, { onConflict: "sticker_id" });
  if (error) throw error;

  const totalCopias = valid.reduce((s, r) => s + r.duplicates, 0);
  console.log(`✅ Importadas ${valid.length} figurinhas distintas (${totalCopias} cópias repetidas).`);
  console.log("Lembrete: 1 foto (#5, cromo especial) ficou pendente de confirmação.");
}

main().catch((e) => {
  console.error("Erro na importação:", e.message ?? e);
  process.exit(1);
});
