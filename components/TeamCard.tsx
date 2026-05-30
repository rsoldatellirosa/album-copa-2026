"use client";

import { useState } from "react";
import type { TeamWithStickers } from "@/lib/album";
import StickerCell from "./StickerCell";
import ProgressBar from "./ProgressBar";

interface Props {
  data: TeamWithStickers;
  editable: boolean;
  onSaveSticker: (sticker_id: string, patch: { owned?: boolean; duplicates?: number }) => Promise<void>;
  defaultOpen?: boolean;
}

export default function TeamCard({ data, editable, onSaveSticker, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { team, stickers, owned, total } = data;
  const complete = owned === total && total > 0;

  return (
    <div className="rounded-xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-2xl leading-none">{team.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-900 truncate">{team.name}</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 rounded px-1.5 py-0.5">
              Grupo {team.group}
            </span>
            {complete && <span title="Completa!">✅</span>}
          </div>
          <ProgressBar value={owned} total={total} className="mt-1.5" />
        </div>
        <div className="text-right shrink-0">
          <div className={`text-sm font-bold ${complete ? "text-emerald-600" : "text-emerald-900"}`}>
            {owned}/{total}
          </div>
          <div className="text-emerald-400 text-xs">{open ? "▲" : "▼"}</div>
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 px-3 pb-4 pt-1">
          {stickers.map((s) => (
            <StickerCell
              key={s.id}
              sticker={s}
              editable={editable}
              onSave={(patch) => onSaveSticker(s.id, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
