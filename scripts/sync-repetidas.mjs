// Sincroniza as REPETIDAS com as fotos atuais do Drive (pasta 1Jscug1M..., 2026-06-12).
// Substitui o estado: zera duplicates de tudo e grava exatamente o que está nas fotos.
// Repetida implica ter -> owned=true para todos os listados.
// Fora do modelo: 1x CUW-? (número oculto na foto) e 2x cromo "00" (promocional).
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const DUPES = {
  // foto 1
  "FRA-12": 1, "ECU-6": 1, "AUT-5": 1, "COL-14": 1, "UZB-20": 1, "UZB-3": 1,
  "SEN-10": 1, "SEN-19": 1, "SEN-6": 1, "SEN-8": 1, "POR-4": 2, "POR-16": 1,
  "FRA-4": 1, "CIV-9": 1,
  // foto 2
  "BRA-14": 1, "ALG-10": 1, "ALG-15": 1, "ALG-20": 1, "CIV-20": 1, "CIV-7": 1,
  "CIV-2": 1, "RSA-2": 1, "RSA-13": 1, "RSA-20": 1, "RSA-8": 1, "RSA-12": 2,
  "RSA-3": 1, "BRA-10": 1, "CAN-16": 1,
  // foto 3
  "SCO-8": 1, "EGY-19": 1, "GER-12": 1, "CRO-10": 1, "PAN-13": 1, "CAN-18": 1,
  "CAN-3": 1, "SCO-1": 1, "URU-12": 1, "JOR-20": 1, "BIH-11": 1, "USA-15": 1,
  "USA-8": 1, "UZB-16": 1, "SCO-2": 1,
  // foto 4 (especiais)
  "FWC-14": 1, "FWC-12": 1, "FWC-16": 1,
};

async function main() {
  // 1) zera todas as repetidas antigas
  const { error: ze } = await db.from("collection").update({ duplicates: 0 }).gt("duplicates", 0);
  if (ze) throw ze;

  // 2) grava o estado das fotos (owned=true + duplicates)
  const rows = Object.entries(DUPES).map(([sticker_id, duplicates]) => ({
    sticker_id, owned: true, duplicates, updated_at: new Date().toISOString(),
  }));
  const { error } = await db.from("collection").upsert(rows, { onConflict: "sticker_id" });
  if (error) throw error;

  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  const { data: d } = await db.from("collection").select("duplicates").gt("duplicates", 0);
  const totalDup = d.reduce((s, r) => s + r.duplicates, 0);
  console.log(`✅ Repetidas sincronizadas: ${rows.length} cromos distintos, ${totalDup} cópias. Owned: ${owned}.`);
  console.log("   Fora do modelo: 1x CUW-? (número oculto) e 2x cromo '00' (promocional).");
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
