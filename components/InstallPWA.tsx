"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    // Já instalado (rodando como app)? Não mostra nada.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error Safari iOS
      window.navigator.standalone === true;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);
    if (ios) setShow(true); // iOS não dispara beforeinstallprompt

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    const onInstalled = () => setShow(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
    } else if (isIOS) {
      setIosHelp(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="ml-1 px-2.5 py-1.5 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 whitespace-nowrap"
        title="Instalar como app"
      >
        📲 Instalar
      </button>

      {iosHelp && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setIosHelp(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-emerald-900 text-lg mb-2">📲 Instalar no iPhone</h2>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Toque no botão <b>Compartilhar</b> (o quadradinho com a seta ↑) na barra do Safari.</li>
              <li>Role e toque em <b>&quot;Adicionar à Tela de Início&quot;</b>.</li>
              <li>Confirme em <b>Adicionar</b>. Pronto — vira um app! ⚽</li>
            </ol>
            <button
              onClick={() => setIosHelp(false)}
              className="mt-4 w-full py-2 rounded-lg bg-emerald-600 text-white font-medium"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
