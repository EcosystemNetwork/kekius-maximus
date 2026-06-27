import type { GameState } from "../api/types";
import { arenaBossMaxHp } from "../game/meta";

type Props = {
  state: GameState;
  busy: boolean;
  onClaim: () => void;
};

export function ArenaView({ state, busy, onClaim }: Props) {
  const maxHp = arenaBossMaxHp(state.arenaStage);
  const progress = Math.max(0, ((maxHp - state.arenaBossHp) / maxHp) * 100);

  return (
    <section className="panel arena-panel">
      <h2>Arena Ladder</h2>
      <p className="panel-copy">Your ludus fights automatically while you manage the compound.</p>

      <div className="arena-card">
        <div className="arena-stage">Stage {state.arenaStage} / 20</div>
        <div className="boss-bar">
          <div className="boss-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>
          Boss HP {Math.max(0, Math.floor(state.arenaBossHp))} / {maxHp}
        </p>
        <p>Pending loot: {Math.floor(state.pendingArenaDrachma)} 🪙</p>
        <button type="button" className="primary-btn" disabled={busy || state.pendingArenaDrachma <= 0} onClick={onClaim}>
          Claim Arena Loot
        </button>
      </div>
    </section>
  );
}