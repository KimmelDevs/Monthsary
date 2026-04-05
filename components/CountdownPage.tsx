"use client";

import { useEffect, useState } from "react";

const START_DATE = "2023-11-06";
const PARTNER_NAME = "Jaynesa";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getNextMonthsary() {
  const start = new Date(START_DATE + "T00:00:00");
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

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [info, setInfo] = useState({ months: 0, next: new Date() });

  useEffect(() => {
    const { months, next } = getNextMonthsary();
    setInfo({ months, next });
    const tick = () => {
      const diff = next.getTime() - Date.now();
      if (diff <= 0) { setInfo(getNextMonthsary()); return; }
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
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const nextLabel = info.next.toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const timerBoxes = timeLeft
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
      ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
        .cd-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(160deg, #fff0f5 0%, #ffd6e4 50%, #ffb3cc 100%);
          padding: 2.5rem 1rem;
          position: relative;
          overflow: hidden;
        }
        .cd-page::before {
          content: '♡';
          position: fixed; top: -60px; right: -40px;
          font-size: 320px; color: rgba(255,182,210,0.25);
          pointer-events: none; line-height: 1;
          font-family: serif;
        }
        .cd-page::after {
          content: '♡';
          position: fixed; bottom: -80px; left: -60px;
          font-size: 280px; color: rgba(255,150,190,0.18);
          pointer-events: none; line-height: 1;
          font-family: serif;
        }
        .cd-hero {
          max-width: 640px; margin: 0 auto 1.5rem;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 28px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 8px 48px rgba(220,80,130,0.12), 0 2px 8px rgba(220,80,130,0.08);
        }
        .cd-badge {
          display: inline-block;
          background: linear-gradient(135deg, #ff85b3, #f472a0);
          color: white;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1rem;
          padding: 0.35rem 1.2rem;
          border-radius: 20px;
          margin-bottom: 1.2rem;
          box-shadow: 0 2px 12px rgba(244,114,160,0.35);
        }
        .cd-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 300;
          color: #b5175e;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }
        .cd-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #d4669a;
          margin-bottom: 2rem;
        }
        .cd-timer {
          display: flex; gap: 0.75rem;
          justify-content: center; flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .cd-box {
          min-width: 76px;
          padding: 1rem 1.2rem;
          text-align: center;
          border-radius: 20px;
          background: linear-gradient(145deg, #ff85b3, #f04090);
          box-shadow: 0 4px 18px rgba(240,64,144,0.3);
          transition: transform 0.1s;
        }
        .cd-box:hover { transform: translateY(-2px); }
        .cd-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem; font-weight: 600;
          color: white; line-height: 1;
          text-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .cd-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem; color: rgba(255,255,255,0.85);
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-top: 0.35rem;
        }
        .cd-date-card {
          max-width: 640px; margin: 0 auto;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 20px;
          padding: 1.2rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 20px rgba(220,80,130,0.08);
        }
        .cd-date-icon {
          width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #ff85b3, #f04090);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 3px 12px rgba(240,64,144,0.3);
        }
        .cd-date-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; color: #b5175e; margin-bottom: 0.2rem;
        }
        .cd-date-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem; color: #d4669a;
        }
      `}</style>

      <div className="cd-page">
        <div className="cd-hero">
          <div className="cd-badge">
            Together for {info.months} month{info.months !== 1 ? "s" : ""} 🌸
          </div>

          <h1 className="cd-title">
            Our next <em>monthsary</em> is coming
          </h1>
          <p className="cd-sub">
            Celebrating {info.months + 1} months with {PARTNER_NAME} 💕
          </p>

          <div className="cd-timer">
            {timerBoxes.map(({ val, label }) => (
              <div key={label} className="cd-box">
                <div className="cd-num">{val}</div>
                <div className="cd-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-date-card">
          <div className="cd-date-icon">📅</div>
          <div>
            <div className="cd-date-title">{info.months + 1} Monthsary Date</div>
            <div className="cd-date-label">{nextLabel}</div>
          </div>
        </div>
      </div>
    </>
  );
}