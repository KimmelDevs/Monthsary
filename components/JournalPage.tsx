"use client";

import { useState, useEffect } from "react";
import { addJournalEntry, getJournalEntries, deleteJournalEntry, JournalEntry } from "@/lib/db";

const PROMPTS = [
  { key: "best",     icon: "✨", label: "Best Moment",         placeholder: "The best thing that happened..." },
  { key: "funny",    icon: "😂", label: "Funniest Moment",     placeholder: "That one time we laughed about..." },
  { key: "newThing", icon: "🌱", label: "New Thing We Tried",  placeholder: "We tried something new..." },
  { key: "note",     icon: "💭", label: "Note to Future Us",   placeholder: "Hey future us..." },
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .jn-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(160deg, #fff0f5 0%, #ffd6e4 50%, #ffb3cc 100%);
          padding: 2rem 1rem 4rem;
          position: relative; overflow: hidden;
        }
        .jn-page::before {
          content: '♡';
          position: fixed; top: -60px; right: -40px;
          font-size: 320px; color: rgba(255,182,210,0.2);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .jn-page::after {
          content: '♡';
          position: fixed; bottom: -80px; left: -60px;
          font-size: 240px; color: rgba(255,150,190,0.12);
          pointer-events: none; line-height: 1; font-family: serif;
        }

        .jn-wrap { max-width: 760px; margin: 0 auto; }

        .jn-header {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap;
          gap: 1rem; margin-bottom: 2rem;
        }
        .jn-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300; color: #b5175e;
        }
        .jn-add-btn {
          background: linear-gradient(135deg, #ff85b3, #f04090);
          color: white; border: none; border-radius: 12px;
          padding: 0.65rem 1.3rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.3);
          transition: opacity 0.2s, transform 0.1s;
        }
        .jn-add-btn:hover { opacity: 0.88; }
        .jn-add-btn:active { transform: scale(0.97); }

        /* Grid */
        .jn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* Journal card — looks like a notebook page */
        .jn-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,180,210,0.45);
          border-radius: 4px 20px 20px 4px;
          padding: 0;
          box-shadow: 0 6px 28px rgba(220,80,130,0.1);
          overflow: hidden;
          animation: fadeUp 0.35s ease forwards;
          position: relative;
        }

        /* Pink spine on left like a notebook */
        .jn-card::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 8px;
          background: linear-gradient(to bottom, #ff85b3, #f04090);
        }

        /* Ruled lines feel */
        .jn-card-inner {
          padding: 1.4rem 1.4rem 1.2rem 1.6rem;
        }

        .jn-card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-bottom: 0.7rem;
          margin-bottom: 0.9rem;
          border-bottom: 1.5px solid rgba(255,180,210,0.4);
        }
        .jn-card-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 600; color: #b5175e;
        }
        .jn-delete-btn {
          opacity: 0; font-size: 0.68rem;
          padding: 0.2rem 0.55rem; border-radius: 7px;
          background: rgba(255,180,210,0.3); border: none;
          color: #d4669a; cursor: pointer; transition: opacity 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .jn-card:hover .jn-delete-btn { opacity: 1; }

        .jn-prompt { margin-bottom: 0.85rem; }
        .jn-prompt:last-child { margin-bottom: 0; }
        .jn-prompt-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem; font-weight: 500;
          color: #f04090; text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 0.2rem;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .jn-prompt-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 0.98rem;
          color: #5a2040; line-height: 1.65;
        }

        /* Ruled line between prompts */
        .jn-rule {
          height: 1px;
          background: rgba(255,180,210,0.25);
          margin: 0.75rem 0;
        }

        /* Modal */
        .jn-overlay {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          background: rgba(180,20,80,0.22); backdrop-filter: blur(8px);
        }
        .jn-modal {
          width: 100%; max-width: 460px;
          background: rgba(255,245,250,0.97);
          border: 1px solid rgba(255,180,210,0.55);
          border-radius: 28px; padding: 2rem;
          overflow-y: auto; max-height: 92vh;
          box-shadow: 0 28px 64px rgba(220,80,130,0.22);
          animation: fadeUp 0.3s ease;
        }
        .jn-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem; color: #b5175e; margin-bottom: 1.3rem;
        }
        .jn-label {
          display: block; font-size: 0.67rem; font-weight: 500;
          color: #d4669a; margin-bottom: 0.3rem;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .jn-input {
          width: 100%; background: rgba(255,200,225,0.18);
          border: 1px solid rgba(255,180,210,0.45);
          border-radius: 10px; padding: 0.65rem 0.9rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          color: #5a2040; outline: none; box-sizing: border-box;
          transition: border-color 0.2s; resize: none;
        }
        .jn-input:focus { border-color: #f04090; }
        .jn-input::placeholder { color: #d4a0bc; }

        .jn-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.4rem; }
        .jn-cancel {
          flex: 1; border-radius: 12px; padding: 0.75rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          background: rgba(255,200,225,0.2); border: 1px solid rgba(255,180,210,0.35);
          color: #d4669a; cursor: pointer;
        }
        .jn-save {
          flex: 2; border-radius: 12px; padding: 0.75rem;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          border: none; color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.28);
        }
        .jn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .jn-empty { text-align: center; padding: 5rem 1rem; color: #d4669a; }
        .jn-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .jn-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; color: #b5175e; margin-bottom: 0.4rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="jn-page">
        <div className="jn-wrap">
          <div className="jn-header">
            <h2 className="jn-title">This Month <em>in Us</em></h2>
            <button className="jn-add-btn" onClick={() => setOpen(true)}>+ New Entry</button>
          </div>

          {fetching ? (
            <p style={{ textAlign: "center", padding: "4rem", color: "#d4669a", fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" }}>
              Loading journal...
            </p>
          ) : entries.length === 0 ? (
            <div className="jn-empty">
              <div className="jn-empty-icon">📔</div>
              <h3>No entries yet</h3>
              <p style={{ fontSize: "0.85rem" }}>Capture what made this month special.</p>
            </div>
          ) : (
            <div className="jn-grid">
              {entries.map((e) => {
                const filled = PROMPTS.filter(p => !!(e[p.key as keyof JournalEntry] as string));
                return (
                  <div key={e.id} className="jn-card">
                    <div className="jn-card-inner">
                      <div className="jn-card-header">
                        <div className="jn-card-month">✨ {e.month}</div>
                        <button className="jn-delete-btn" onClick={() => remove(e.id!)}>Delete</button>
                      </div>
                      {filled.map((p, i) => (
                        <div key={p.key}>
                          <div className="jn-prompt">
                            <div className="jn-prompt-label">
                              <span>{p.icon}</span> {p.label}
                            </div>
                            <div className="jn-prompt-text">
                              {e[p.key as keyof JournalEntry] as string}
                            </div>
                          </div>
                          {i < filled.length - 1 && <div className="jn-rule" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="jn-overlay">
          <div className="jn-modal">
            <h3 className="jn-modal-title">This Month in Us 📔</h3>

            <div style={{ marginBottom: "0.9rem" }}>
              <label className="jn-label">Month</label>
              <input name="month" type="text" placeholder="e.g. May 2025"
                value={form.month} onChange={handle} className="jn-input" />
            </div>

            {PROMPTS.map(({ key, icon, label, placeholder }) => (
              <div key={key} style={{ marginBottom: "0.9rem" }}>
                <label className="jn-label">{icon} {label}</label>
                <textarea name={key} placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={handle} rows={2} className="jn-input" />
              </div>
            ))}

            <div className="jn-modal-actions">
              <button className="jn-cancel" onClick={() => setOpen(false)}>Cancel</button>
              <button className="jn-save" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Save Entry 📔"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}