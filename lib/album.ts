import { supabase } from "./supabase";
import type { Team, Sticker, CollectionEntry, StickerWithState } from "./types";

export interface TeamWithStickers {
  team: Team;
  stickers: StickerWithState[];
  owned: number;
  total: number;
}

export interface Album {
  teams: TeamWithStickers[];
  specials: StickerWithState[]; // abertura + museum
  totalStickers: number;
  totalOwned: number;
  totalDuplicates: number;
}

export async function fetchAlbum(): Promise<Album> {
  const [teamsRes, stickersRes, collectionRes] = await Promise.all([
    supabase.from("teams").select("*").order("order", { ascending: true }),
    supabase.from("stickers").select("*").order("number", { ascending: true }),
    supabase.from("collection").select("*"),
  ]);

  const teams = (teamsRes.data ?? []) as Team[];
  const stickers = (stickersRes.data ?? []) as Sticker[];
  const collection = (collectionRes.data ?? []) as CollectionEntry[];

  const colMap = new Map(collection.map((c) => [c.sticker_id, c]));
  const withState = (s: Sticker): StickerWithState => {
    const c = colMap.get(s.id);
    return {
      ...s,
      owned: c?.owned ?? false,
      duplicates: c?.duplicates ?? 0,
      photo_url: c?.photo_url ?? null,
    };
  };

  const teamsWithStickers: TeamWithStickers[] = teams.map((team) => {
    const list = stickers
      .filter((s) => s.team_code === team.code)
      .map(withState)
      .sort((a, b) => a.number - b.number);
    return {
      team,
      stickers: list,
      owned: list.filter((s) => s.owned).length,
      total: list.length,
    };
  });

  const specials = stickers
    .filter((s) => s.team_code === null)
    .map(withState)
    .sort((a, b) => (a.section === b.section ? a.number - b.number : a.section.localeCompare(b.section)));

  const totalOwned = stickers.filter((s) => colMap.get(s.id)?.owned).length;
  const totalDuplicates = collection.reduce((sum, c) => sum + (c.duplicates ?? 0), 0);

  return {
    teams: teamsWithStickers,
    specials,
    totalStickers: stickers.length,
    totalOwned,
    totalDuplicates,
  };
}

// ── Edição (envia o PIN no header; só funciona pra quem desbloqueou) ──
export async function saveSticker(
  token: string,
  sticker_id: string,
  patch: { owned?: boolean; duplicates?: number }
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-edit-token": token },
    body: JSON.stringify({ sticker_id, ...patch }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return { ok: false, error: j.error ?? `Erro ${res.status}` };
  }
  return { ok: true };
}

export async function checkToken(token: string): Promise<boolean> {
  const res = await fetch("/api/collection", {
    method: "PUT",
    headers: { "x-edit-token": token },
  });
  return res.ok;
}
