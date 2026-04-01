import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sessionlens",
  description: "Local-first observability for Claude Code sessions and agent workflows.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
