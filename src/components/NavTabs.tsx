export type TabId = "ludus" | "arena" | "expeditions" | "roster";

export function NavTabs({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "ludus", label: "Ludus" },
    { id: "arena", label: "Arena" },
    { id: "expeditions", label: "Quests" },
    { id: "roster", label: "Fighters" },
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}