export function IncidentBanner({ onResolve, busy }: { onResolve: () => void; busy: boolean }) {
  return (
    <div className="incident-banner">
      <div>
        <strong>Plague of Cringe</strong>
        <p>Morale is dropping. Spend 20 Bread to cleanse the ludus.</p>
      </div>
      <button type="button" onClick={onResolve} disabled={busy}>
        Cleanse
      </button>
    </div>
  );
}