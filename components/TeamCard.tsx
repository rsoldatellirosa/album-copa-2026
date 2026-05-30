"use client";

import { useState } from "react";
import type { TeamWithStickers } from "@/lib/album";
import { flagUrl } from "@/lib/flags";
import StickerCell from "./StickerCell";
import ProgressBar from "./ProgressBar";

interface Props {
  data: TeamWithStickers;
  editable: boolean;
  onSaveSticker: (sticker_id: string, patch: { owned?: boolean; duplicates?: number }) => Promise<void>;
  defaultOpen?: boolean;
}

// Cor pastel por grupo (vibe 90s, color-blocking suave)
const GROUP_TINT: Record<string, string> = {
  A: "bg-mint", B: "bg-peach", C: "bg-lav", D: "bg-butter",
  E: "bg-pinky", F: "bg-sky", G: "bg-mint", H: "bg-peach",
  I: "bg-lav", J: "bg-butter", K: "bg-pinky", L: "bg-sky",
};

export default function TeamCard({ data, editable, onSaveSticker, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { team, stickers, owned, total } = data;
  const complete = owned === total && total > 0;
  const flag = flagUrl(team.code, 80);

  return (
    <div className="rounded-lg bg-paper border border-black/5 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {flag ? (
          <img
            src={flag}
            alt={team.name}
            width={36}
            height={27}
            loading="lazy"
            className="w-9 h-[27px] rounded object-cover shrink-0"
          />
        ) : (
          <span className="w-9 h-[27px] rounded bg-black/5 flex items-center justify-center text-[10px] font-bold shrink-0">
            {team.code}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-ink truncate">{team.name}</span>
            <span className={`text-[10px] font-semibold text-ink/70 rounded px-2 py-0.5 ${GROUP_TINT[team.group] ?? "bg-mint"}`}>
              {team.group}
            </span>
            {complete && <span className="w-2 h-2 rounded-full bg-mint-deep" title="Completa!" />}
          </div>
          <ProgressBar value={owned} total={total} className="mt-1.5" />
        </div>

        <div className="text-right shrink-0">
          <div className="font-display text-sm font-semibold text-ink">
            {owned}<span className="text-faint">/{total}</span>
          </div>
          <div className="text-faint text-xs">{open ? "▲" : "▼"}</div>
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
