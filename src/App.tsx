import { useEffect, useState } from "react";
import { DevBanner } from "./components/DevBanner";
import { TapArena } from "./components/TapArena";
import { UpgradePanel } from "./components/UpgradePanel";
import { initTelegramApp, isDevMock, type GameUser } from "./lib/telegram";
import { useGameStore } from "./store/gameStore";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<GameUser | null>(null);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    setUser(initTelegramApp());
  }, []);

  useEffect(() => {
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <div className="app">
      <header className="hero">
        {isDevMock() && <DevBanner />}
        <p className="eyebrow">Kekius Maximus</p>
        <h1>Telegram Lily Pad</h1>
        <p className="subtitle">
          {user
            ? `Salve, ${user.firstName}${user.username ? ` (@${user.username})` : ""}`
            : "Connecting to Telegram..."}
        </p>
      </header>

      <TapArena />
      <UpgradePanel />

      <footer className="footer">
        <span>Maximus ascends on the chain</span>
      </footer>
    </div>
  );
}