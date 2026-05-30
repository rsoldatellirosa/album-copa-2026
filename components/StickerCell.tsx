"use client";

import { useState } from "react";
import type { StickerWithState } from "@/lib/types";

interface Props {
  sticker: StickerWithState;
  editable: boolean;
  onSave: (patch: { owned?: boolean; duplicates?: number }) => Promise<void>;
}

export default function StickerCell({ sticker, editable, onSave }: Props) {
  const [busy, setBusy] = useState(false);
  const { number, owned, duplicates, label } = sticker;

  async function run(patch: { owned?: boolean; duplicates?: number }) {
    if (!editable || busy) return;
    setBusy(true);
    try {
      await onSave(patch);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-lg border text-center select-none aspect-square ${
        owned
          ? "bg-emerald-600 border-emerald-700 text-white"
          : "bg-white border-emerald-100 text-emerald-300"
      } ${editable ? "cursor-pointer hover:ring-2 hover:ring-emerald-400" : ""} ${
        busy ? "opacity-60" : ""
      }`}
      onClick={() => run({ owned: !owned })}
      title={label ?? `Figurinha ${number}`}
    >
      <span className="text-base font-bold leading-none">{number}</span>
      {label && (
        <span className="px-0.5 mt-0.5 text-[8px] leading-tight line-clamp-1 opacity-80">
          {label}
        </span>
      )}

      {duplicates > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold shadow">
          +{duplicates}
        </span>
      )}

      {editable && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-4 h-4 rounded-full bg-white border border-emerald-300 text-emerald-700 text-[10px] leading-none flex items-center justify-center shadow-sm disabled:opacity-40"
            disabled={busy || duplicates === 0}
            onClick={() => run({ duplicates: duplicates - 1 })}
          >
            −
          </button>
          <button
            className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] leading-none flex items-center justify-center shadow-sm disabled:opacity-40"
            disabled={busy}
            onClick={() => run({ owned: true, duplicates: duplicates + 1 })}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
