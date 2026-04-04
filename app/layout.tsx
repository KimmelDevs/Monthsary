import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Monthsary",
  description: "A love app for every month together 💕",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
