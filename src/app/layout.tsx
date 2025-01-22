import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Story Generator",
  description: "Generate stories, scripts, and audio with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
