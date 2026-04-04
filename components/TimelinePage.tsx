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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <h2 className="font-display text-4xl font-light" style={{ color: "var(--wine)" }}>
          Our <em>Timeline</em>
        </h2>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Add Memory
        </button>
      </div>

      {/* Timeline list */}
      {fetching ? (
        <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>Loading memories...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--muted)" }}>
          <div className="text-5xl mb-4">📸</div>
          <h3 className="font-display text-2xl mb-2" style={{ color: "var(--wine)" }}>No memories yet</h3>
          <p className="text-sm">Start by adding your first monthsary memory!</p>
        </div>
      ) : (
        <div className="relative pl-8 stagger">
          {/* Vertical line */}
          <div
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(to bottom, var(--blush), transparent)" }}
          />
          {entries.map((entry) => (
            <div key={entry.id} className="relative mb-6 card p-5 animate-fade-up group">
              {/* Heart dot */}
              <div
                className="absolute -left-6 top-5 text-base"
                style={{ color: "var(--rose)" }}
              >♡</div>

              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <div className="font-display text-xl font-semibold" style={{ color: "var(--wine)" }}>
                    {entry.month}
                  </div>
                  {entry.date && (
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {new Date(entry.date + "T12:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(entry.id!)}
                  className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg transition-all"
                  style={{ color: "var(--muted)", background: "var(--soft)" }}
                >
                  Remove
                </button>
              </div>

              {entry.caption && (
                <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text)" }}>{entry.caption}</p>
              )}
              {entry.memory && (
                <p
                  className="font-display text-base italic pl-3 mt-1"
                  style={{ color: "var(--rose)", borderLeft: "2px solid var(--blush)" }}
                >
                  {entry.memory}
                </p>
              )}
              {entry.imageBase64 && (
                <img
                  src={entry.imageBase64}
                  alt="Memory"
                  className="w-full rounded-xl mt-3 object-cover max-h-56"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,26,26,0.5)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-7 animate-fade-up overflow-y-auto max-h-[90vh]"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-display text-2xl mb-5" style={{ color: "var(--wine)" }}>Add a Memory 📸</h3>

            {[
              { label: "Month Label", name: "month", placeholder: "e.g. 3rd Monthsary", type: "text" },
              { label: "Date", name: "date", placeholder: "", type: "date" },
            ].map((f) => (
              <div key={f.name} className="mb-3">
                <label className="label">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name as keyof typeof form]} onChange={handle} className="input-field" />
              </div>
            ))}

            <div className="mb-3">
              <label className="label">Caption</label>
              <textarea name="caption" placeholder="What happened this month?" value={form.caption} onChange={handle} rows={2} className="input-field resize-none" />
            </div>
            <div className="mb-3">
              <label className="label">Favorite Memory</label>
              <input name="memory" type="text" placeholder="A little highlight..." value={form.memory} onChange={handle} className="input-field" />
            </div>

            {/* Image upload */}
            <div className="mb-5">
              <label className="label">Photo (stored as base64)</label>
              <div
                className="rounded-xl p-4 text-center cursor-pointer transition-all"
                style={{ border: "2px dashed var(--border)", background: "var(--soft)" }}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full max-h-40 object-cover rounded-lg" />
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>Click to upload photo 📷</p>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl py-3 text-sm font-medium transition-all"
                style={{ background: "var(--soft)", border: "1px solid var(--border)", color: "var(--muted)" }}
                onClick={() => { setOpen(false); setPreview(null); }}
              >
                Cancel
              </button>
              <button className="btn-primary flex-[2]" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Save Memory ♡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
