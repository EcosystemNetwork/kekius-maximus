import type { GameState, RoomType } from "../api/types";
import { ROOM_META } from "../game/meta";

const BUILDABLE: RoomType[] = ["arena_gate", "heralds_post", "kitchen", "sword_pit", "barracks"];

type Props = {
  state: GameState;
  busy: boolean;
  onAssign: (gladiatorId: string, roomId: string | null) => void;
  onBuild: (type: RoomType, slot: number) => void;
  onMerge: (roomId: string) => void;
};

export function LudusView({ state, busy, onAssign, onBuild, onMerge }: Props) {
  const slots = Array.from({ length: 6 }, (_, slot) => state.rooms.find((r) => r.slot === slot) ?? null);
  const selectedGladiator = state.gladiators[0]?.id;

  return (
    <section className="panel ludus-panel">
      <h2>Ludus Floor</h2>
      <p className="panel-copy">Assign fighters to train and produce. Merge matching rooms to upgrade.</p>

      <div className="ludus-strip">
        {slots.map((room, slot) =>
          room ? (
            <div key={room.id} className="room-card">
              <div className="room-head">
                <span>{ROOM_META[room.type].icon}</span>
                <strong>{ROOM_META[room.type].label}</strong>
                <span className="room-level">Lv {room.level}</span>
              </div>
              <p className="room-assign">
                {room.assignedGladiatorId
                  ? state.gladiators.find((g) => g.id === room.assignedGladiatorId)?.name ?? "Assigned"
                  : "Unassigned"}
              </p>
              <div className="room-actions">
                {selectedGladiator && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onAssign(selectedGladiator, room.id)}
                  >
                    Assign
                  </button>
                )}
                <button type="button" disabled={busy} onClick={() => onMerge(room.id)}>
                  Merge
                </button>
              </div>
            </div>
          ) : (
            <div key={`empty-${slot}`} className="room-card empty">
              <span>Empty slot {slot + 1}</span>
              <div className="build-list">
                {BUILDABLE.map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={busy || state.drachma < ROOM_META[type].cost}
                    onClick={() => onBuild(type, slot)}
                  >
                    {ROOM_META[type].icon} {ROOM_META[type].label}
                    {ROOM_META[type].cost > 0 ? ` (${ROOM_META[type].cost})` : ""}
                  </button>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}