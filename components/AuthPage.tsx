"use client";

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import app from "@/lib/firebase";
import { saveProfile, getProfile } from "@/lib/db";

const ALLOWED_USERS: Record<string, { name: string; partner: string }> = {
  "kimmel@monthsary.com": { name: "Kimmel Delector", partner: "Jaynesa Perol" },
  "jaynesa@monthsary.com": { name: "Jaynesa Perol", partner: "Kimmel Delector" },
};

interface Props {
  onAuth: () => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth(app);

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

  const handleSignup = async () => {
    setError(""); setLoading(true);
    const key = email.trim().toLowerCase();
    const user = ALLOWED_USERS[key];
    if (!user) {
      setError("This email is not allowed to sign up.");
      setLoading(false);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, key, password);
      // Auto-create profile if not exists
      const existing = await getProfile();
      if (!existing) {
        await saveProfile({
          name1: user.name,
          name2: user.partner,
          startDate: "2023-11-06",
          partnerMsg: "",
        });
      }
      onAuth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("email-already-in-use")) setError("Account already exists. Please log in.");
      else if (msg.includes("weak-password")) setError("Password must be at least 6 characters.");
      else setError("Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 80% 10%, rgba(242,196,196,0.4) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 10% 80%, rgba(201,112,110,0.15) 0%, transparent 70%),
          var(--cream)
        `,
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 animate-fade-up"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 32px 80px rgba(122,46,46,0.15)" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="font-display text-4xl mb-1"
            style={{ color: "var(--wine)", fontStyle: "italic", fontWeight: 600 }}
          >
            our monthsary
          </div>
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
            Kimmel & Jaynesa · Nov 6, 2023
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl mb-6 p-1"
          style={{ background: "var(--soft)", border: "1px solid var(--border)" }}
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "var(--wine)" : "var(--muted)",
                boxShadow: mode === m ? "0 1px 4px rgba(122,46,46,0.1)" : "none",
                border: "none", cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="mb-3">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
          />
        </div>
        <div className="mb-5">
          <label className="label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())}
          />
        </div>

        {error && (
          <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: "var(--wine)", background: "rgba(201,112,110,0.1)" }}>
            {error}
          </p>
        )}

        <button
          className="btn-primary w-full"
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={loading || !email || !password}
        >
          {loading ? "Please wait..." : mode === "login" ? "Log In ♡" : "Create Account"}
        </button>

        {mode === "signup" && (
          <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
            Only Kimmel & Jaynesa's emails are allowed.
          </p>
        )}
      </div>
    </div>
  );
}
