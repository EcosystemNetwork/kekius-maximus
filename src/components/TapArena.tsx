import { useCallback, useState } from "react";
import { hapticTap } from "../lib/telegram";
import { useGameStore } from "../store/gameStore";

export function TapArena() {
  const kek = useGameStore((s) => s.kek);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const totalTaps = useGameStore((s) => s.totalTaps);
  const passive = useGameStore((s) => s.passivePerSecond());
  const tap = useGameStore((s) => s.tap);
  const [pulse, setPulse] = useState(false);

  const onTap = useCallback(() => {
    if (energy <= 0) return;
    tap();
    hapticTap();
    setPulse(true);
    window.setTimeout(() => setPulse(false), 120);
  }, [energy, tap]);

  return (
    <section className="tap-arena">
      <div className="stats-row">
        <div className="stat">
          <span className="label">KEK</span>
          <span className="value">{Math.floor(kek).toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">Passive</span>
          <span className="value">+{passive}/s</span>
        </div>
      </div>

      <button
        type="button"
        className={`frog-button ${pulse ? "pulse" : ""} ${energy <= 0 ? "disabled" : ""}`}
        onClick={onTap}
        aria-label="Tap Kekius"
      >
        <span className="frog-emoji" role="img" aria-hidden>
          🐸
        </span>
        <span className="frog-crown">👑</span>
        <span className="tap-label">RIBBIT</span>
      </button>

      <div className="energy-bar">
        <div className="energy-fill" style={{ width: `${(energy / maxEnergy) * 100}%` }} />
      </div>
      <p className="meta">
        Energy {energy}/{maxEnergy} · Taps {totalTaps.toLocaleString()}
      </p>
    </section>
  );
}