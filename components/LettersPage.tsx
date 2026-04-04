"use client";

import { useState, useEffect } from "react";
import { addLetter, getLetters, deleteLetter, Letter } from "@/lib/db";

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ month: "", from: "", body: "", lockUntil: "" });

  useEffect(() => {
    getLetters().then((d) => { setLetters(d); setFetching(false); });
  }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.body) { alert("Write something first!"); return; }
    setLoading(true);
    try {
      await addLetter(form);
      const data = await getLetters();
      setLetters(data);
      setOpen(false);
      setForm({ month: "", from: "", body: "", lockUntil: "" });
    } catch (err) {
      console.error(err); alert("Error saving letter.");
    } finally {
      setLoading(false);
    }
  };

  const openLetter = (letter: Letter) => {
    const now = new Date();
    const locked = letter.lockUntil && new Date(letter.lockUntil + "T00:00:00") > now;
    if (locked) {
      alert(`💌 This letter is sealed until ${new Date(letter.lockUntil + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}. Come back then! 🔒`);
      return;
    }
    setReading(letter);
  };

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this letter?")) return;
    await deleteLetter(id);
    setLetters((l) => l.filter((x) => x.id !== id));
  };

  const isLocked = (l: Letter) => !!(l.lockUntil && new Date(l.lockUntil + "T00:00:00") > new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <h2 className="font-display text-4xl font-light" style={{ color: "var(--wine)" }}>
          Love <em>Letter Vault</em>
        </h2>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ Write Letter</button>
      </div>

      {fetching ? (
        <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>Loading letters...</p>
      ) : letters.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">💌</div>
          <h3 className="font-display text-2xl mb-2" style={{ color: "var(--wine)" }}>No letters yet</h3>
          <p className="text-sm">Write a letter — set a lock date for when it can be opened.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
          {letters.map((l) => {
            const locked = isLocked(l);
            return (
              <div
                key={l.id}
                onClick={() => openLetter(l)}
                className="card p-5 cursor-pointer relative overflow-hidden group transition-all hover:-translate-y-1"
                style={{
                  opacity: locked ? 0.75 : 1,
                  boxShadow: "0 4px 20px rgba(201,112,110,0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* fold corner */}
                <div
                  className="absolute top-0 right-0 w-10 h-10"
                  style={{ background: "linear-gradient(135deg,transparent 50%,var(--soft) 50%)" }}
                />

                <div className="absolute top-3 right-3 text-lg">{locked ? "🔒" : "💌"}</div>

                <div className="font-display text-xl font-semibold mb-1" style={{ color: "var(--wine)" }}>{l.month}</div>

                <div
                  className="text-sm leading-relaxed mb-3"
                  style={{
                    color: "var(--muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    filter: locked ? "blur(4px)" : "none",
                    userSelect: locked ? "none" : "auto",
                  }}
                >
                  {locked
                    ? `Sealed until ${new Date(l.lockUntil + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`
                    : l.body}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--blush)" }}>from {l.from || "you"}</span>
                  <button
                    onClick={(e) => remove(l.id!, e)}
                    className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg transition-all"
                    style={{ color: "var(--muted)", background: "var(--soft)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(42,26,26,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-3xl p-7 animate-fade-up overflow-y-auto max-h-[90vh]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="font-display text-2xl mb-5" style={{ color: "var(--wine)" }}>Write a Letter 💌</h3>

            {[
              { label: "Month Label", name: "month", placeholder: "e.g. 4th Monthsary Letter", type: "text" },
              { label: "From", name: "from", placeholder: "Your name", type: "text" },
            ].map((f) => (
              <div key={f.name} className="mb-3">
                <label className="label">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name as keyof typeof form]} onChange={handle} className="input-field" />
              </div>
            ))}

            <div className="mb-3">
              <label className="label">Your Letter</label>
              <textarea name="body" placeholder="Dear love..." value={form.body} onChange={handle} rows={5} className="input-field resize-none" />
            </div>

            <div className="mb-6">
              <label className="label">Lock Until (unlock date)</label>
              <input name="lockUntil" type="date" value={form.lockUntil} onChange={handle} className="input-field" />
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Leave empty to make it available immediately.</p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-xl py-3 text-sm font-medium transition-all" style={{ background: "var(--soft)", border: "1px solid var(--border)", color: "var(--muted)" }} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary flex-[2]" onClick={submit} disabled={loading}>
                {loading ? "Sealing..." : "Seal & Save 💌"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Modal */}
      {reading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(42,26,26,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-3xl p-7 animate-fade-up overflow-y-auto max-h-[90vh]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="font-display text-2xl mb-6" style={{ color: "var(--wine)" }}>{reading.month}</h3>
            <div
              className="font-display text-lg leading-relaxed whitespace-pre-wrap mb-6"
              style={{ fontStyle: "italic", color: "var(--text)" }}
            >
              {reading.body}
            </div>
            <p className="text-xs text-right mb-6" style={{ color: "var(--muted)" }}>
              — written with love, {reading.from || "you"}
            </p>
            <button className="btn-primary w-full" onClick={() => setReading(null)}>Close 💗</button>
          </div>
        </div>
      )}
    </div>
  );
}
