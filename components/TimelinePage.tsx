"use client";

import { useState, useEffect, useRef } from "react";
import { addTimelineEntry, getTimelineEntries, deleteTimelineEntry, updateTimelineEntry, TimelineEntry } from "@/lib/db";
import { compressImage } from "@/lib/imageUtils";

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimelineEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  const emptyForm = { month: "", date: "", caption: "", memory: "", imageBase64: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    getTimelineEntries().then((data) => { setEntries(data); setFetching(false); });
  }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>, append = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const compressed = await Promise.all(Array.from(files).map(f => compressImage(f)));
    if (append) {
      setPreviews(p => [...p, ...compressed]);
    } else {
      setPreviews(compressed);
    }
    e.target.value = "";
  };

  const removePreview = (idx: number) => setPreviews(p => p.filter((_, i) => i !== idx));

  const openAdd = () => {
    setEditEntry(null);
    setForm(emptyForm);
    setPreviews([]);
    setOpen(true);
  };

  const openEdit = (entry: TimelineEntry) => {
    setEditEntry(entry);
    setForm({ month: entry.month, date: entry.date, caption: entry.caption, memory: entry.memory, imageBase64: entry.imageBase64 || "" });
    setPreviews(entry.images || (entry.imageBase64 ? [entry.imageBase64] : []));
    setOpen(true);
  };

  const submit = async () => {
    if (!form.month) { alert("Please enter a month label"); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        imageBase64: previews[0] || "",
        images: previews,
      };
      if (editEntry?.id) {
        await updateTimelineEntry(editEntry.id!, payload);
      } else {
        await addTimelineEntry(payload);
      }
      const data = await getTimelineEntries();
      setEntries(data);
      setOpen(false);
      setForm(emptyForm);
      setPreviews([]);
      setEditEntry(null);
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .tl-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(160deg, #fff0f5 0%, #ffd6e4 50%, #ffb3cc 100%);
          padding: 2rem 1rem 4rem;
          position: relative; overflow: hidden;
        }
        .tl-page::before {
          content: '♡';
          position: fixed; top: -60px; right: -40px;
          font-size: 320px; color: rgba(255,182,210,0.2);
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .tl-wrap { max-width: 680px; margin: 0 auto; }
        .tl-header {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap;
          gap: 1rem; margin-bottom: 2rem;
        }
        .tl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300; color: #b5175e;
        }
        .tl-btn {
          background: linear-gradient(135deg, #ff85b3, #f04090);
          color: white; border: none; border-radius: 12px;
          padding: 0.65rem 1.3rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.3);
          transition: opacity 0.2s, transform 0.1s;
        }
        .tl-btn:hover { opacity: 0.88; }
        .tl-btn:active { transform: scale(0.97); }

        /* Timeline */
        .tl-line-wrap { position: relative; padding-left: 2.2rem; }
        .tl-line {
          position: absolute; left: 9px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #ff85b3, rgba(255,133,179,0.08));
          border-radius: 2px;
        }
        .tl-entry {
          position: relative; margin-bottom: 2rem;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,180,210,0.45);
          border-radius: 22px; padding: 1.5rem;
          box-shadow: 0 6px 28px rgba(220,80,130,0.09);
          animation: fadeUp 0.35s ease forwards;
        }
        .tl-dot {
          position: absolute; left: -1.85rem; top: 1.4rem;
          color: #f04090; font-size: 1rem;
          background: rgba(255,240,248,0.9);
          border-radius: 50%; width: 22px; height: 22px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #ffb3cc;
        }
        .tl-entry-header {
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;
          margin-bottom: 0.6rem;
        }
        .tl-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 600; color: #b5175e;
        }
        .tl-date { font-size: 0.73rem; color: #d4669a; margin-top: 0.15rem; }
        .tl-actions { display: flex; gap: 0.4rem; }
        .tl-action-btn {
          font-size: 0.7rem; padding: 0.25rem 0.65rem; border-radius: 8px;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s; opacity: 0;
        }
        .tl-entry:hover .tl-action-btn { opacity: 1; }
        .tl-edit-btn { background: rgba(255,180,210,0.3); color: #c0306a; }
        .tl-remove-btn { background: rgba(255,180,210,0.2); color: #d4669a; }
        .tl-caption { font-size: 0.87rem; color: #5a2040; line-height: 1.65; margin-bottom: 0.5rem; }
        .tl-memory {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1rem; color: #e0507a;
          border-left: 2px solid #ffb3cc; padding-left: 0.75rem; margin-bottom: 0.8rem;
        }

        /* Photo grid */
        .tl-photos-single img {
          width: 100%; border-radius: 14px; display: block;
        }
        .tl-photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.5rem; margin-top: 0.75rem;
        }
        .tl-photos-grid img {
          width: 100%; aspect-ratio: 1/1;
          object-fit: cover; border-radius: 12px;
          cursor: pointer; transition: transform 0.2s;
        }
        .tl-photos-grid img:hover { transform: scale(1.03); }

        /* Lightbox */
        .tl-lightbox {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(80,0,30,0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; cursor: pointer;
        }
        .tl-lightbox img {
          max-width: 100%; max-height: 90vh;
          border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        /* Modal */
        .tl-overlay {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          background: rgba(180,20,80,0.22); backdrop-filter: blur(8px);
        }
        .tl-modal {
          width: 100%; max-width: 460px;
          background: rgba(255,245,250,0.97);
          border: 1px solid rgba(255,180,210,0.55);
          border-radius: 28px; padding: 2rem;
          overflow-y: auto; max-height: 92vh;
          box-shadow: 0 28px 64px rgba(220,80,130,0.22);
          animation: fadeUp 0.3s ease;
        }
        .tl-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem; color: #b5175e; margin-bottom: 1.3rem;
        }
        .tl-label {
          display: block; font-size: 0.67rem; font-weight: 500;
          color: #d4669a; margin-bottom: 0.3rem;
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .tl-input {
          width: 100%; background: rgba(255,200,225,0.18);
          border: 1px solid rgba(255,180,210,0.45);
          border-radius: 10px; padding: 0.65rem 0.9rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
          color: #5a2040; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .tl-input:focus { border-color: #f04090; }
        .tl-input::placeholder { color: #d4a0bc; }

        /* Photo upload area */
        .tl-photo-section { margin-bottom: 1.2rem; }
        .tl-main-upload {
          border-radius: 14px; overflow: hidden; position: relative;
          border: 2px dashed rgba(255,150,190,0.5);
          background: rgba(255,200,225,0.12);
          transition: background 0.2s; cursor: pointer;
          min-height: 120px; display: flex; align-items: center; justify-content: center;
        }
        .tl-main-upload:hover { background: rgba(255,200,225,0.25); }
        .tl-main-upload img { width: 100%; display: block; border-radius: 12px; }
        .tl-main-placeholder { text-align: center; padding: 2rem; }
        .tl-main-placeholder p { font-size: 0.85rem; color: #d4669a; font-family: 'DM Sans', sans-serif; margin-top: 0.4rem; }

        .tl-thumb-row {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; align-items: center;
        }
        .tl-thumb {
          position: relative; width: 60px; height: 60px;
        }
        .tl-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 10px; border: 1.5px solid rgba(255,180,210,0.5);
        }
        .tl-thumb-remove {
          position: absolute; top: -5px; right: -5px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #f04090; border: none; color: white;
          font-size: 0.6rem; cursor: pointer; display: flex;
          align-items: center; justify-content: center; line-height: 1;
        }
        .tl-add-more-btn {
          width: 60px; height: 60px; border-radius: 10px;
          border: 2px dashed rgba(255,150,190,0.6);
          background: rgba(255,200,225,0.15);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; color: #d4669a; font-size: 1.2rem;
          font-family: 'DM Sans', sans-serif; transition: background 0.2s;
        }
        .tl-add-more-btn:hover { background: rgba(255,200,225,0.3); }
        .tl-add-more-btn span { font-size: 0.55rem; margin-top: 0.1rem; }

        .tl-modal-actions { display: flex; gap: 0.75rem; margin-top: 1.4rem; }
        .tl-cancel {
          flex: 1; border-radius: 12px; padding: 0.75rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          background: rgba(255,200,225,0.2); border: 1px solid rgba(255,180,210,0.35);
          color: #d4669a; cursor: pointer; transition: background 0.2s;
        }
        .tl-cancel:hover { background: rgba(255,200,225,0.38); }
        .tl-save {
          flex: 2; border-radius: 12px; padding: 0.75rem;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          border: none; color: white; font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          box-shadow: 0 4px 14px rgba(240,64,144,0.28);
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

      <LightboxProvider>
        {({ lightbox, openLightbox }) => (
          <>
            <div className="tl-page">
              <div className="tl-wrap">
                <div className="tl-header">
                  <h2 className="tl-title">Our <em>Timeline</em></h2>
                  <button className="tl-btn" onClick={openAdd}>+ Add Memory</button>
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
                    {entries.map((entry) => {
                      const imgs = entry.images?.length ? entry.images : entry.imageBase64 ? [entry.imageBase64] : [];
                      return (
                        <div key={entry.id} className="tl-entry">
                          <div className="tl-dot">♡</div>
                          <div className="tl-entry-header">
                            <div>
                              <div className="tl-month">{entry.month}</div>
                              {entry.date && (
                                <div className="tl-date">
                                  {new Date(entry.date + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                                </div>
                              )}
                            </div>
                            <div className="tl-actions">
                              <button className="tl-action-btn tl-edit-btn" onClick={() => openEdit(entry)}>✏️ Edit</button>
                              <button className="tl-action-btn tl-remove-btn" onClick={() => remove(entry.id!)}>Remove</button>
                            </div>
                          </div>
                          {entry.caption && <p className="tl-caption">{entry.caption}</p>}
                          {entry.memory && <p className="tl-memory">{entry.memory}</p>}
                          {imgs.length === 1 && (
                            <div className="tl-photos-single" style={{ marginTop: "0.75rem" }}>
                              <img src={imgs[0]} alt="Memory" onClick={() => openLightbox(imgs[0])} style={{ cursor: "pointer", borderRadius: "14px" }} />
                            </div>
                          )}
                          {imgs.length > 1 && (
                            <div className="tl-photos-grid">
                              {imgs.map((src, i) => (
                                <img key={i} src={src} alt={`Memory ${i + 1}`} onClick={() => openLightbox(src)} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div className="tl-lightbox" onClick={() => openLightbox(null)}>
                <img src={lightbox} alt="Full view" onClick={e => e.stopPropagation()} />
              </div>
            )}
          </>
        )}
      </LightboxProvider>

      {/* Modal */}
      {open && (
        <div className="tl-overlay">
          <div className="tl-modal">
            <h3 className="tl-modal-title">{editEntry ? "Edit Memory ✏️" : "Add a Memory 📸"}</h3>

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

            {/* Photo upload */}
            <div className="tl-photo-section">
              <label className="tl-label">Photos</label>

              {/* Main photo slot */}
              <div className="tl-main-upload" onClick={() => previews.length === 0 && fileRef.current?.click()}>
                {previews.length > 0 ? (
                  <img src={previews[0]} alt="Main" />
                ) : (
                  <div className="tl-main-placeholder">
                    <div style={{ fontSize: "2rem" }}>📷</div>
                    <p>Click to add a photo</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImage(e, false)} />

              {/* Thumbnails + add more */}
              {previews.length > 0 && (
                <div className="tl-thumb-row">
                  {previews.map((src, i) => (
                    <div key={i} className="tl-thumb">
                      <img src={src} alt={`Photo ${i + 1}`} />
                      <button className="tl-thumb-remove" onClick={() => removePreview(i)}>×</button>
                    </div>
                  ))}
                  <button className="tl-add-more-btn" onClick={() => addMoreRef.current?.click()}>
                    <span style={{ fontSize: "1.4rem" }}>+</span>
                    <span>photo</span>
                  </button>
                  <input ref={addMoreRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleImage(e, true)} />
                </div>
              )}
            </div>

            <div className="tl-modal-actions">
              <button className="tl-cancel" onClick={() => { setOpen(false); setPreviews([]); setEditEntry(null); }}>Cancel</button>
              <button className="tl-save" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : editEntry ? "Save Changes ♡" : "Save Memory ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Lightbox state helper
function LightboxProvider({ children }: { children: (ctx: { lightbox: string | null; openLightbox: (src: string | null) => void }) => React.ReactNode }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return <>{children({ lightbox, openLightbox: setLightbox })}</>;
}