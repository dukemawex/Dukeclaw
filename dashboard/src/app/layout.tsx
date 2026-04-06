import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duke-Claw Dashboard",
  description: "Real-time telemetry dashboard for the Duke-Claw YouTube Content Factory"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-100">{children}</body>
    </html>
  );
}
