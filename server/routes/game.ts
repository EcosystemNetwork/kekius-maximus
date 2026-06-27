import { Router } from "express";
import { parseInitData, validateInitData } from "../auth.js";
import {
  applyIdleTick,
  assignGladiator,
  buildRoom,
  claimArena,
  claimDaily,
  claimExpedition,
  createPlayer,
  mergeRoom,
  recruitGladiator,
  resolveIncident,
  startExpedition,
} from "../game/logic.js";
import type { ExpeditionMissionId, RoomType } from "../game/types.js";
import { getPlayer, savePlayer } from "../db.js";

const router = Router();
const botToken = process.env.BOT_TOKEN;

function requireUser(initData: unknown) {
  if (typeof initData !== "string" || !initData) {
    throw new Error("Missing initData");
  }
  if (!validateInitData(initData, botToken)) {
    throw new Error("Invalid Telegram auth");
  }
  const user = parseInitData(initData);
  if (!user) throw new Error("Invalid Telegram user");
  return user;
}

function loadOrCreate(initData: string) {
  const user = requireUser(initData);
  let player = getPlayer(user.id);
  if (!player) {
    player = createPlayer(user);
    savePlayer(player);
  }
  player.state = applyIdleTick(player.state);
  player.updatedAt = Date.now();
  return player;
}

function commit(player: ReturnType<typeof loadOrCreate>) {
  savePlayer(player);
  return player;
}

router.post("/sync", (req, res) => {
  try {
    const player = commit(loadOrCreate(req.body.initData));
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/assign", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = assignGladiator(player.state, req.body.gladiatorId, req.body.roomId ?? null);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/build-room", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = buildRoom(player.state, req.body.type as RoomType, Number(req.body.slot));
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/merge-room", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = mergeRoom(player.state, req.body.roomId);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/arena/claim", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = claimArena(player.state);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/daily", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = claimDaily(player.state);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/recruit", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = recruitGladiator(player.state);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/expedition/start", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = startExpedition(
      player.state,
      req.body.missionId as ExpeditionMissionId,
      req.body.gladiatorId,
    );
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/expedition/claim", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = claimExpedition(player.state, req.body.expeditionId);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

router.post("/incident/resolve", (req, res) => {
  try {
    const player = loadOrCreate(req.body.initData);
    player.state = resolveIncident(player.state);
    commit(player);
    res.json({ ok: true, player });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

export default router;