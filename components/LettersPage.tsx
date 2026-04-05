"use client";

import { useState, useEffect } from "react";
import { addLetter, getLetters, deleteLetter, Letter } from "@/lib/db";

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<Letter | null>(null);
  const [envelopeState, setEnvelopeState] = useState<"idle" | "opening" | "opened">("idle");
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
      alert(`💌 Sealed until ${new Date(letter.lockUntil + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}. Come back then! 🔒`);
      return;
    }
    setReading(letter);
    setEnvelopeState("idle");
    // trigger open animation after mount
    setTimeout(() => setEnvelopeState("opening"), 50);
    setTimeout(() => setEnvelopeState("opened"), 1200);
  };

  const closeLetter = () => {
    setEnvelopeState("idle");
    setTimeout(() => setReading(null), 300);
  };

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this letter?")) return;
    await deleteLetter(id);
    setLetters((l) => l.filter((x) => x.id !== id));
  };

  const isLocked = (l: Letter) => !!(l.lockUntil && new Date(l.lockUntil + "T00:00:00") > new Date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=Brush+Script+MT&display=swap');

        .lt-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(160deg, #fff0f5 0%, #ffd6e4 50%, #ffb3cc 100%);
          padding: 2rem 1rem 4rem;
          position: relative; overflow: hidden;
        }
        .lt-page::before {
          content: '♡';
          position: fixed; top: -60px; right: -40px;
          font-size: 320px; color: rgba(255,182,210,0.2);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .lt-wrap { max-width: 720px; margin: 0 auto; }
        .lt-header {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap;
          gap: 1rem; margin-bottom: 2rem;
        }
        .lt-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300; color: #b5175e;
        }
        .lt-add-btn {
          background: linear-gradient(135deg, #ff85b3, #f04090);
          color: white; border: none; border-radius: 12px;
          padding: 0.65rem 1.3rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.3);
          transition: opacity 0.2s, transform 0.1s;
        }
        .lt-add-btn:hover { opacity: 0.88; }
        .lt-add-btn:active { transform: scale(0.97); }

        /* Grid of envelopes */
        .lt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        /* Envelope card */
        .lt-env-wrap {
          cursor: pointer;
          animation: fadeUp 0.35s ease forwards;
        }
        .lt-env-container {
          position: relative;
          width: 100%;
          padding-bottom: 72%;
          transition: transform 0.25s;
        }
        .lt-env-wrap:hover .lt-env-container { transform: translateY(-4px) scale(1.02); }

        .lt-envelope {
          position: absolute; inset: 0;
          border-radius: 8px;
          overflow: visible;
        }

        /* Envelope body */
        .lt-env-body {
          position: absolute; inset: 0;
          border-radius: 8px;
          box-shadow: 0 8px 28px rgba(220,80,130,0.2);
        }

        /* Envelope flap (top triangle) */
        .lt-env-flap {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 55%;
          transform-origin: top center;
          transition: transform 0.7s cubic-bezier(.4,0,.2,1);
          z-index: 4;
          clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
        }
        .lt-env-flap.opening {
          transform: rotateX(180deg);
        }

        /* Bottom V fold */
        .lt-env-bottom {
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 55%;
          z-index: 1;
          clip-path: polygon(0% 100%, 100% 100%, 50% 0%);
        }
        /* Left fold */
        .lt-env-left {
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 55%;
          clip-path: polygon(0% 0%, 0% 100%, 100% 50%);
          z-index: 2;
        }
        /* Right fold */
        .lt-env-right {
          position: absolute;
          top: 0; right: 0; bottom: 0; width: 55%;
          clip-path: polygon(100% 0%, 100% 100%, 0% 50%);
          z-index: 2;
        }

        /* Card inside envelope */
        .lt-inner-card {
          position: absolute;
          left: 10%; right: 10%;
          bottom: 8%;
          height: 70%;
          border-radius: 4px;
          z-index: 3;
          display: grid; place-items: center;
          transition: transform 0.7s cubic-bezier(.4,0,.2,1) 0.4s;
          transform: translateY(0);
        }
        .lt-inner-card.opening {
          transform: translateY(-85%);
        }
        .lt-inner-card-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.75rem; font-style: italic;
          text-align: center; color: #b5175e;
          padding: 0.4rem;
          line-height: 1.4;
        }
        .lt-inner-card::before {
          content: '';
          position: absolute; inset: 6px;
          border: 1.5px dashed rgba(181,23,94,0.25);
          border-radius: 3px;
        }

        /* Lock badge */
        .lt-lock-badge {
          position: absolute; top: -8px; right: -8px; z-index: 10;
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(240,64,144,0.35);
        }

        /* Letter meta below envelope */
        .lt-env-meta { margin-top: 0.75rem; padding: 0 0.25rem; }
        .lt-env-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 600; color: #b5175e;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .lt-env-from {
          font-size: 0.72rem; color: #d4669a;
          font-family: 'DM Sans', sans-serif; margin-top: 0.1rem;
        }
        .lt-env-delete {
          opacity: 0; font-size: 0.68rem; padding: 0.15rem 0.5rem;
          border-radius: 6px; background: rgba(255,180,210,0.3);
          border: none; color: #d4669a; cursor: pointer;
          transition: opacity 0.2s; margin-top: 0.3rem;
          font-family: 'DM Sans', sans-serif;
        }
        .lt-env-wrap:hover .lt-env-delete { opacity: 1; }

        /* ── READING OVERLAY ── */
        .lt-read-overlay {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center;
          background: rgba(180,20,80,0.3); backdrop-filter: blur(10px);
          padding: 1rem;
          opacity: 0; transition: opacity 0.3s;
        }
        .lt-read-overlay.visible { opacity: 1; }

        .lt-read-scene {
          position: relative;
          width: 100%; max-width: 420px;
          display: flex; flex-direction: column; align-items: center;
        }

        /* Big envelope for reading */
        .lt-big-env {
          position: relative;
          width: 100%; padding-bottom: 66%;
          margin-bottom: -2px;
        }
        .lt-big-env-body {
          position: absolute; inset: 0;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(160deg, #f04090, #ff85b3);
        }
        .lt-big-env-flap {
          position: absolute;
          top: 0; left: 0; right: 0; height: 55%;
          clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
          background: #e0306a;
          transform-origin: top center;
          transition: transform 0.8s cubic-bezier(.4,0,.2,1);
          z-index: 4;
        }
        .lt-big-env-flap.opening { transform: rotateX(180deg); }
        .lt-big-env-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; height: 55%;
          clip-path: polygon(0% 100%, 100% 100%, 50% 0%);
          background: #c0306a; z-index: 1;
        }
        .lt-big-env-left {
          position: absolute; top: 0; left: 0; bottom: 0; width: 55%;
          clip-path: polygon(0% 0%, 0% 100%, 100% 50%);
          background: #d04080; z-index: 2;
        }
        .lt-big-env-right {
          position: absolute; top: 0; right: 0; bottom: 0; width: 55%;
          clip-path: polygon(100% 0%, 100% 100%, 0% 50%);
          background: #d04080; z-index: 2;
        }

        /* The letter card that rises out */
        .lt-rising-card {
          position: relative;
          width: 92%;
          background: #fff8fb;
          border-radius: 4px;
          padding: 1.8rem 1.6rem;
          box-shadow: 0 16px 48px rgba(180,20,80,0.25);
          z-index: 5;
          transform: translateY(40px);
          opacity: 0;
          transition: transform 0.8s cubic-bezier(.4,0,.2,1) 0.5s,
                      opacity 0.6s ease 0.5s;
        }
        .lt-rising-card.opened {
          transform: translateY(-30px);
          opacity: 1;
        }
        .lt-rising-card::before {
          content: '';
          position: absolute; inset: 10px;
          border: 1.5px dashed rgba(181,23,94,0.2);
          border-radius: 2px;
          pointer-events: none;
        }

        .lt-card-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; color: #b5175e; font-weight: 600;
          text-align: center; margin-bottom: 1rem;
        }
        .lt-card-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.05rem; color: #5a2040;
          line-height: 1.8; white-space: pre-wrap;
          max-height: 40vh; overflow-y: auto;
        }
        .lt-card-body::-webkit-scrollbar { width: 4px; }
        .lt-card-body::-webkit-scrollbar-thumb { background: #ffb3cc; border-radius: 2px; }
        .lt-card-from {
          text-align: right; font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; color: #d4669a; margin-top: 1.2rem;
        }
        .lt-close-btn {
          margin-top: 0.8rem;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          color: white; border: none; border-radius: 12px;
          padding: 0.65rem 2rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.3);
          transition: opacity 0.2s;
          opacity: 0; transition: opacity 0.4s 1.1s;
        }
        .lt-close-btn.opened { opacity: 1; }

        /* Modal */
        .lt-overlay {
          position: fixed; inset: 0; z-index: 150;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          background: rgba(180,20,80,0.22); backdrop-filter: blur(8px);
        }
        .lt-modal {
          width: 100%; max-width: 440px;
          background: rgba(255,245,250,0.97);
          border: 1px solid rgba(255,180,210,0.55);
          border-radius: 28px; padding: 2rem;
          overflow-y: auto; max-height: 92vh;
          box-shadow: 0 28px 64px rgba(220,80,130,0.22);
          animation: fadeUp 0.3s ease;
        }
        .lt-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem; color: #b5175e; margin-bottom: 1.3rem;
        }
        .lt-label {
          display: block; font-size: 0.67rem; font-weight: 500;
          color: #d4669a; margin-bottom: 0.3rem;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .lt-input {
          width: 100%; background: rgba(255,200,225,0.18);
          border: 1px solid rgba(255,180,210,0.45);
          border-radius: 10px; padding: 0.65rem 0.9rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          color: #5a2040; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .lt-input:focus { border-color: #f04090; }
        .lt-input::placeholder { color: #d4a0bc; }
        .lt-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.4rem; }
        .lt-cancel {
          flex: 1; border-radius: 12px; padding: 0.75rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          background: rgba(255,200,225,0.2); border: 1px solid rgba(255,180,210,0.35);
          color: #d4669a; cursor: pointer;
        }
        .lt-save {
          flex: 2; border-radius: 12px; padding: 0.75rem;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          border: none; color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.28);
        }
        .lt-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .lt-empty { text-align: center; padding: 5rem 1rem; color: #d4669a; }
        .lt-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .lt-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; color: #b5175e; margin-bottom: 0.4rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="lt-page">
        <div className="lt-wrap">
          <div className="lt-header">
            <h2 className="lt-title">Love <em>Letter Vault</em></h2>
            <button className="lt-add-btn" onClick={() => setOpen(true)}>+ Write Letter</button>
          </div>

          {fetching ? (
            <p style={{ textAlign: "center", padding: "4rem", color: "#d4669a", fontFamily: "DM Sans, sans-serif" }}>Loading letters...</p>
          ) : letters.length === 0 ? (
            <div className="lt-empty">
              <div className="lt-empty-icon">💌</div>
              <h3>No letters yet</h3>
              <p style={{ fontSize: "0.85rem" }}>Write a letter — set a lock date for when it can be opened.</p>
            </div>
          ) : (
            <div className="lt-grid">
              {[...letters].sort((a, b) => {
                const getNum = (s: string) => parseInt(s.match(/\d+/)?.[0] || "0", 10);
                return getNum(b.month) - getNum(a.month);
              }).map((l) => {
                const locked = isLocked(l);
                // Color variations per letter
                const colors = [
                  { body: "#f04090", fold: "#c0306a", side: "#d04080" },
                  { body: "#e05080", fold: "#b02060", side: "#c03070" },
                  { body: "#ff6699", fold: "#cc3366", side: "#ee4477" },
                  { body: "#d94080", fold: "#aa1050", side: "#cc2060" },
                ];
                const c = colors[letters.indexOf(l) % colors.length];
                return (
                  <div key={l.id} className="lt-env-wrap" onClick={() => openLetter(l)}>
                    <div className="lt-env-container">
                      <div className="lt-envelope">
                        {locked && <div className="lt-lock-badge">🔒</div>}
                        <div className="lt-env-body" style={{ background: `linear-gradient(160deg, ${c.body}, #ff85b3)` }} />
                        <div className="lt-env-bottom" style={{ background: c.fold }} />
                        <div className="lt-env-left" style={{ background: c.side }} />
                        <div className="lt-env-right" style={{ background: c.side }} />
                        <div className="lt-env-flap" style={{ background: `${c.fold}` }} />
                        <div className="lt-inner-card" style={{ background: "#fff8fb" }}>
                          <div className="lt-inner-card-text">
                            {locked ? "🔒 sealed" : l.month}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lt-env-meta">
                      <div className="lt-env-month">{l.month}</div>
                      <div className="lt-env-from">from {l.from || "you"}</div>
                      <button className="lt-env-delete" onClick={(e) => remove(l.id!, e)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Reading overlay with envelope animation ── */}
      {reading && (
        <div className={`lt-read-overlay ${envelopeState !== "idle" ? "visible" : ""}`} onClick={closeLetter}>
          <div className="lt-read-scene" onClick={e => e.stopPropagation()}>
            {/* Big envelope */}
            <div className="lt-big-env">
              <div className="lt-big-env-body" />
              <div className="lt-big-env-bottom" />
              <div className="lt-big-env-left" />
              <div className="lt-big-env-right" />
              <div className={`lt-big-env-flap ${envelopeState === "opening" || envelopeState === "opened" ? "opening" : ""}`} />
            </div>

            {/* Rising letter card */}
            <div className={`lt-rising-card ${envelopeState === "opened" ? "opened" : ""}`}>
              <div className="lt-card-month">{reading.month}</div>
              <div className="lt-card-body">{reading.body}</div>
              <div className="lt-card-from">— with love, {reading.from || "you"} ♡</div>
            </div>

            <button className={`lt-close-btn ${envelopeState === "opened" ? "opened" : ""}`} onClick={closeLetter}>
              Close 💗
            </button>
          </div>
        </div>
      )}

      {/* Write Modal */}
      {open && (
        <div className="lt-overlay">
          <div className="lt-modal">
            <h3 className="lt-modal-title">Write a Letter 💌</h3>
            {[
              { label: "Month Label", name: "month", placeholder: "e.g. 4th Monthsary Letter", type: "text" },
              { label: "From", name: "from", placeholder: "Your name", type: "text" },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: "0.9rem" }}>
                <label className="lt-label">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder}
                  value={form[f.name as keyof typeof form]} onChange={handle} className="lt-input" />
              </div>
            ))}
            <div style={{ marginBottom: "0.9rem" }}>
              <label className="lt-label">Your Letter</label>
              <textarea name="body" placeholder="Dear love..." value={form.body}
                onChange={handle} rows={5} className="lt-input" style={{ resize: "none" }} />
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label className="lt-label">Lock Until (unlock date)</label>
              <input name="lockUntil" type="date" value={form.lockUntil} onChange={handle} className="lt-input" />
              <p style={{ fontSize: "0.72rem", color: "#d4a0bc", marginTop: "0.3rem", fontFamily: "DM Sans, sans-serif" }}>Leave empty to make it available immediately.</p>
            </div>
            <div className="lt-modal-actions">
              <button className="lt-cancel" onClick={() => setOpen(false)}>Cancel</button>
              <button className="lt-save" onClick={submit} disabled={loading}>
                {loading ? "Sealing..." : "Seal & Save 💌"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}