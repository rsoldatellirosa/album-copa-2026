"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAlbum, type Album } from "@/lib/album";
import { flagUrl } from "@/lib/flags";

export default function FaltamPage() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAlbum()
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    if (!album) return [];
    const result: { title: string; flag: string; code: string | null; codes: string[] }[] = [];
    for (const t of album.teams) {
      const codes = t.stickers.filter((s) => !s.owned).map((s) => s.code);
      if (codes.length) result.push({ title: t.team.name, flag: t.team.flag, code: t.team.code, codes });
    }
    const specials = album.specials.filter((s) => !s.owned).map((s) => s.code);
    if (specials.length) result.push({ title: "Especiais", flag: "⭐", code: null, codes: specials });
    return result;
  }, [album]);

  const totalMissing = album ? album.totalStickers - album.totalOwned : 0;

  function copyList() {
    const text = groups.map((g) => `${g.flag} ${g.title}: ${g.codes.join(", ")}`).join("\n");
    navigator.clipboard.writeText(`Faltam (Copa 2026):\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <Centered>Carregando…</Centered>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-5 w-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink">❌ O que falta</h1>
        {totalMissing > 0 && (
          <button
            onClick={copyList}
            className="px-3 py-1.5 rounded bg-mint-deep text-white text-sm font-medium"
          >
            {copied ? "Copiado! ✓" : "Copiar lista"}
          </button>
        )}
      </div>
      <p className="text-ink/55 text-sm mt-1">{totalMissing} figurinhas faltando</p>

      {groups.length === 0 ? (
        <Centered>Álbum completo! 🏆</Centered>
      ) : (
        <div className="mt-4 grid gap-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-lg bg-paper border border-black/5 p-3">
              <div className="font-display font-semibold text-ink mb-2 flex items-center gap-2">
                {g.code && flagUrl(g.code) ? (
                  <img src={flagUrl(g.code)!} alt="" width={22} height={16} className="w-[22px] h-4 rounded object-cover" />
                ) : (
                  <span>⭐</span>
                )}
                {g.title}
                <span className="text-xs font-normal text-faint">({g.codes.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.codes.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-black/5 text-ink/60 px-2 py-0.5 text-xs font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-ink/60 py-16">{children}</div>;
}
