"use client";

import { useEffect, useState, useRef } from "react";

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

function isActuallyMonthsaryToday() {
  const start = new Date(START_DATE + "T00:00:00");
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return now.getDate() === start.getDate() && months > 0;
}

function getCelebrationKey() {
  const now = new Date();
  return `monthsary_celebrated_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
}

function hasCelebratedToday() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getCelebrationKey()) === "1";
}

function markCelebratedToday() {
  if (typeof window === "undefined") return;
  localStorage.setItem(getCelebrationKey(), "1");
}

// Balloon component data
const BALLOON_COLORS = ["#ff6b9d", "#ff85b3", "#f04090", "#ff4777", "#ffb3cc", "#e91e8c", "#ff69b4"];

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [info, setInfo] = useState({ months: 0, next: new Date() });
  const [celebrating, setCelebrating] = useState(false);
  const [balloons, setBalloons] = useState<{ id: number; x: number; color: string; size: number; delay: number; dur: number; emoji: boolean }[]>([]);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; rot: number; delay: number }[]>([]);
  const celebratedRef = useRef(false);

  useEffect(() => {
    const { months, next } = getNextMonthsary();
    setInfo({ months, next });

    // Check if today IS the monthsary already OR already celebrated today
    if (isActuallyMonthsaryToday() || hasCelebratedToday()) {
      triggerCelebration();
      return;
    }

    const tick = () => {
      const diff = next.getTime() - Date.now();
      if (diff <= 0) {
        if (!celebratedRef.current) {
          celebratedRef.current = true;
          triggerCelebration();
        }
        setInfo(getNextMonthsary());
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
  }, []);

  const triggerCelebration = () => {
    setCelebrating(true);
    markCelebratedToday();

    // Generate balloons
    const newBalloons = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 2 + (i * 4.2) % 96,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      size: 36 + Math.random() * 28,
      delay: Math.random() * 3,
      dur: 4 + Math.random() * 4,
      emoji: i % 5 === 0,
    }));
    setBalloons(newBalloons);

    // Generate confetti
    const newConfetti = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      rot: Math.random() * 360,
      delay: Math.random() * 4,
    }));
    setConfetti(newConfetti);
  };

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
          pointer-events: none; line-height: 1; font-family: serif;
        }
        .cd-page::after {
          content: '♡';
          position: fixed; bottom: -80px; left: -60px;
          font-size: 280px; color: rgba(255,150,190,0.18);
          pointer-events: none; line-height: 1; font-family: serif;
        }

        /* ── CELEBRATION ── */
        .cd-celebrate-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          overflow: hidden;
        }

        /* Balloon */
        @keyframes floatUp {
          0%   { transform: translateY(110vh) rotate(-8deg); opacity: 0; }
          10%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-20vh) rotate(8deg); opacity: 0; }
        }
        @keyframes sway {
          0%,100% { margin-left: 0; }
          50%      { margin-left: 18px; }
        }

        .cd-balloon {
          position: absolute;
          bottom: -60px;
          animation: floatUp linear infinite, sway ease-in-out infinite;
        }
        .cd-balloon svg { display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)); }
        .cd-balloon-string {
          width: 1px; height: 40px;
          background: rgba(0,0,0,0.15);
          margin: 0 auto;
        }

        /* Confetti */
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .cd-confetti {
          position: absolute;
          top: -10px;
          width: 8px; height: 8px;
          border-radius: 2px;
          animation: confettiFall linear infinite;
        }

        /* Sparkle burst */
        @keyframes sparkle {
          0%   { transform: scale(0) rotate(0deg); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: scale(1.8) rotate(180deg); opacity: 0; }
        }
        .cd-sparkle {
          position: fixed;
          pointer-events: none;
          font-size: 2rem;
          animation: sparkle 1.2s ease-out forwards;
        }

        /* ── HERO ── */
        .cd-hero {
          max-width: 640px; margin: 0 auto 1.5rem;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 28px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 8px 48px rgba(220,80,130,0.12);
          position: relative; z-index: 1;
        }

        /* Celebration hero override */
        .cd-hero.is-celebrating {
          background: rgba(255,240,250,0.85);
          border-color: rgba(240,64,144,0.4);
          box-shadow: 0 8px 60px rgba(240,64,144,0.25);
        }

        .cd-badge {
          display: inline-block;
          background: linear-gradient(135deg, #ff85b3, #f472a0);
          color: white;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1rem;
          padding: 0.35rem 1.2rem; border-radius: 20px;
          margin-bottom: 1.2rem;
          box-shadow: 0 2px 12px rgba(244,114,160,0.35);
        }
        .cd-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 300; color: #b5175e;
          line-height: 1.2; margin-bottom: 0.4rem;
        }
        .cd-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem; color: #d4669a;
          margin-bottom: 2rem;
        }

        /* Celebration title */
        @keyframes pulseScale {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        .cd-celebrate-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 7vw, 3.5rem);
          font-weight: 600; font-style: italic;
          color: #b5175e; line-height: 1.15;
          margin-bottom: 0.6rem;
          animation: pulseScale 2s ease-in-out infinite;
        }
        .cd-celebrate-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; color: #e0507a;
          margin-bottom: 1.5rem;
        }
        .cd-heart-row {
          font-size: 1.8rem; letter-spacing: 0.3rem;
          margin-bottom: 1.5rem;
          animation: pulseScale 1.5s ease-in-out infinite;
        }
        .cd-months-big {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(4rem, 15vw, 7rem);
          font-weight: 600; line-height: 1;
          background: linear-gradient(135deg, #f04090, #ff85b3, #b5175e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.2rem;
        }
        .cd-months-label {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.4rem;
          color: #d4669a; margin-bottom: 1.5rem;
        }

        /* Timer */
        .cd-timer {
          display: flex; gap: 0.75rem;
          justify-content: center; flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .cd-box {
          min-width: 76px; padding: 1rem 1.2rem;
          text-align: center; border-radius: 20px;
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

        /* Date card */
        .cd-date-card {
          max-width: 640px; margin: 0 auto;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,180,210,0.5);
          border-radius: 20px; padding: 1.2rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 4px 20px rgba(220,80,130,0.08);
          position: relative; z-index: 1;
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

        {/* ── Celebration particles ── */}
        {celebrating && (
          <div className="cd-celebrate-bg">
            {/* Balloons */}
            {balloons.map((b) => (
              <div
                key={b.id}
                className="cd-balloon"
                style={{
                  left: `${b.x}%`,
                  animationDuration: `${b.dur}s, ${b.dur * 0.6}s`,
                  animationDelay: `${b.delay}s, ${b.delay}s`,
                }}
              >
                {b.emoji ? (
                  <div style={{ fontSize: b.size * 0.8, lineHeight: 1 }}>
                    {["💗", "💕", "🌸", "✨", "💖"][b.id % 5]}
                  </div>
                ) : (
                  <svg width={b.size} height={b.size * 1.2} viewBox="0 0 40 50">
                    <ellipse cx="20" cy="20" rx="18" ry="20" fill={b.color} opacity="0.9" />
                    <ellipse cx="14" cy="12" rx="5" ry="4" fill="white" opacity="0.3" />
                    <polygon points="20,40 17,44 23,44" fill={b.color} opacity="0.8" />
                  </svg>
                )}
                <div className="cd-balloon-string" />
              </div>
            ))}

            {/* Confetti */}
            {confetti.map((c) => (
              <div
                key={c.id}
                className="cd-confetti"
                style={{
                  left: `${c.x}%`,
                  background: c.color,
                  transform: `rotate(${c.rot}deg)`,
                  animationDuration: `${2.5 + Math.random() * 2}s`,
                  animationDelay: `${c.delay}s`,
                  borderRadius: c.id % 3 === 0 ? "50%" : "2px",
                  width: c.id % 4 === 0 ? "5px" : "8px",
                  height: c.id % 4 === 0 ? "14px" : "8px",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Hero card ── */}
        <div className={`cd-hero${celebrating ? " is-celebrating" : ""}`}>
          {celebrating ? (
            <>
              <div className="cd-heart-row">💗 💕 💗 💕 💗</div>
              <div className="cd-celebrate-title">
                Happy {info.months}th Monthsary!
              </div>
              <div className="cd-months-big">{info.months}</div>
              <div className="cd-months-label">months of us 🌸</div>
              <div className="cd-celebrate-sub">
                {info.months} beautiful months with {PARTNER_NAME} 💕<br />
                <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  Every single day has been worth it ♡
                </span>
              </div>
              <div className="cd-heart-row" style={{ fontSize: "1.4rem" }}>
                ✨ 🌸 💌 🌸 ✨
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Date card — only show when not celebrating */}
        {!celebrating && (
          <div className="cd-date-card">
            <div className="cd-date-icon">📅</div>
            <div>
              <div className="cd-date-title">{info.months + 1} Monthsary Date</div>
              <div className="cd-date-label">{nextLabel}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}