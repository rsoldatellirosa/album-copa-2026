"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEdit } from "./EditProvider";

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
    <header
      className="sticky top-0 z-20 border-b border-emerald-100"
      style={{ background: "rgba(244,247,244,0.9)", backdropFilter: "blur(10px)" }}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">⚽</span>
          <span className="font-extrabold text-emerald-800 tracking-tight hidden sm:block">
            Álbum Copa 2026
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2.5 py-1.5 rounded-md font-medium ${
                pathname === l.href
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {unlocked ? (
            <button
              onClick={lock}
              className="ml-1 px-2.5 py-1.5 rounded-md text-amber-700 hover:bg-amber-50 font-medium"
              title="Sair do modo edição"
            >
              🔓
            </button>
          ) : (
            <button
              onClick={() => setAsking(true)}
              className="ml-1 px-2.5 py-1.5 rounded-md text-emerald-400 hover:bg-emerald-50"
              title="Desbloquear edição"
            >
              🔒
            </button>
          )}
        </nav>
      </div>

      {asking && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setAsking(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-emerald-900 mb-1">Modo edição</h2>
            <p className="text-sm text-gray-500 mb-3">Digite o PIN para liberar a edição.</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
              className="w-full border border-emerald-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="PIN"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setAsking(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600">
                Cancelar
              </button>
              <button onClick={submit} className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-medium">
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
