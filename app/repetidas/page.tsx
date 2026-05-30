"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAlbum, type Album } from "@/lib/album";
import { flagUrl } from "@/lib/flags";

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
    const result: { title: string; flag: string; code: string | null; items: { code: string; dup: number }[] }[] = [];
    for (const t of album.teams) {
      const items = t.stickers
        .filter((s) => s.duplicates > 0)
        .map((s) => ({ code: s.code, dup: s.duplicates }));
      if (items.length) result.push({ title: t.team.name, flag: t.team.flag, code: t.team.code, items });
    }
    const specials = album.specials
      .filter((s) => s.duplicates > 0)
      .map((s) => ({ code: s.code, dup: s.duplicates }));
    if (specials.length) result.push({ title: "Especiais", flag: "⭐", code: null, items: specials });
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
        <h1 className="font-display text-xl font-bold text-ink">🟡 Minhas repetidas</h1>
        {total > 0 && (
          <button
            onClick={copyList}
            className="px-3 py-1.5 rounded-sm bg-mint-deep text-white text-sm font-medium"
          >
            {copied ? "Copiado! ✓" : "Copiar lista"}
          </button>
        )}
      </div>
      <p className="text-ink/55 text-sm mt-1">{total} figurinhas repetidas pra trocar</p>

      {groups.length === 0 ? (
        <Centered>Nenhuma repetida ainda. 🍀</Centered>
      ) : (
        <div className="mt-4 grid gap-3">
          {groups.map((g) => (
            <div key={g.title} className="rounded-md bg-paper border border-black/5 p-3">
              <div className="font-display font-semibold text-ink mb-2 flex items-center gap-2">
                {g.code && flagUrl(g.code) ? (
                  <img src={flagUrl(g.code)!} alt="" width={22} height={16} className="w-[22px] h-4 rounded-sm object-cover" />
                ) : (
                  <span>⭐</span>
                )}
                {g.title}
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <span
                    key={i.code}
                    className="inline-flex items-center gap-1 rounded-sm bg-peach text-ink px-2.5 py-1 text-sm font-medium"
                  >
                    {i.code}
                    {i.dup > 1 && <b className="text-coral">x{i.dup}</b>}
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
