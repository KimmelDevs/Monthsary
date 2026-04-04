"use client";

import { useState, useEffect } from "react";
import { getProfile, CoupleProfile } from "@/lib/db";
import SetupModal from "@/components/SetupModal";
import Navbar from "@/components/Navbar";
import CountdownPage from "@/components/CountdownPage";
import TimelinePage from "@/components/TimelinePage";
import LettersPage from "@/components/LettersPage";
import JournalPage from "@/components/JournalPage";

type Tab = "countdown" | "timeline" | "letters" | "journal";

export default function MainApp() {
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [tab, setTab] = useState<Tab>("countdown");

  const fetchProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (!p) setShowSetup(true);
    } catch (err) {
      console.error("Firebase error:", err);
      setShowSetup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSetupDone = async () => {
    setShowSetup(false);
    await fetchProfile();
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

  return (
    <>
      {showSetup && <SetupModal onDone={onSetupDone} />}
      {profile && (
        <div className="relative z-10 min-h-screen">
          <Navbar
            active={tab}
            onChange={setTab}
            name2={profile.name2}
            onEditProfile={() => setShowSetup(true)}
          />
          <main>
            {tab === "countdown" && <CountdownPage profile={profile} />}
            {tab === "timeline" && <TimelinePage />}
            {tab === "letters" && <LettersPage />}
            {tab === "journal" && <JournalPage />}
          </main>
        </div>
      )}
    </>
  );
}
