import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UpgradeId = "autoRibbit" | "kekJuice" | "romanShield";

type Upgrade = {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  power: number;
  level: number;
};

type GameState = {
  kek: number;
  totalTaps: number;
  energy: number;
  maxEnergy: number;
  upgrades: Record<UpgradeId, Upgrade>;
  tap: () => void;
  tick: () => void;
  buyUpgrade: (id: UpgradeId) => boolean;
  passivePerSecond: () => number;
  tapPower: () => number;
};

const UPGRADE_DEFS: Record<UpgradeId, Omit<Upgrade, "level">> = {
  autoRibbit: {
    id: "autoRibbit",
    name: "Auto Ribbit",
    description: "+1 KEK/sec per level",
    baseCost: 25,
    power: 1,
  },
  kekJuice: {
    id: "kekJuice",
    name: "KEK Juice",
    description: "+2 tap power per level",
    baseCost: 40,
    power: 2,
  },
  romanShield: {
    id: "romanShield",
    name: "Roman Shield",
    description: "+20 max energy per level",
    baseCost: 60,
    power: 20,
  },
};

function upgradeCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.baseCost * Math.pow(1.55, upgrade.level));
}

function initialUpgrades(): Record<UpgradeId, Upgrade> {
  return Object.fromEntries(
    Object.values(UPGRADE_DEFS).map((def) => [def.id, { ...def, level: 0 }]),
  ) as Record<UpgradeId, Upgrade>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      kek: 0,
      totalTaps: 0,
      energy: 100,
      maxEnergy: 100,
      upgrades: initialUpgrades(),

      tapPower: () => 1 + get().upgrades.kekJuice.level * get().upgrades.kekJuice.power,

      passivePerSecond: () =>
        get().upgrades.autoRibbit.level * get().upgrades.autoRibbit.power,

      tap: () => {
        const state = get();
        if (state.energy <= 0) return;

        const gain = state.tapPower();
        set({
          kek: state.kek + gain,
          totalTaps: state.totalTaps + 1,
          energy: Math.max(0, state.energy - 1),
        });
      },

      tick: () => {
        const state = get();
        const passive = state.passivePerSecond();
        const regen = Math.min(state.maxEnergy, state.energy + 1);

        set({
          kek: state.kek + passive / 10,
          energy: regen,
        });
      },

      buyUpgrade: (id) => {
        const state = get();
        const upgrade = state.upgrades[id];
        const cost = upgradeCost(upgrade);
        if (state.kek < cost) return false;

        const next = { ...upgrade, level: upgrade.level + 1 };
        const upgrades = { ...state.upgrades, [id]: next };
        const maxEnergy =
          id === "romanShield"
            ? state.maxEnergy + upgrade.power
            : state.maxEnergy;

        set({
          kek: state.kek - cost,
          upgrades,
          maxEnergy,
          energy: id === "romanShield" ? Math.min(maxEnergy, state.energy + upgrade.power) : state.energy,
        });
        return true;
      },
    }),
    { name: "kekius-maximus-save" },
  ),
);

export function getUpgradeCost(id: UpgradeId): number {
  const upgrade = useGameStore.getState().upgrades[id];
  return upgradeCost(upgrade);
}