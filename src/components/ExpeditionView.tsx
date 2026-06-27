import type { Expedition, ExpeditionMissionId, Gladiator } from "../api/types";
import { EXPEDITION_META } from "../game/meta";

type Props = {
  gladiators: Gladiator[];
  expeditions: Expedition[];
  busy: boolean;
  onStart: (missionId: ExpeditionMissionId, gladiatorId: string) => void;
  onClaim: (expeditionId: string) => void;
};

export function ExpeditionView({ gladiators, expeditions, busy, onStart, onClaim }: Props) {
  const now = Date.now();
  const lead = gladiators[0];

  return (
    <section className="panel expedition-panel">
      <h2>Provinciae Expeditions</h2>
      <p className="panel-copy">Send gladiators on timed missions for shard loot.</p>

      <div className="mission-list">
        {(Object.keys(EXPEDITION_META) as ExpeditionMissionId[]).map((missionId) => {
          const mission = EXPEDITION_META[missionId];
          return (
            <div key={missionId} className="mission-card">
              <strong>{mission.label}</strong>
              <p>
                {mission.duration} · {mission.reward} shards · needs END {mission.minEnd}
              </p>
              {lead && (
                <button
                  type="button"
                  disabled={busy || lead.end < mission.minEnd}
                  onClick={() => onStart(missionId, lead.id)}
                >
                  Send {lead.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="active-expeditions">
        <h3>Active</h3>
        {expeditions.filter((e) => !e.claimed).length === 0 && <p>No active expeditions.</p>}
        {expeditions
          .filter((e) => !e.claimed)
          .map((expedition) => {
            const done = now >= expedition.endsAt;
            const gladiator = gladiators.find((g) => g.id === expedition.gladiatorId);
            return (
              <div key={expedition.id} className="mission-card">
                <strong>{gladiator?.name ?? "Unknown"}</strong>
                <p>{EXPEDITION_META[expedition.missionId].label}</p>
                <p>{done ? "Complete" : `Ends ${new Date(expedition.endsAt).toLocaleTimeString()}`}</p>
                <button type="button" disabled={busy || !done} onClick={() => onClaim(expedition.id)}>
                  Claim Shards
                </button>
              </div>
            );
          })}
      </div>
    </section>
  );
}