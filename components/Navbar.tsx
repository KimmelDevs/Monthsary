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
  onEditProfile: () => void;
}

export default function Navbar({ active, onChange, name2, onEditProfile }: Props) {
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
      <button
        onClick={onEditProfile}
        className="font-display text-xl mr-auto py-3 pr-4 transition-opacity hover:opacity-70"
        style={{ color: "var(--wine)", fontStyle: "italic", fontWeight: 600, letterSpacing: "0.01em", background: "none", border: "none", cursor: "pointer" }}
      >
        our <span style={{ color: "var(--gold)" }}>monthsary</span>
        {name2 && <span className="text-sm font-sans not-italic ml-2" style={{ color: "var(--muted)", fontWeight: 400 }}>with {name2}</span>}
      </button>

      <div className="flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="text-xs font-medium uppercase tracking-widest py-4 px-3 border-b-2 transition-all"
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
      </div>
    </nav>
  );
}
