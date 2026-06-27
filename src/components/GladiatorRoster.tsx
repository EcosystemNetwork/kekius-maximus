import type { Gladiator } from "../api/types";

export function GladiatorRoster({
  gladiators,
  populationCap,
  busy,
  canRecruit,
  onRecruit,
}: {
  gladiators: Gladiator[];
  populationCap: number;
  busy: boolean;
  canRecruit: boolean;
  onRecruit: () => void;
}) {
  return (
    <section className="panel roster-panel">
      <div className="panel-head">
        <h2>Gladiator Pepes</h2>
        <span>
          {gladiators.length}/{populationCap}
        </span>
      </div>

      <div className="roster-list">
        {gladiators.map((g) => (
          <article key={g.id} className={`gladiator-card rarity-${g.rarity}`}>
            <div className="gladiator-top">
              <span className="gladiator-emoji">🐸⚔️</span>
              <div>
                <strong>{g.name}</strong>
                <p>
                  {g.rarity} · Lv {g.level}
                </p>
              </div>
            </div>
            <div className="stat-grid">
              <span>STR {g.str}</span>
              <span>END {g.end}</span>
              <span>AGI {g.agi}</span>
              <span>KEK {g.kek}</span>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="primary-btn" disabled={busy || !canRecruit} onClick={onRecruit}>
        Recruit at Herald's Post (200 🪙)
      </button>
    </section>
  );
}