"use client";

/**
 * I18nWrapper — client component that provides i18n context to the whole app.
 * Renders as a fragment so it doesn't affect DOM structure or styling.
 */

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n-context";

export default function I18nWrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
