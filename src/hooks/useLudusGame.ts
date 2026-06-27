import { useCallback, useEffect, useState } from "react";
import { gameApi } from "../api/client";
import type { ExpeditionMissionId, PlayerRecord, RoomType } from "../api/types";

export function useLudusGame() {
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T>(fn: () => Promise<T>) => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const sync = useCallback(async () => {
    const res = await run(() => gameApi.sync());
    if (res.player) setPlayer(res.player);
  }, [run]);

  useEffect(() => {
    sync()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [sync]);

  useEffect(() => {
    const id = window.setInterval(() => {
      sync().catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(id);
  }, [sync]);

  const actions = {
    assign: (gladiatorId: string, roomId: string | null) =>
      run(async () => {
        const res = await gameApi.assign(gladiatorId, roomId);
        if (res.player) setPlayer(res.player);
      }),
    buildRoom: (type: RoomType, slot: number) =>
      run(async () => {
        const res = await gameApi.buildRoom(type, slot);
        if (res.player) setPlayer(res.player);
      }),
    mergeRoom: (roomId: string) =>
      run(async () => {
        const res = await gameApi.mergeRoom(roomId);
        if (res.player) setPlayer(res.player);
      }),
    claimArena: () =>
      run(async () => {
        const res = await gameApi.claimArena();
        if (res.player) setPlayer(res.player);
      }),
    claimDaily: () =>
      run(async () => {
        const res = await gameApi.claimDaily();
        if (res.player) setPlayer(res.player);
      }),
    recruit: () =>
      run(async () => {
        const res = await gameApi.recruit();
        if (res.player) setPlayer(res.player);
      }),
    startExpedition: (missionId: ExpeditionMissionId, gladiatorId: string) =>
      run(async () => {
        const res = await gameApi.startExpedition(missionId, gladiatorId);
        if (res.player) setPlayer(res.player);
      }),
    claimExpedition: (expeditionId: string) =>
      run(async () => {
        const res = await gameApi.claimExpedition(expeditionId);
        if (res.player) setPlayer(res.player);
      }),
    resolveIncident: () =>
      run(async () => {
        const res = await gameApi.resolveIncident();
        if (res.player) setPlayer(res.player);
      }),
    refresh: sync,
  };

  return { player, loading, error, busy, actions };
}