import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth Health Score — AARRR Growth Audit Tool",
  description:
    "Answer 15 questions across the 5 AARRR stages. Get a 0–100 growth health score, identify your top bottlenecks, and receive ICE-prioritized experiments to fix them. Free, open-source startup growth diagnostic.",
  keywords: [
    "AARRR growth score",
    "startup growth diagnostic",
    "growth health check",
    "growth framework",
    "growth hacking",
    "acquisition activation retention revenue referral",
    "ICE framework",
    "growth experiment prioritization",
    "SaaS growth metrics",
    "open source growth tool",
  ],
  authors: [{ url: "https://growthackers.io" }],
  openGraph: {
    title: "Growth Health Score — AARRR Growth Audit Tool",
    description:
      "Open-source startup growth diagnostic. Score your growth engine across Acquisition, Activation, Retention, Revenue, and Referral — then get a prioritized experiment roadmap.",
    type: "website",
    url: "https://growth-score.growthackers.io",
    siteName: "Growth Health Score",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growth Health Score — AARRR Growth Audit Tool",
    description:
      "Diagnose your growth engine in 3 minutes. Score each AARRR stage 0–100, find your bottlenecks, get experiments.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* Subtle gradient background */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(92,104,245,0.12) 0%, transparent 100%)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
