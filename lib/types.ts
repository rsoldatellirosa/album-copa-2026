export type Section = "team" | "opening" | "museum";
export type StickerKind = "logo" | "player" | "special";

export interface Team {
  code: string; // sigla FIFA, ex. "BRA"
  name: string;
  group: string; // "A".."L"
  flag: string; // emoji
  order: number;
  is_placeholder: boolean; // vaga de repescagem ainda indefinida
}

export interface Sticker {
  id: string; // ex. "BRA-1", "OPN-1", "MUS-1"
  code: string; // display, ex. "BRA 1"
  team_code: string | null;
  number: number;
  section: Section;
  kind: StickerKind;
  label: string | null; // nome do jogador, quando conhecido
}

export interface CollectionEntry {
  sticker_id: string;
  owned: boolean;
  duplicates: number;
  photo_url: string | null;
  updated_at: string;
}

// Sticker já combinado com o estado da coleção (para a UI).
export interface StickerWithState extends Sticker {
  owned: boolean;
  duplicates: number;
  photo_url: string | null;
}
