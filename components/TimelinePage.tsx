"use client";

import { useState, useEffect, useRef } from "react";
import { addTimelineEntry, getTimelineEntries, deleteTimelineEntry, TimelineEntry } from "@/lib/db";
import { compressImage } from "@/lib/imageUtils";

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ month: "", date: "", caption: "", memory: "", imageBase64: "" });

  useEffect(() => {
    getTimelineEntries().then((data) => { setEntries(data); setFetching(false); });
  }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await compressImage(file);
    setPreview(b64);
    setForm((f) => ({ ...f, imageBase64: b64 }));
  };

  const submit = async () => {
    if (!form.month) { alert("Please enter a month label"); return; }
    setLoading(true);
    try {
      await addTimelineEntry({ ...form });
      const data = await getTimelineEntries();
      setEntries(data);
      setOpen(false);
      setForm({ month: "", date: "", caption: "", memory: "", imageBase64: "" });
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Error saving entry.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this memory?")) return;
    await deleteTimelineEntry(id);
    setEntries((e) => e.filter((x) => x.id !== id));
  };

  return (
    <>
      <style>{`
        .tl-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(160deg, #fff0f5 0%, #ffd6e4 50%, #ffb3cc 100%);
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }
        .tl-page::before {
          content: '♡';
          position: fixed; top: -60px; right: -40px;
          font-size: 320px; color: rgba(255,182,210,0.2);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .tl-wrap { max-width: 720px; margin: 0 auto; }
        .tl-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          margin-bottom: 2rem;
        }
        .tl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300; color: #b5175e;
        }
        .tl-btn {
          background: linear-gradient(135deg, #ff85b3, #f04090);
          color: white; border: none; border-radius: 12px;
          padding: 0.65rem 1.3rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.35);
          transition: opacity 0.2s, transform 0.1s;
        }
        .tl-btn:hover { opacity: 0.88; }
        .tl-btn:active { transform: scale(0.97); }

        .tl-line-wrap { position: relative; padding-left: 2rem; }
        .tl-line {
          position: absolute; left: 8px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #ff85b3, rgba(255,133,179,0.1));
          border-radius: 2px;
        }
        .tl-entry {
          position: relative; margin-bottom: 1.5rem;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 20px; padding: 1.4rem;
          box-shadow: 0 4px 20px rgba(220,80,130,0.08);
          animation: fadeUp 0.35s ease forwards;
        }
        .tl-dot {
          position: absolute; left: -1.75rem; top: 1.3rem;
          color: #f04090; font-size: 1.1rem;
        }
        .tl-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 600; color: #b5175e;
        }
        .tl-date { font-size: 0.75rem; color: #d4669a; margin-top: 0.15rem; }
        .tl-caption { font-size: 0.88rem; color: #5a2040; line-height: 1.6; margin-top: 0.5rem; }
        .tl-memory {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1rem; color: #e0507a;
          border-left: 2px solid #ffb3cc;
          padding-left: 0.75rem; margin-top: 0.6rem;
        }
        .tl-remove-btn {
          opacity: 0; font-size: 0.72rem;
          padding: 0.25rem 0.6rem; border-radius: 8px;
          background: rgba(255,180,210,0.3); border: none;
          color: #d4669a; cursor: pointer; transition: opacity 0.2s;
        }
        .tl-entry:hover .tl-remove-btn { opacity: 1; }

        /* Modal */
        .tl-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          background: rgba(180,20,80,0.25); backdrop-filter: blur(8px);
        }
        .tl-modal {
          width: 100%; max-width: 440px;
          background: rgba(255,245,250,0.97);
          border: 1px solid rgba(255,180,210,0.6);
          border-radius: 28px; padding: 1.8rem;
          overflow-y: auto; max-height: 90vh;
          box-shadow: 0 24px 60px rgba(220,80,130,0.2);
          animation: fadeUp 0.3s ease;
        }
        .tl-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; color: #b5175e; margin-bottom: 1.2rem;
        }
        .tl-label {
          display: block; font-size: 0.68rem; font-weight: 500;
          color: #d4669a; margin-bottom: 0.3rem;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .tl-input {
          width: 100%; background: rgba(255,200,225,0.2);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 10px; padding: 0.65rem 0.9rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          color: #5a2040; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .tl-input:focus { border-color: #f04090; }
        .tl-input::placeholder { color: #d4a0bc; }
        .tl-upload {
          border-radius: 14px; padding: 1rem; text-align: center;
          cursor: pointer;
          border: 2px dashed rgba(255,150,190,0.6);
          background: rgba(255,200,225,0.15);
          transition: background 0.2s;
        }
        .tl-upload:hover { background: rgba(255,200,225,0.3); }
        .tl-cancel {
          flex: 1; border-radius: 12px; padding: 0.75rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          background: rgba(255,200,225,0.2);
          border: 1px solid rgba(255,180,210,0.4);
          color: #d4669a; cursor: pointer; transition: background 0.2s;
        }
        .tl-cancel:hover { background: rgba(255,200,225,0.4); }
        .tl-save {
          flex: 2; border-radius: 12px; padding: 0.75rem;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          border: none; color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.3);
          transition: opacity 0.2s;
        }
        .tl-save:hover { opacity: 0.88; }
        .tl-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .tl-empty { text-align: center; padding: 5rem 1rem; color: #d4669a; }
        .tl-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .tl-empty h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; color: #b5175e; margin-bottom: 0.4rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="tl-page">
        <div className="tl-wrap">
          <div className="tl-header">
            <h2 className="tl-title">Our <em>Timeline</em></h2>
            <button className="tl-btn" onClick={() => setOpen(true)}>+ Add Memory</button>
          </div>

          {fetching ? (
            <p style={{ textAlign: "center", padding: "4rem", color: "#d4669a", fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem" }}>
              Loading memories...
            </p>
          ) : entries.length === 0 ? (
            <div className="tl-empty">
              <div className="tl-empty-icon">📸</div>
              <h3>No memories yet</h3>
              <p style={{ fontSize: "0.85rem" }}>Start by adding your first monthsary memory!</p>
            </div>
          ) : (
            <div className="tl-line-wrap">
              <div className="tl-line" />
              {entries.map((entry) => (
                <div key={entry.id} className="tl-entry">
                  <div className="tl-dot">♡</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div className="tl-month">{entry.month}</div>
                      {entry.date && (
                        <div className="tl-date">
                          {new Date(entry.date + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      )}
                    </div>
                    <button className="tl-remove-btn" onClick={() => remove(entry.id!)}>Remove</button>
                  </div>
                  {entry.caption && <p className="tl-caption">{entry.caption}</p>}
                  {entry.memory && <p className="tl-memory">{entry.memory}</p>}
                  {entry.imageBase64 && (
                    <img src={entry.imageBase64} alt="Memory" style={{ width: "100%", borderRadius: "12px", marginTop: "0.75rem", objectFit: "cover", maxHeight: "220px" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="tl-overlay">
          <div className="tl-modal">
            <h3 className="tl-modal-title">Add a Memory 📸</h3>

            {[
              { label: "Month Label", name: "month", placeholder: "e.g. 3rd Monthsary", type: "text" },
              { label: "Date", name: "date", placeholder: "", type: "date" },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: "0.9rem" }}>
                <label className="tl-label">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder}
                  value={form[f.name as keyof typeof form]} onChange={handle} className="tl-input" />
              </div>
            ))}

            <div style={{ marginBottom: "0.9rem" }}>
              <label className="tl-label">Caption</label>
              <textarea name="caption" placeholder="What happened this month?" value={form.caption}
                onChange={handle} rows={2} className="tl-input" style={{ resize: "none" }} />
            </div>
            <div style={{ marginBottom: "0.9rem" }}>
              <label className="tl-label">Favorite Memory</label>
              <input name="memory" type="text" placeholder="A little highlight..."
                value={form.memory} onChange={handle} className="tl-input" />
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <label className="tl-label">Photo</label>
              <div className="tl-upload" onClick={() => fileRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "10px" }} />
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "#d4669a", fontFamily: "DM Sans, sans-serif" }}>Click to upload photo 📷</p>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="tl-cancel" onClick={() => { setOpen(false); setPreview(null); }}>Cancel</button>
              <button className="tl-save" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Save Memory ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}