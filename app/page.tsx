import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { buildShareModel } from "@/lib/share-model";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * For a shared ?r= link, produce a score-aware title + a dynamic og:image
 * (the /api/og route) so the link previews the score on X/LinkedIn. The token
 * carries no PII (just answer digits). No token → inherit the default metadata
 * from the root layout.
 */
export function generateMetadata({ searchParams }: PageProps): Metadata {
  const raw = searchParams.r;
  const token = typeof raw === "string" ? raw : undefined;
  const model = token ? buildShareModel(token) : null;
  if (!token || !model || !model.valid) return {};

  const ogImage = `/api/og?r=${encodeURIComponent(token)}`;
  const title = `I scored ${model.overallScore}/100 on the Growth Health Score`;
  const description = `${model.overallLabel} growth engine across the 5 AARRR stages. See the breakdown and take your own free 3-minute audit.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
