import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── COUPLE PROFILE ──
export interface CoupleProfile {
  id?: string;
  name1: string;
  name2: string;
  startDate: string;
  partnerMsg: string;
}

export async function saveProfile(data: Omit<CoupleProfile, "id">) {
  const snap = await getDocs(collection(db, "profile"));
  if (!snap.empty) {
    await updateDoc(doc(db, "profile", snap.docs[0].id), { ...data });
    return snap.docs[0].id;
  }
  const ref = await addDoc(collection(db, "profile"), data);
  return ref.id;
}

export async function getProfile(): Promise<CoupleProfile | null> {
  const snap = await getDocs(collection(db, "profile"));
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<CoupleProfile, "id">) };
}

// ── TIMELINE ──
export interface TimelineEntry {
  id?: string;
  month: string;
  date: string;
  caption: string;
  memory: string;
  imageBase64?: string;
  createdAt?: unknown;
}

export async function addTimelineEntry(data: Omit<TimelineEntry, "id">) {
  return addDoc(collection(db, "timeline"), { ...data, createdAt: serverTimestamp() });
}

export async function getTimelineEntries(): Promise<TimelineEntry[]> {
  const q = query(collection(db, "timeline"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimelineEntry, "id">) }));
}

export async function deleteTimelineEntry(id: string) {
  return deleteDoc(doc(db, "timeline", id));
}

// ── LETTERS ──
export interface Letter {
  id?: string;
  month: string;
  from: string;
  body: string;
  lockUntil: string;
  createdAt?: unknown;
}

export async function addLetter(data: Omit<Letter, "id">) {
  return addDoc(collection(db, "letters"), { ...data, createdAt: serverTimestamp() });
}

export async function getLetters(): Promise<Letter[]> {
  const q = query(collection(db, "letters"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Letter, "id">) }));
}

export async function deleteLetter(id: string) {
  return deleteDoc(doc(db, "letters", id));
}

// ── JOURNAL ──
export interface JournalEntry {
  id?: string;
  month: string;
  best: string;
  funny: string;
  newThing: string;
  note: string;
  createdAt?: unknown;
}

export async function addJournalEntry(data: Omit<JournalEntry, "id">) {
  return addDoc(collection(db, "journal"), { ...data, createdAt: serverTimestamp() });
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const q = query(collection(db, "journal"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JournalEntry, "id">) }));
}

export async function deleteJournalEntry(id: string) {
  return deleteDoc(doc(db, "journal", id));
}
