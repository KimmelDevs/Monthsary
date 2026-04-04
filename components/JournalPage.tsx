"use client";

import { useState, useEffect } from "react";
import { addJournalEntry, getJournalEntries, deleteJournalEntry, JournalEntry } from "@/lib/db";

const PROMPTS = [
  { key: "best", icon: "✨", label: "Best Moment" },
  { key: "funny", icon: "😂", label: "Funniest Moment" },
  { key: "newThing", icon: "🌱", label: "New Thing We Tried" },
  { key: "note", icon: "💭", label: "Note to Future Us" },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ month: "", best: "", funny: "", newThing: "", note: "" });

  useEffect(() => {
    getJournalEntries().then((d) => { setEntries(d); setFetching(false); });
  }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.month) { alert("Please add a month label"); return; }
    setLoading(true);
    try {
      await addJournalEntry(form);
      const data = await getJournalEntries();
      setEntries(data);
      setOpen(false);
      setForm({ month: "", best: "", funny: "", newThing: "", note: "" });
    } catch (err) {
      console.error(err); alert("Error saving entry.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this journal entry?")) return;
    await deleteJournalEntry(id);
    setEntries((e) => e.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <h2 className="font-display text-4xl font-light" style={{ color: "var(--wine)" }}>
          This Month <em>in Us</em>
        </h2>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ New Entry</button>
      </div>

      {fetching ? (
        <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>Loading journal...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">📔</div>
          <h3 className="font-display text-2xl mb-2" style={{ color: "var(--wine)" }}>No entries yet</h3>
          <p className="text-sm">Capture what made this month special.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
          {entries.map((e) => (
            <div key={e.id} className="card p-5 group animate-fade-up" style={{ boxShadow: "0 4px 20px rgba(201,112,110,0.07)" }}>
              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="font-display text-xl font-semibold" style={{ color: "var(--wine)" }}>✨ {e.month}</div>
                <button
                  onClick={() => remove(e.id!)}
                  className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg transition-all"
                  style={{ color: "var(--muted)", background: "var(--soft)" }}
                >
                  Delete
                </button>
              </div>
              {PROMPTS.map(({ key, icon, label }) => {
                const val = e[key as keyof JournalEntry] as string;
                if (!val) return null;
                return (
                  <div key={key} className="mb-3">
                    <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>
                      {icon} {label}
                    </div>
                    <div className="font-display text-base italic leading-relaxed" style={{ color: "var(--text)" }}>{val}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(42,26,26,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-3xl p-7 animate-fade-up overflow-y-auto max-h-[90vh]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="font-display text-2xl mb-5" style={{ color: "var(--wine)" }}>This Month in Us 📔</h3>

            <div className="mb-3">
              <label className="label">Month</label>
              <input name="month" type="text" placeholder="e.g. May 2025" value={form.month} onChange={handle} className="input-field" />
            </div>

            {PROMPTS.map(({ key, icon, label }) => (
              <div key={key} className="mb-3">
                <label className="label">{icon} {label}</label>
                <textarea
                  name={key}
                  placeholder={
                    key === "best" ? "The best thing that happened..." :
                    key === "funny" ? "That one time we laughed about..." :
                    key === "newThing" ? "We tried something new..." :
                    "Hey future us..."
                  }
                  value={form[key as keyof typeof form]}
                  onChange={handle}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            ))}

            <div className="flex gap-3 mt-5">
              <button className="flex-1 rounded-xl py-3 text-sm font-medium" style={{ background: "var(--soft)", border: "1px solid var(--border)", color: "var(--muted)" }} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary flex-[2]" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Save Entry 📔"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
