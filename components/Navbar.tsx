"use client";

type Tab = "countdown" | "timeline" | "letters" | "journal";

const TABS: { key: Tab; label: string }[] = [
  { key: "countdown", label: "💗 Countdown" },
  { key: "timeline", label: "📸 Timeline" },
  { key: "letters", label: "💌 Letters" },
  { key: "journal", label: "📔 Journal" },
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  name2: string;
  onLogout: () => void;
}

export default function Navbar({ active, onChange, name2, onLogout }: Props) {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center flex-wrap gap-0"
      style={{
        background: "rgba(253,246,238,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 1rem",
      }}
    >
      <div className="font-display text-xl mr-auto py-3 pr-4" style={{ color: "var(--wine)", fontStyle: "italic", fontWeight: 600 }}>
        our <span style={{ color: "var(--gold)" }}>monthsary</span>
        {name2 && <span className="text-sm font-sans not-italic ml-2" style={{ color: "var(--muted)", fontWeight: 400 }}>with {name2}</span>}
      </div>

      <div className="flex items-center">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="text-xs font-medium uppercase tracking-widest py-4 px-3 transition-all"
            style={{
              background: "none",
              border: "none",
              borderBottom: active === t.key ? "2px solid var(--rose)" : "2px solid transparent",
              color: active === t.key ? "var(--wine)" : "var(--muted)",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="ml-3 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: "var(--soft)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
