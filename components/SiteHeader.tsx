"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEdit } from "./EditProvider";
import InstallPWA from "./InstallPWA";

const links = [
  { href: "/", label: "Álbum" },
  { href: "/repetidas", label: "Repetidas" },
  { href: "/faltam", label: "Faltam" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { unlocked, unlock, lock } = useEdit();
  const [asking, setAsking] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const ok = await unlock(pin.trim());
    if (ok) {
      setAsking(false);
      setPin("");
    } else {
      setError("PIN inválido");
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur border-b border-black/5">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-sm bg-mint flex items-center justify-center text-sm">⚽</span>
          <span className="font-display font-bold text-ink tracking-tight hidden sm:block">
            Copa 2026
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2.5 py-1.5 rounded-sm font-medium transition-colors ${
                pathname === l.href ? "bg-mint text-ink" : "text-ink/60 hover:bg-black/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <InstallPWA />
          {unlocked ? (
            <button
              onClick={lock}
              className="ml-1 px-2.5 py-1.5 rounded-sm text-ink hover:bg-black/5"
              title="Sair do modo edição"
            >
              🔓
            </button>
          ) : (
            <button
              onClick={() => setAsking(true)}
              className="ml-1 px-2.5 py-1.5 rounded-sm text-faint hover:bg-black/5"
              title="Desbloquear edição"
            >
              🔒
            </button>
          )}
        </nav>
      </div>

      {asking && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4" onClick={() => setAsking(false)}>
          <div className="bg-paper rounded-md p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display font-bold text-ink mb-1">Modo edição</h2>
            <p className="text-sm text-faint mb-3">Digite o PIN para liberar a edição.</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
              className="w-full bg-cream border border-black/10 rounded-sm px-3 py-2 outline-none focus:ring-2 focus:ring-mint"
              placeholder="PIN"
            />
            {error && <p className="text-coral text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setAsking(false)} className="flex-1 py-2 rounded-sm border border-black/10 text-ink/60">
                Cancelar
              </button>
              <button onClick={submit} className="flex-1 py-2 rounded-sm bg-mint-deep text-white font-medium">
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
