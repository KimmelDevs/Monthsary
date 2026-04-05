"use client";

import { useState, useRef } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "@/lib/firebase";

interface Props {
  onAuth: () => void;
}

const MINI_ROSES = [
  { x: 5, y: 8, size: 40 }, { x: 88, y: 5, size: 35 },
  { x: 15, y: 75, size: 38 }, { x: 80, y: 80, size: 42 },
  { x: 50, y: 3, size: 30 }, { x: 3, y: 45, size: 36 },
  { x: 92, y: 40, size: 32 }, { x: 25, y: 90, size: 34 },
  { x: 70, y: 88, size: 38 }, { x: 60, y: 92, size: 28 },
  { x: 40, y: 95, size: 32 }, { x: 10, y: 30, size: 30 },
  { x: 85, y: 60, size: 36 }, { x: 55, y: 5, size: 28 },
  { x: 95, y: 20, size: 30 },
];

function MiniRose({ size, bloomed }: { size: number; bloomed: boolean }) {
  const count = 12;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => {
        const n = i + 1;
        const baseScale = 0.04 + i * 0.04;
        const bloomScale = baseScale * 2.8;
        return (
          <div key={i} style={{
            position: "absolute",
            left: "50%", marginLeft: `-${size / 2}px`, marginTop: `-${size / 2}px`,
            transformOrigin: "bottom center",
            height: "100%", width: "100%",
            zIndex: count - i,
            transition: "transform 1.4s cubic-bezier(.4,0,.2,1)",
            transitionDelay: `${i * 0.03}s`,
            transform: bloomed
              ? `scale(${bloomScale},${bloomScale}) rotate(${n * 80 + n * 3}deg)`
              : `scale(${baseScale},${baseScale}) rotate(${n * 80}deg)`,
          }}>
            <div style={{
              position: "absolute", width: "100%", height: "100%",
              backgroundImage: "radial-gradient(ellipse at bottom left, #c0395a 0%, #e8607a 70%, #f9a0b4 95%)",
              borderTopLeftRadius: "50% 35%", borderBottomRightRadius: "35% 50%",
              borderTopRightRadius: "45%", borderBottomLeftRadius: "10%",
              transform: "rotate(-45deg)",
            }} />
          </div>
        );
      })}
    </div>
  );
}

export default function AuthPage({ onAuth }: Props) {
  const [bloomed, setBloomed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const auth = getAuth(app);

  const handleBloom = () => {
    setBloomed(true);
    audioRef.current?.play().catch(() => {});
  };

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      onAuth();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const PETAL_COUNT = 30;
  const getPetalStyle = (index: number): React.CSSProperties => {
    const n = index + 1;
    const baseScale = 0.02 + index * 0.02;
    const bloomScale = baseScale * 3;
    return {
      position: "absolute",
      left: "50%", marginLeft: "-50px", marginTop: "-50px",
      transformOrigin: "bottom center",
      height: "100%", width: "100%",
      zIndex: PETAL_COUNT - index,
      transition: "transform 1.2s cubic-bezier(.4,0,.2,1)",
      transitionDelay: `${index * 0.02}s`,
      transform: bloomed
        ? `scale(${bloomScale},${bloomScale}) rotate(${n * 80 + n * 3}deg)`
        : `scale(${baseScale},${baseScale}) rotate(${n * 80}deg)`,
    };
  };

  return (
    <div style={{
      margin: 0, padding: 0,
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(135deg, #f9a0b4 0%, #f472a0 40%, #e8607a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=DM+Sans:wght@300;400;500&display=swap');
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.2);
          border: none; border-radius: 12px;
          padding: 0.75rem 1rem; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; color: white; outline: none; box-sizing: border-box;
          transition: background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.6); }
        .auth-input:focus { background: rgba(255,255,255,0.32); }
        .auth-btn {
          width: 100%; background: rgba(255,255,255,0.28);
          border: none; border-radius: 12px; padding: 0.8rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
          color: white; cursor: pointer; transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.03em;
        }
        .auth-btn:hover { background: rgba(255,255,255,0.4); }
        .auth-btn:active { transform: scale(0.97); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <audio ref={audioRef} loop>
        <source src="/song.mp3" type="audio/mp3" />
      </audio>

      {/* Mini background roses */}
      {MINI_ROSES.map((r, i) => (
        <div key={i} style={{
          position: "absolute", left: `${r.x}%`, top: `${r.y}%`,
          transform: "translate(-50%, -50%)", opacity: 0.55, zIndex: 0,
        }}>
          <MiniRose size={r.size} bloomed={bloomed} />
        </div>
      ))}

      {/* Main layout — rose left, form right */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center",
        justifyContent: "center",
        gap: "0px",
        width: "100%", maxWidth: "760px",
        padding: "2rem",
      }}>

        {/* Rose column */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          transition: "transform 1s cubic-bezier(.4,0,.2,1), margin 1s cubic-bezier(.4,0,.2,1)",
          transform: bloomed ? "translateX(-60px)" : "translateX(0)",
          marginRight: bloomed ? "3.5rem" : "0",
          flexShrink: 0,
        }}>
          {/* Big rose — expands on click */}
          <div
            onClick={!bloomed ? handleBloom : undefined}
            style={{
              position: "relative",
              transition: "width 1s cubic-bezier(.4,0,.2,1), height 1s cubic-bezier(.4,0,.2,1)",
              width: bloomed ? "160px" : "100px",
              height: bloomed ? "160px" : "100px",
              cursor: bloomed ? "default" : "pointer",
            }}
          >
            {Array.from({ length: PETAL_COUNT }).map((_, i) => (
              <div key={i} style={getPetalStyle(i)}>
                <div style={{
                  position: "absolute", width: "100%", height: "100%",
                  backgroundImage: "radial-gradient(ellipse at bottom left, #D24150 0%, #FF5064 70%, #FF91A5 95%)",
                  borderTopLeftRadius: "50% 35%", borderBottomRightRadius: "35% 50%",
                  borderTopRightRadius: "45%", borderBottomLeftRadius: "10%",
                  transform: "rotate(-45deg)",
                }} />
              </div>
            ))}

            {/* Text inside rose */}
            <div style={{
              position: "absolute", width: "220px",
              top: "50%", left: "50%",
              transform: "translate(-25%, -50%)",
              zIndex: 100,
              opacity: bloomed ? 1 : 0,
              transition: "opacity 1s 0.8s",
              pointerEvents: "none", textAlign: "center",
            }}>
              <span style={{
                fontFamily: "'Great Vibes', cursive", fontSize: "28px",
                color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.35)", lineHeight: 1.4,
              }}>
                Kimmel & Jaynesa ✨
              </span>
            </div>
          </div>

          {/* Prompt below rose */}
          <span style={{
            fontFamily: "'Great Vibes', cursive", color: "white",
            fontSize: "1.8rem", fontWeight: "lighter", marginTop: "1rem",
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
            opacity: bloomed ? 0 : 1,
            transition: "opacity 0.4s",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            Touch the rose
          </span>
        </div>

        {/* Login form — slides in from right */}
        <div style={{
          width: "280px",
          opacity: bloomed ? 1 : 0,
          transform: bloomed ? "translateX(0)" : "translateX(40px)",
          transition: "opacity 0.8s 0.7s, transform 0.8s 0.7s",
          pointerEvents: bloomed ? "all" : "none",
          flexShrink: 0,
        }}>
          <div style={{ marginBottom: "1.8rem" }}>
            <div style={{
              fontFamily: "'Great Vibes', cursive", fontSize: "2.4rem",
              color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              lineHeight: 1.2,
            }}>
              our monthsary
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
              color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em",
              textTransform: "uppercase", marginTop: "0.9rem",
              padding: "0.35rem 0.9rem",
              background: "rgba(255,255,255,0.18)",
              borderRadius: "20px", display: "inline-block",
            }}>
              Nov 6, 2023 · For you, always
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block", fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.68rem", fontWeight: 500, color: "rgba(255,255,255,0.9)",
              marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Email</label>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="auth-input"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{
              display: "block", fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.68rem", fontWeight: 500, color: "rgba(255,255,255,0.9)",
              marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} className="auth-input"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>

          {error && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
              color: "white", background: "rgba(0,0,0,0.2)",
              borderRadius: "10px", padding: "0.5rem 0.8rem", marginBottom: "1rem",
            }}>{error}</p>
          )}

          <button className="auth-btn" onClick={handleLogin}
            disabled={loading || !email || !password}>
            {loading ? "Please wait..." : "Log In ♡"}
          </button>
        </div>
      </div>
    </div>
  );
}