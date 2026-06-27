import type { GameState } from "../api/types";

export function ResourceBar({ state }: { state: GameState }) {
  return (
    <div className="resource-bar">
      <span>🪙 {Math.floor(state.drachma)}</span>
      <span>🍞 {Math.floor(state.bread)}</span>
      <span>🔥 {Math.floor(state.hype)}</span>
      <span>💎 {Math.floor(state.shards)}</span>
    </div>
  );
}