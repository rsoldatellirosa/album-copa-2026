"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAlbum, type Album } from "@/lib/album";

export default function RepetidasPage() {
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
    const result: { title: string; flag: string; items: { code: string; dup: number }[] }[] = [];
    for (const t of album.teams) {
      const items = t.stickers
        .filter((s) => s.duplicates > 0)
        .map((s) => ({ code: s.code, dup: s.duplicates }));
      if (items.length) result.push({ title: t.team.name, flag: t.team.flag, items });
    }
    const specials = album.specials
      .filter((s) => s.duplicates > 0)
      .map((s) => ({ code: s.code, dup: s.duplicates }));
    if (specials.length) result.push({ title: "Especiais", flag: "⭐", items: specials });
    return result;
  }, [album]);

  const total = album?.totalDuplicates ?? 0;

  function copyList() {
    const text = groups
      .map((g) => `${g.flag} ${g.title}: ` + g.items.map((i) => `${i.code}${i.dup > 1 ? ` (x${i.dup})` : ""}`).join(", "))
      .join("\n");
    navigator.clipboard.writeText(`Tenho pra trocar (Copa 2026):\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <Centered>Carregando…</Centered>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-5 w-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-emerald-900">🟡 Minhas repetidas</h1>
        {total > 0 && (
          <button
            onClick={copyList}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm"
          >
            {copied ? "Copiado! ✓" : "Copiar lista"}
          </button>
        )}
      </div>
      <p className="text-emerald-600 text-sm mt-1">{total} figurinhas repetidas pra trocar</p>

      {groups.length === 0 ? (
        <Centered>Nenhuma repetida ainda. 🍀</Centered>
      ) : (
        <div className="mt-4 grid gap-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-xl bg-white border border-emerald-100 shadow-sm p-3">
              <div className="font-semibold text-emerald-900 mb-2">
                {g.flag} {g.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <span
                    key={i.code}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 text-sm font-medium"
                  >
                    {i.code}
                    {i.dup > 1 && <b className="text-amber-600">x{i.dup}</b>}
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
