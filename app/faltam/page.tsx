"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAlbum, type Album } from "@/lib/album";

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
    const result: { title: string; flag: string; codes: string[] }[] = [];
    for (const t of album.teams) {
      const codes = t.stickers.filter((s) => !s.owned).map((s) => s.code);
      if (codes.length) result.push({ title: t.team.name, flag: t.team.flag, codes });
    }
    const specials = album.specials.filter((s) => !s.owned).map((s) => s.code);
    if (specials.length) result.push({ title: "Especiais", flag: "⭐", codes: specials });
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
        <h1 className="text-xl font-extrabold text-emerald-900">❌ O que falta</h1>
        {totalMissing > 0 && (
          <button
            onClick={copyList}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm"
          >
            {copied ? "Copiado! ✓" : "Copiar lista"}
          </button>
        )}
      </div>
      <p className="text-emerald-600 text-sm mt-1">{totalMissing} figurinhas faltando</p>

      {groups.length === 0 ? (
        <Centered>Álbum completo! 🏆</Centered>
      ) : (
        <div className="mt-4 grid gap-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-xl bg-white border border-emerald-100 shadow-sm p-3">
              <div className="font-semibold text-emerald-900 mb-2">
                {g.flag} {g.title}{" "}
                <span className="text-xs font-normal text-emerald-500">({g.codes.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.codes.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 text-xs font-medium"
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
  return <div className="text-center text-emerald-600 py-16">{children}</div>;
}
