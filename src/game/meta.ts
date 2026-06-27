import type { ExpeditionMissionId, RoomType } from "../api/types";

export const ROOM_META: Record<RoomType, { label: string; icon: string; cost: number }> = {
  treasury: { label: "Treasury", icon: "🏛️", cost: 0 },
  kitchen: { label: "Kitchen", icon: "🍞", cost: 80 },
  sword_pit: { label: "Sword Pit", icon: "⚔️", cost: 120 },
  arena_gate: { label: "Arena Gate", icon: "🏟️", cost: 150 },
  heralds_post: { label: "Herald's Post", icon: "📯", cost: 200 },
  barracks: { label: "Barracks", icon: "🛏️", cost: 100 },
};

export const EXPEDITION_META: Record<
  ExpeditionMissionId,
  { label: string; duration: string; reward: number; minEnd: number }
> = {
  mission_30m: { label: "Near Provincia", duration: "30m", reward: 10, minEnd: 4 },
  mission_2h: { label: "Meme Sands", duration: "2h", reward: 35, minEnd: 8 },
  mission_8h: { label: "Emperor's Road", duration: "8h", reward: 100, minEnd: 12 },
};

export function arenaBossMaxHp(stage: number): number {
  return Math.floor(40 + stage * stage * 6);
}