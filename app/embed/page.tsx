import type { Metadata } from "next";
import EmbedClient from "@/components/EmbedClient";

// The embeddable widget surface. Self-contained, no backend; safe to iframe on
// any site via public/embed.js. Not indexed (it's a fragment, not a page).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedPage() {
  return <EmbedClient />;
}
