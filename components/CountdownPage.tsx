"use client";

import { useEffect, useState } from "react";
import type { CoupleProfile } from "@/lib/db";

interface Props {
  profile: CoupleProfile;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextMonthsary(startDate: string) {
  const start = new Date(startDate + "T00:00:00");
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;
  months = Math.max(0, months);

  const next = new Date(start);
  next.setMonth(start.getMonth() + months + 1);
  return { months, next };
}

export default function CountdownPage({ profile }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [info, setInfo] = useState({ months: 0, next: new Date() });

  useEffect(() => {
    const { months, next } = getNextMonthsary(profile.startDate);
    setInfo({ months, next });

    const tick = () => {
      const diff = next.getTime() - Date.now();
      if (diff <= 0) {
        const r = getNextMonthsary(profile.startDate);
        setInfo(r);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [profile.startDate]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const nextLabel = info.next.toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 stagger">
      {/* Hero Card */}
      <div
        className="card p-8 text-center mb-6 relative overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(201,112,110,0.12)" }}
      >
        <div
          className="absolute -top-4 right-4 font-display text-9xl select-none pointer-events-none"
          style={{ color: "var(--blush)", opacity: 0.2, lineHeight: 1 }}
        >
          ♡
        </div>

        <span
          className="inline-block font-display text-base px-4 py-1 rounded-full mb-4"
          style={{ background: "linear-gradient(135deg,var(--blush),var(--soft))", color: "var(--wine)", border: "1px solid var(--blush)", fontStyle: "italic" }}
        >
          Together for {info.months} month{info.months !== 1 ? "s" : ""} 🌸
        </span>

        <h1 className="font-display mb-1" style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 300, color: "var(--wine)", lineHeight: 1.2 }}>
          Our next <em>monthsary</em> is coming
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          Celebrating {info.months + 1} months with {profile.name2} 💕
        </p>

        {/* Timer */}
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          {(timeLeft
            ? [
                { val: pad(timeLeft.days), label: "Days" },
                { val: pad(timeLeft.hours), label: "Hours" },
                { val: pad(timeLeft.minutes), label: "Minutes" },
                { val: pad(timeLeft.seconds), label: "Seconds" },
              ]
            : [
                { val: "--", label: "Days" },
                { val: "--", label: "Hours" },
                { val: "--", label: "Minutes" },
                { val: "--", label: "Seconds" },
              ]
          ).map(({ val, label }) => (
            <div
              key={label}
              className="min-w-[72px] py-3 px-4 text-center rounded-2xl"
              style={{ background: "var(--soft)", border: "1px solid var(--border)" }}
            >
              <div className="font-display" style={{ fontSize: "2.6rem", fontWeight: 600, color: "var(--wine)", lineHeight: 1 }}>
                {val}
              </div>
              <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Partner message */}
        {profile.partnerMsg && (
          <div
            className="relative rounded-2xl p-5 text-left"
            style={{ background: "linear-gradient(135deg,rgba(242,196,196,0.25),rgba(249,236,232,0.4))", border: "1px solid var(--blush)" }}
          >
            <span
              className="absolute font-display text-6xl leading-none"
              style={{ color: "var(--blush)", top: "1rem", left: "1rem" }}
            >
              "
            </span>
            <p
              className="font-display text-lg pl-6 leading-relaxed"
              style={{ fontStyle: "italic", color: "var(--wine)" }}
            >
              {profile.partnerMsg}
            </p>
            <p className="text-right text-xs mt-2" style={{ color: "var(--muted)" }}>
              — with love, {profile.name2} ♡
            </p>
          </div>
        )}
      </div>

      {/* Next date info */}
      <div
        className="card p-5 flex items-center gap-4"
        style={{ boxShadow: "0 4px 20px rgba(122,46,46,0.06)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg,var(--rose),var(--wine))" }}
        >
          📅
        </div>
        <div>
          <h4 className="font-display text-lg" style={{ color: "var(--wine)" }}>
            {info.months + 1} Monthsary Date
          </h4>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{nextLabel}</p>
        </div>
      </div>
    </div>
  );
}
