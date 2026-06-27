export type RoomType =
  | "barracks"
  | "kitchen"
  | "sword_pit"
  | "arena_gate"
  | "heralds_post"
  | "treasury";

export type Rarity = "recruit" | "veteran" | "champion" | "legend" | "maximus";
export type ExpeditionMissionId = "mission_30m" | "mission_2h" | "mission_8h";

export interface Room {
  id: string;
  type: RoomType;
  level: number;
  slot: number;
  assignedGladiatorId: string | null;
}

export interface Gladiator {
  id: string;
  name: string;
  rarity: Rarity;
  level: number;
  str: number;
  end: number;
  agi: number;
  kek: number;
}

export interface Expedition {
  id: string;
  missionId: ExpeditionMissionId;
  gladiatorId: string;
  startedAt: number;
  endsAt: number;
  claimed: boolean;
}

export interface GameState {
  drachma: number;
  bread: number;
  hype: number;
  shards: number;
  populationCap: number;
  arenaStage: number;
  arenaBossHp: number;
  pendingArenaDrachma: number;
  lastTickAt: number;
  lastDailyAt: number | null;
  incidentActive: boolean;
  rooms: Room[];
  gladiators: Gladiator[];
  expeditions: Expedition[];
}

export interface PlayerRecord {
  telegramId: number;
  username: string | null;
  firstName: string;
  state: GameState;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse {
  ok: boolean;
  player?: PlayerRecord;
  error?: string;
}