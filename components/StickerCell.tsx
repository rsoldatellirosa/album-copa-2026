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
      className={`relative flex flex-col items-center justify-center rounded text-center select-none aspect-square ${
        owned
          ? "bg-mint text-ink"
          : "bg-paper text-faint border border-dashed border-black/10"
      } ${editable ? "cursor-pointer hover:brightness-95" : ""} ${busy ? "opacity-60" : ""}`}
      onClick={() => run({ owned: !owned })}
      title={label ?? `Figurinha ${number}`}
    >
      <span className="font-display text-base font-semibold leading-none">{number}</span>
      {label && (
        <span className="px-0.5 mt-0.5 text-[8px] leading-tight line-clamp-1 opacity-70">
          {label}
        </span>
      )}

      {duplicates > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded bg-coral text-white text-[10px] font-bold">
          +{duplicates}
        </span>
      )}

      {editable && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-4 h-4 rounded bg-paper border border-black/10 text-ink text-[10px] leading-none flex items-center justify-center disabled:opacity-40"
            disabled={busy || duplicates === 0}
            onClick={() => run({ duplicates: duplicates - 1 })}
          >
            −
          </button>
          <button
            className="w-4 h-4 rounded bg-coral text-white text-[10px] leading-none flex items-center justify-center disabled:opacity-40"
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
