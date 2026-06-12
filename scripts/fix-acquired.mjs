// Correção pontual da leitura da foto 5 (erros CIV/CPV e TUR 10/18).
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  // novos cromos que faltaram (foto 5) -> owned=true
  const add = ["TUR-10", "CIV-14", "CIV-19", "RSA-5", "POR-5"];
  const { error: e1 } = await db.from("collection").upsert(
    add.map((id) => ({ sticker_id: id, owned: true, updated_at: new Date().toISOString() })),
    { onConflict: "sticker_id" }
  );
  if (e1) throw e1;

  // TUR-18 foi leitura errada (era TUR-10). Ele já era 'tenho' pelo álbum;
  // o import adicionou uma repetida-fantasma. Zera o duplicates.
  const { error: e2 } = await db.from("collection")
    .update({ duplicates: 0, updated_at: new Date().toISOString() })
    .eq("sticker_id", "TUR-18");
  if (e2) throw e2;

  const { count } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  console.log(`✅ Correção aplicada. Total owned=true agora: ${count}.`);
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
