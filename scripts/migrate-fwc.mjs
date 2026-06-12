// Migra os especiais do modelo antigo (OPN-1..9 / MUS-1..11, inventado)
// para o real do álbum: FWC-1..20 (numeração impressa no verso).
// Depois marca como 'tenho' os FWC adquiridos.
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const ACQUIRED_FWC = [7, 9, 11, 13, 15, 18, 19];

async function main() {
  // 1) remove os especiais antigos (todos sem coleção registrada; cascade limpa)
  const old = [...Array(9)].map((_, i) => `OPN-${i + 1}`).concat([...Array(11)].map((_, i) => `MUS-${i + 1}`));
  const { error: de } = await db.from("stickers").delete().in("id", old);
  if (de) throw de;

  // 2) cria FWC-1..20
  const rows = [...Array(20)].map((_, i) => ({
    id: `FWC-${i + 1}`, code: `FWC ${i + 1}`, team_code: null,
    number: i + 1, section: "special", kind: "special", label: null,
  }));
  const { error: ie } = await db.from("stickers").upsert(rows, { onConflict: "id" });
  if (ie) throw ie;

  // 3) marca os adquiridos
  const { error: ce } = await db.from("collection").upsert(
    ACQUIRED_FWC.map((n) => ({ sticker_id: `FWC-${n}`, owned: true, updated_at: new Date().toISOString() })),
    { onConflict: "sticker_id" }
  );
  if (ce) throw ce;

  const { count: total } = await db.from("stickers").select("*", { count: "exact", head: true });
  const { count: owned } = await db.from("collection").select("*", { count: "exact", head: true }).eq("owned", true);
  console.log(`✅ FWC-1..20 no lugar de OPN/MUS. Stickers: ${total} (esperado 980). Owned: ${owned}.`);
}
main().catch((e) => { console.error("Erro:", e.message ?? e); process.exit(1); });
