import { useEffect, useState } from "react";
import { ArenaView } from "./components/ArenaView";
import { DevBanner } from "./components/DevBanner";
import { ExpeditionView } from "./components/ExpeditionView";
import { GladiatorRoster } from "./components/GladiatorRoster";
import { IncidentBanner } from "./components/IncidentBanner";
import { LudusView } from "./components/LudusView";
import { NavTabs, type TabId } from "./components/NavTabs";
import { ResourceBar } from "./components/ResourceBar";
import { useLudusGame } from "./hooks/useLudusGame";
import { initTelegramApp, isDevMock } from "./lib/telegram";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState<TabId>("ludus");
  const [displayName, setDisplayName] = useState("Lanista");
  const { player, loading, error, busy, actions } = useLudusGame();

  useEffect(() => {
    const user = initTelegramApp();
    if (user) setDisplayName(user.firstName);
  }, []);

  if (loading) {
    return <div className="app loading-screen">Opening the ludus...</div>;
  }

  if (!player) {
    return <div className="app loading-screen">Failed to load ludus.{error ? ` ${error}` : ""}</div>;
  }

  const state = player.state;
  const hasHerald = state.rooms.some((room) => room.type === "heralds_post");

  return (
    <div className="app">
      <header className="hero">
        {isDevMock() && <DevBanner />}
        <p className="eyebrow">Kekius Maximus</p>
        <h1>Ludus Idle</h1>
        <p className="subtitle">Lanista {displayName}</p>
        <ResourceBar state={state} />
      </header>

      {error && <div className="error-banner">{error}</div>}

      {state.incidentActive && (
        <IncidentBanner onResolve={() => actions.resolveIncident()} busy={busy} />
      )}

      <div className="quick-actions">
        <button type="button" disabled={busy} onClick={() => actions.claimDaily()}>
          Daily Kek
        </button>
        <button type="button" disabled={busy} onClick={() => actions.refresh()}>
          Sync
        </button>
      </div>

      <NavTabs active={tab} onChange={setTab} />

      {tab === "ludus" && (
        <LudusView
          state={state}
          busy={busy}
          onAssign={actions.assign}
          onBuild={actions.buildRoom}
          onMerge={actions.mergeRoom}
        />
      )}
      {tab === "arena" && <ArenaView state={state} busy={busy} onClaim={actions.claimArena} />}
      {tab === "expeditions" && (
        <ExpeditionView
          gladiators={state.gladiators}
          expeditions={state.expeditions}
          busy={busy}
          onStart={actions.startExpedition}
          onClaim={actions.claimExpedition}
        />
      )}
      {tab === "roster" && (
        <GladiatorRoster
          gladiators={state.gladiators}
          populationCap={state.populationCap}
          busy={busy}
          canRecruit={hasHerald && state.gladiators.length < state.populationCap && state.drachma >= 200}
          onRecruit={actions.recruit}
        />
      )}
    </div>
  );
}