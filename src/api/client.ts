import WebApp from "@twa-dev/sdk";
import type { ApiResponse, ExpeditionMissionId, RoomType } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function initData(): string {
  return WebApp.initData || "";
}

async function post<T extends ApiResponse>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: initData(), ...body }),
  });
  const data = (await res.json()) as T;
  if (!data.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export const gameApi = {
  sync: () => post<ApiResponse>("/api/game/sync", {}),
  assign: (gladiatorId: string, roomId: string | null) =>
    post<ApiResponse>("/api/game/assign", { gladiatorId, roomId }),
  buildRoom: (type: RoomType, slot: number) =>
    post<ApiResponse>("/api/game/build-room", { type, slot }),
  mergeRoom: (roomId: string) => post<ApiResponse>("/api/game/merge-room", { roomId }),
  claimArena: () => post<ApiResponse>("/api/game/arena/claim", {}),
  claimDaily: () => post<ApiResponse>("/api/game/daily", {}),
  recruit: () => post<ApiResponse>("/api/game/recruit", {}),
  startExpedition: (missionId: ExpeditionMissionId, gladiatorId: string) =>
    post<ApiResponse>("/api/game/expedition/start", { missionId, gladiatorId }),
  claimExpedition: (expeditionId: string) =>
    post<ApiResponse>("/api/game/expedition/claim", { expeditionId }),
  resolveIncident: () => post<ApiResponse>("/api/game/incident/resolve", {}),
};