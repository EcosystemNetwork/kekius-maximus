import { hapticUpgrade } from "../lib/telegram";
import { getUpgradeCost, useGameStore, type UpgradeId } from "../store/gameStore";

const ORDER: UpgradeId[] = ["autoRibbit", "kekJuice", "romanShield"];

export function UpgradePanel() {
  const kek = useGameStore((s) => s.kek);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <section className="upgrade-panel">
      <h2>Legion Upgrades</h2>
      <div className="upgrade-list">
        {ORDER.map((id) => {
          const upgrade = upgrades[id];
          const cost = getUpgradeCost(id);
          const affordable = kek >= cost;

          return (
            <button
              key={id}
              type="button"
              className={`upgrade-card ${affordable ? "" : "locked"}`}
              onClick={() => {
                if (buyUpgrade(id)) hapticUpgrade();
              }}
            >
              <div>
                <strong>{upgrade.name}</strong>
                <p>{upgrade.description}</p>
              </div>
              <div className="upgrade-meta">
                <span>Lv {upgrade.level}</span>
                <span>{cost} KEK</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}