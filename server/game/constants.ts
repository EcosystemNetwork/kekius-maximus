import type { ExpeditionMissionId, Rarity, RoomType } from "./types.js";

export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
export const MAX_ROOM_SLOTS = 6;

export const ROOM_DEFS: Record<
  RoomType,
  { name: string; buildCost: number; description: string }
> = {
  barracks: {
    name: "Barracks",
    buildCost: 100,
    description: "+2 population cap per level",
  },
  kitchen: {
    name: "Kitchen",
    buildCost: 80,
    description: "Generates Bread for your legion",
  },
  sword_pit: {
    name: "Sword Pit",
    buildCost: 120,
    description: "Trains STR on assigned gladiator",
  },
  arena_gate: {
    name: "Arena Gate",
    buildCost: 150,
    description: "Boosts Hype from arena victories",
  },
  heralds_post: {
    name: "Herald's Post",
    buildCost: 200,
    description: "Unlocks gladiator recruitment",
  },
  treasury: {
    name: "Treasury",
    buildCost: 0,
    description: "Generates Drachma over time",
  },
};

export const EXPEDITION_DEFS: Record<
  ExpeditionMissionId,
  { name: string; durationMs: number; shardReward: number; minEnd: number }
> = {
  mission_30m: { name: "Near Provincia", durationMs: 30 * 60 * 1000, shardReward: 10, minEnd: 4 },
  mission_2h: { name: "Meme Sands", durationMs: 2 * 60 * 60 * 1000, shardReward: 35, minEnd: 8 },
  mission_8h: { name: "Emperor's Road", durationMs: 8 * 60 * 60 * 1000, shardReward: 100, minEnd: 12 },
};

export const RARITY_ORDER: Rarity[] = [
  "recruit",
  "veteran",
  "champion",
  "legend",
  "maximus",
];

export const RARITY_BASE: Record<Rarity, { str: number; end: number; agi: number; kek: number }> = {
  recruit: { str: 4, end: 5, agi: 3, kek: 2 },
  veteran: { str: 7, end: 8, agi: 5, kek: 4 },
  champion: { str: 11, end: 10, agi: 8, kek: 6 },
  legend: { str: 16, end: 14, agi: 12, kek: 10 },
  maximus: { str: 24, end: 20, agi: 18, kek: 16 },
};

export const ARENA_STAGE_COUNT = 20;

export function arenaBossMaxHp(stage: number): number {
  return Math.floor(40 + stage * stage * 6);
}

export function arenaStageReward(stage: number): number {
  return 15 + stage * 8;
}