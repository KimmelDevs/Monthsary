"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "@/lib/firebase";
import { getProfile, CoupleProfile } from "@/lib/db";
import AuthPage from "@/components/AuthPage";
import Navbar from "@/components/Navbar";
import CountdownPage from "@/components/CountdownPage";
import TimelinePage from "@/components/TimelinePage";
import LettersPage from "@/components/LettersPage";
import JournalPage from "@/components/JournalPage";

type Tab = "countdown" | "timeline" | "letters" | "journal";

export default function MainApp() {
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("countdown");

  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthed(true);
        const p = await getProfile();
        setProfile(p);
      } else {
        setAuthed(false);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAuth = async () => {
    const p = await getProfile();
    setProfile(p);
    setAuthed(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthed(false);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-5xl mb-3" style={{ color: "var(--wine)", fontStyle: "italic" }}>
            our monthsary
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading your love story...</p>
        </div>
      </div>
    );
  }

  if (!authed) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="relative z-10 min-h-screen">
      <Navbar
        active={tab}
        onChange={setTab}
        name2={profile?.name2 ?? ""}
        onLogout={handleLogout}
      />
      <main>
        {profile && tab === "countdown" && <CountdownPage profile={profile} />}
        {tab === "timeline" && <TimelinePage />}
        {tab === "letters" && <LettersPage />}
        {tab === "journal" && <JournalPage />}
      </main>
    </div>
  );
}
