import { randomBytes } from "node:crypto";
import {
  ARENA_STAGE_COUNT,
  EXPEDITION_DEFS,
  MAX_ROOM_SLOTS,
  OFFLINE_CAP_MS,
  RARITY_BASE,
  RARITY_ORDER,
  ROOM_DEFS,
  arenaBossMaxHp,
  arenaStageReward,
} from "./constants.js";
import type {
  Expedition,
  ExpeditionMissionId,
  GameState,
  Gladiator,
  PlayerRecord,
  Rarity,
  Room,
  RoomType,
  TelegramUser,
} from "./types.js";

function id(): string {
  return randomBytes(6).toString("hex");
}

function starterGladiator(): Gladiator {
  return {
    id: id(),
    name: "Crixus Kek",
    rarity: "recruit",
    level: 1,
    ...RARITY_BASE.recruit,
  };
}

function starterRooms(): Room[] {
  return [
    { id: id(), type: "treasury", level: 1, slot: 0, assignedGladiatorId: null },
    { id: id(), type: "kitchen", level: 1, slot: 1, assignedGladiatorId: null },
    { id: id(), type: "barracks", level: 1, slot: 2, assignedGladiatorId: null },
    { id: id(), type: "sword_pit", level: 1, slot: 3, assignedGladiatorId: null },
  ];
}

export function createInitialState(): GameState {
  return {
    drachma: 250,
    bread: 120,
    hype: 0,
    shards: 0,
    populationCap: 6,
    arenaStage: 1,
    arenaBossHp: arenaBossMaxHp(1),
    pendingArenaDrachma: 0,
    lastTickAt: Date.now(),
    lastDailyAt: null,
    incidentActive: false,
    rooms: starterRooms(),
    gladiators: [starterGladiator()],
    expeditions: [],
  };
}

export function createPlayer(user: TelegramUser): PlayerRecord {
  const now = Date.now();
  return {
    telegramId: user.id,
    username: user.username ?? null,
    firstName: user.first_name,
    state: createInitialState(),
    createdAt: now,
    updatedAt: now,
  };
}

function populationCap(state: GameState): number {
  const barracks = state.rooms.filter((r) => r.type === "barracks");
  return 4 + barracks.reduce((sum, room) => sum + room.level * 2, 0);
}

export function totalDps(gladiators: Gladiator[]): number {
  return gladiators.reduce((sum, g) => {
    const rarityMult = 1 + RARITY_ORDER.indexOf(g.rarity) * 0.25;
    return sum + g.str * 1.4 + g.agi * 0.6 + g.level * 2 * rarityMult;
  }, 0);
}

function roomProduction(room: Room, seconds: number): Partial<Pick<GameState, "drachma" | "bread" | "hype">> {
  const level = room.level;
  switch (room.type) {
    case "treasury":
      return { drachma: (3 + level * 2) * seconds };
    case "kitchen":
      return { bread: (2 + level * 1.5) * seconds };
    case "arena_gate":
      return { hype: (0.2 + level * 0.15) * seconds };
    default:
      return {};
  }
}

function trainAssigned(room: Room, gladiator: Gladiator | undefined, seconds: number): Gladiator | undefined {
  if (!gladiator || room.type !== "sword_pit") return gladiator;
  const gain = seconds * (0.08 + room.level * 0.05);
  return { ...gladiator, str: Math.round((gladiator.str + gain) * 100) / 100 };
}

function runArena(state: GameState, seconds: number): GameState {
  let dps = totalDps(state.gladiators) / 10;
  const arenaGate = state.rooms.find((r) => r.type === "arena_gate");
  if (arenaGate) dps *= 1 + arenaGate.level * 0.08;

  let damage = dps * seconds;
  let stage = state.arenaStage;
  let bossHp = state.arenaBossHp;
  let drachma = state.pendingArenaDrachma;
  let hype = state.hype;

  while (damage > 0 && stage <= ARENA_STAGE_COUNT) {
    if (damage >= bossHp) {
      damage -= bossHp;
      drachma += arenaStageReward(stage);
      hype += 2 + Math.floor(stage / 3);
      stage += 1;
      bossHp = stage > ARENA_STAGE_COUNT ? 0 : arenaBossMaxHp(stage);
    } else {
      bossHp -= damage;
      damage = 0;
    }
  }

  return {
    ...state,
    arenaStage: Math.min(stage, ARENA_STAGE_COUNT),
    arenaBossHp: bossHp,
    pendingArenaDrachma: drachma,
    hype: Math.floor(hype),
  };
}

export function applyIdleTick(state: GameState, now = Date.now()): GameState {
  const elapsed = Math.min(Math.max(0, now - state.lastTickAt), OFFLINE_CAP_MS);
  if (elapsed < 1000) return state;

  const seconds = elapsed / 1000;
  let next: GameState = { ...state, lastTickAt: now };

  for (const room of next.rooms) {
    const produced = roomProduction(room, seconds);
    next.drachma += produced.drachma ?? 0;
    next.bread += produced.bread ?? 0;
    next.hype += produced.hype ?? 0;

    if (room.assignedGladiatorId) {
      const idx = next.gladiators.findIndex((g) => g.id === room.assignedGladiatorId);
      if (idx >= 0) {
        const trained = trainAssigned(room, next.gladiators[idx], seconds);
        if (trained) {
          const gladiators = [...next.gladiators];
          gladiators[idx] = trained;
          next = { ...next, gladiators };
        }
      }
    }
  }

  next = runArena(next, seconds);
  next.populationCap = populationCap(next);

  if (!next.incidentActive && Math.random() < 0.02) {
    next.incidentActive = true;
    next.hype = Math.max(0, next.hype - 5);
  }

  return next;
}

export function assignGladiator(state: GameState, gladiatorId: string, roomId: string | null): GameState {
  const gladiators = state.gladiators.map((g) => {
    if (g.id === gladiatorId) return g;
    return g;
  });

  const rooms = state.rooms.map((room) => {
    if (room.id === roomId) {
      return { ...room, assignedGladiatorId: gladiatorId };
    }
    if (room.assignedGladiatorId === gladiatorId) {
      return { ...room, assignedGladiatorId: null };
    }
    return room;
  });

  return { ...state, rooms, gladiators };
}

export function buildRoom(state: GameState, type: RoomType, slot: number): GameState {
  if (slot < 0 || slot >= MAX_ROOM_SLOTS) throw new Error("Invalid slot");
  if (state.rooms.some((r) => r.slot === slot)) throw new Error("Slot occupied");

  const cost = ROOM_DEFS[type].buildCost;
  if (state.drachma < cost) throw new Error("Not enough Drachma");

  const room: Room = { id: id(), type, level: 1, slot, assignedGladiatorId: null };
  const next = {
    ...state,
    drachma: state.drachma - cost,
    rooms: [...state.rooms, room],
  };
  next.populationCap = populationCap(next);
  return next;
}

export function mergeRoom(state: GameState, roomId: string): GameState {
  const room = state.rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");

  const twin = state.rooms.find(
    (r) => r.id !== roomId && r.type === room.type && r.level === room.level,
  );
  if (!twin) throw new Error("No matching room to merge");

  const merged: Room = {
    ...room,
    level: room.level + 1,
    assignedGladiatorId: room.assignedGladiatorId ?? twin.assignedGladiatorId,
  };

  const rooms = state.rooms
    .filter((r) => r.id !== roomId && r.id !== twin.id)
    .concat(merged);

  return { ...state, rooms };
}

export function claimArena(state: GameState): GameState {
  return {
    ...state,
    drachma: state.drachma + state.pendingArenaDrachma,
    pendingArenaDrachma: 0,
  };
}

export function claimDaily(state: GameState, now = Date.now()): GameState {
  if (state.lastDailyAt && now - state.lastDailyAt < 24 * 60 * 60 * 1000) {
    throw new Error("Daily already claimed");
  }
  return {
    ...state,
    drachma: state.drachma + 100,
    bread: state.bread + 50,
    hype: state.hype + 10,
    lastDailyAt: now,
  };
}

export function recruitGladiator(state: GameState): GameState {
  if (!state.rooms.some((r) => r.type === "heralds_post")) {
    throw new Error("Build Herald's Post first");
  }
  if (state.gladiators.length >= state.populationCap) {
    throw new Error("Barracks full");
  }
  if (state.drachma < 200) throw new Error("Not enough Drachma");

  const roll = Math.random();
  const rarity: Rarity =
    roll > 0.97 ? "maximus" : roll > 0.88 ? "legend" : roll > 0.7 ? "champion" : roll > 0.4 ? "veteran" : "recruit";

  const gladiator: Gladiator = {
    id: id(),
    name: `Gladiator ${state.gladiators.length + 1}`,
    rarity,
    level: 1,
    ...RARITY_BASE[rarity],
  };

  return {
    ...state,
    drachma: state.drachma - 200,
    gladiators: [...state.gladiators, gladiator],
  };
}

export function startExpedition(
  state: GameState,
  missionId: ExpeditionMissionId,
  gladiatorId: string,
  now = Date.now(),
): GameState {
  const mission = EXPEDITION_DEFS[missionId];
  const gladiator = state.gladiators.find((g) => g.id === gladiatorId);
  if (!gladiator) throw new Error("Gladiator not found");
  if (gladiator.end < mission.minEnd) throw new Error("Gladiator too weak");

  const active = state.expeditions.find((e) => e.gladiatorId === gladiatorId && !e.claimed);
  if (active) throw new Error("Gladiator already on expedition");

  const expedition: Expedition = {
    id: id(),
    missionId,
    gladiatorId,
    startedAt: now,
    endsAt: now + mission.durationMs,
    claimed: false,
  };

  return { ...state, expeditions: [...state.expeditions, expedition] };
}

export function claimExpedition(state: GameState, expeditionId: string, now = Date.now()): GameState {
  const expedition = state.expeditions.find((e) => e.id === expeditionId);
  if (!expedition) throw new Error("Expedition not found");
  if (expedition.claimed) throw new Error("Already claimed");
  if (now < expedition.endsAt) throw new Error("Expedition not finished");

  const reward = EXPEDITION_DEFS[expedition.missionId].shardReward;
  return {
    ...state,
    shards: state.shards + reward,
    expeditions: state.expeditions.map((e) =>
      e.id === expeditionId ? { ...e, claimed: true } : e,
    ),
  };
}

export function resolveIncident(state: GameState): GameState {
  if (!state.incidentActive) throw new Error("No active incident");
  if (state.bread < 20) throw new Error("Need 20 Bread");
  return {
    ...state,
    bread: state.bread - 20,
    incidentActive: false,
    hype: state.hype + 5,
  };
}