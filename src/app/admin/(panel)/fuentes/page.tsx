import type { Metadata } from "next";
import SourcesAdmin from "@/components/admin/sources-admin";
import { getCategoriesAdmin, getScraperRuns, getSources } from "@/lib/db";

export const metadata: Metadata = {
  title: "Fuentes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = getSources();
  const categories = getCategoriesAdmin();
  const runs = getScraperRuns(20);

  return <SourcesAdmin sources={sources} categories={categories} runs={runs} />;
}
