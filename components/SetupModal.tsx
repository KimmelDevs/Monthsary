"use client";

import { useState } from "react";
import { saveProfile } from "@/lib/db";

interface Props {
  onDone: () => void;
}

export default function SetupModal({ onDone }: Props) {
  const [form, setForm] = useState({ name1: "", name2: "", startDate: "", partnerMsg: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name1 || !form.name2 || !form.startDate) {
      alert("Please fill in both names and your start date!");
      return;
    }
    setLoading(true);
    try {
      await saveProfile(form);
      onDone();
    } catch (err) {
      alert("Error saving profile. Check your Firebase config.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(42,26,26,0.65)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 animate-fade-up"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 32px 80px rgba(122,46,46,0.2)" }}
      >
        <h2 className="font-display text-3xl mb-1" style={{ color: "var(--wine)", fontStyle: "italic" }}>
          Our Little Corner 🌸
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Set up your monthsary space — just the two of you.
        </p>

        {[
          { label: "Your Name", name: "name1", placeholder: "e.g. Mia", type: "text" },
          { label: "Partner's Name", name: "name2", placeholder: "e.g. Carlo", type: "text" },
          { label: "Anniversary Start Date", name: "startDate", placeholder: "", type: "date" },
        ].map((f) => (
          <div key={f.name} className="mb-4">
            <label className="label">{f.label}</label>
            <input
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.name as keyof typeof form]}
              onChange={handle}
              className="input-field"
            />
          </div>
        ))}

        <div className="mb-6">
          <label className="label">A Message from Your Partner 💌</label>
          <textarea
            name="partnerMsg"
            placeholder="Type something sweet here..."
            value={form.partnerMsg}
            onChange={handle}
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button className="btn-primary w-full" onClick={submit} disabled={loading}>
          {loading ? "Saving..." : "Begin Our Story ♡"}
        </button>
      </div>
    </div>
  );
}
