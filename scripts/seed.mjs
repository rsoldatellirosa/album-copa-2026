// Popula teams + stickers (a lista mestre de 980 figurinhas).
// Uso: npm run seed   (lê .env.local via --env-file)
import { createClient } from "@supabase/supabase-js";
import { teams } from "./teams.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const STICKERS_PER_TEAM = 20;

function buildRows() {
  const teamRows = teams.map((t, i) => ({ ...t, order: i + 1 }));

  const stickerRows = [];
  for (const t of teamRows) {
    for (let n = 1; n <= STICKERS_PER_TEAM; n++) {
      stickerRows.push({
        id: `${t.code}-${n}`,
        code: `${t.code} ${n}`,
        team_code: t.code,
        number: n,
        section: "team",
        kind: n === 1 ? "logo" : "player",
        label: null,
      });
    }
  }
  // Especiais: 9 de abertura + 11 FIFA Museum
  for (let n = 1; n <= 9; n++) {
    stickerRows.push({ id: `OPN-${n}`, code: `ABE ${n}`, team_code: null, number: n, section: "opening", kind: "special", label: null });
  }
  for (let n = 1; n <= 11; n++) {
    stickerRows.push({ id: `MUS-${n}`, code: `MUS ${n}`, team_code: null, number: n, section: "museum", kind: "special", label: null });
  }
  return { teamRows, stickerRows };
}

async function main() {
  const { teamRows, stickerRows } = buildRows();

  console.log(`Upsert de ${teamRows.length} seleções...`);
  const { error: te } = await db.from("teams").upsert(teamRows, { onConflict: "code" });
  if (te) throw te;

  console.log(`Upsert de ${stickerRows.length} figurinhas...`);
  for (let i = 0; i < stickerRows.length; i += 200) {
    const batch = stickerRows.slice(i, i + 200);
    const { error: se } = await db.from("stickers").upsert(batch, { onConflict: "id" });
    if (se) throw se;
  }

  const { count } = await db.from("stickers").select("*", { count: "exact", head: true });
  console.log(`✅ Pronto. Total de figurinhas no banco: ${count} (esperado 980).`);
}

main().catch((e) => {
  console.error("Erro no seed:", e.message ?? e);
  process.exit(1);
});
