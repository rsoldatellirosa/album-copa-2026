"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAlbum, saveSticker, type Album } from "@/lib/album";
import { useEdit } from "@/components/EditProvider";
import TeamCard from "@/components/TeamCard";
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  const { token, unlocked } = useEdit();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAlbum()
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, []);

  async function onSaveSticker(
    sticker_id: string,
    patch: { owned?: boolean; duplicates?: number }
  ) {
    if (!token) return;
    // Otimista: aplica na hora e reverte se falhar.
    setAlbum((prev) => prev && applyPatch(prev, sticker_id, patch));
    const res = await saveSticker(token, sticker_id, patch);
    if (!res.ok) {
      alert(res.error ?? "Falha ao salvar");
      fetchAlbum().then(setAlbum);
    }
  }

  const filteredTeams = useMemo(() => {
    if (!album) return [];
    const q = search.trim().toLowerCase();
    if (!q) return album.teams;
    return album.teams.filter(
      (t) =>
        t.team.name.toLowerCase().includes(q) ||
        t.team.code.toLowerCase().includes(q) ||
        t.stickers.some(
          (s) => s.code.toLowerCase().includes(q) || s.label?.toLowerCase().includes(q)
        )
    );
  }, [album, search]);

  if (loading) {
    return <Centered>Carregando o álbum… ⚽</Centered>;
  }
  if (!album) {
    return <Centered>Não consegui carregar. Confira a conexão com o Supabase.</Centered>;
  }

  const pct = Math.round((album.totalOwned / album.totalStickers) * 100);

  return (
    <main className="max-w-4xl mx-auto px-4 py-5 w-full">
      {/* Resumo */}
      <section className="rounded-lg bg-mintsoft border border-line p-5">
        <h1 className="font-display text-sm font-semibold text-ink/60 tracking-wide uppercase">
          Minha coleção
        </h1>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display text-5xl font-bold text-ink">{album.totalOwned}</span>
          <span className="text-ink/50">/ {album.totalStickers} · {pct}%</span>
        </div>
        <ProgressBar value={album.totalOwned} total={album.totalStickers} className="mt-3" />
        <div className="flex gap-4 mt-3 text-sm text-ink/70">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-coral" /> {album.totalDuplicates} repetidas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-faint" /> {album.totalStickers - album.totalOwned} faltando
          </span>
        </div>
        {!unlocked && (
          <p className="text-xs text-ink/45 mt-3">
            Modo visualização. Toque no 🔒 no topo e digite o PIN para editar.
          </p>
        )}
      </section>

      {/* Busca */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar seleção, código (ex. BRA 10) ou jogador…"
        className="mt-5 w-full rounded border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-faint outline-none focus:ring-2 focus:ring-mint"
      />

      {/* Seleções */}
      <div className="mt-4 grid gap-3">
        {filteredTeams.map((t) => (
          <TeamCard
            key={t.team.code}
            data={t}
            editable={unlocked}
            onSaveSticker={onSaveSticker}
            defaultOpen={!!search.trim()}
          />
        ))}
      </div>

      {/* Especiais */}
      {album.specials.length > 0 && !search.trim() && (
        <div className="mt-6">
          <h2 className="font-display font-semibold text-ink mb-2 px-1">⭐ Especiais</h2>
          <div className="rounded-lg bg-paper border border-line p-3 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {album.specials.map((s) => (
              <SpecialCell key={s.id} code={s.code} owned={s.owned} duplicates={s.duplicates} />
            ))}
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-faint py-8">
        Feito com ⚽ • Álbum FIFA World Cup 2026
      </footer>
    </main>
  );
}

function applyPatch(
  album: Album,
  sticker_id: string,
  patch: { owned?: boolean; duplicates?: number }
): Album {
  let totalOwned = album.totalOwned;
  let totalDuplicates = album.totalDuplicates;

  const patchSticker = <T extends { id: string; owned: boolean; duplicates: number }>(s: T): T => {
    if (s.id !== sticker_id) return s;
    const nextOwned = patch.owned ?? s.owned;
    const nextDup = patch.duplicates ?? s.duplicates;
    if (nextOwned !== s.owned) totalOwned += nextOwned ? 1 : -1;
    totalDuplicates += nextDup - s.duplicates;
    return { ...s, owned: nextOwned, duplicates: nextDup };
  };

  const teams = album.teams.map((t) => {
    if (!t.stickers.some((s) => s.id === sticker_id)) return t;
    const stickers = t.stickers.map(patchSticker);
    return { ...t, stickers, owned: stickers.filter((s) => s.owned).length };
  });
  const specials = album.specials.map(patchSticker);

  return { ...album, teams, specials, totalOwned, totalDuplicates };
}

function SpecialCell({ code, owned, duplicates }: { code: string; owned: boolean; duplicates: number }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded text-center aspect-square text-[10px] font-bold ${
        owned ? "bg-butter text-onpastel" : "bg-paper border border-dashed border-line text-faint"
      }`}
      title={code}
    >
      {code}
      {duplicates > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded bg-coral text-white text-[10px]">
          +{duplicates}
        </span>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center text-ink/60 p-8 text-center">
      {children}
    </main>
  );
}
